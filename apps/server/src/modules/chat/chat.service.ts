import { Injectable, Logger } from '@nestjs/common';
import { LLMMessage, StreamEvent } from '@operit/shared';
import { ConversationService } from '../conversation/conversation.service.js';
import { LlmService } from '../llm/llm.service.js';
import { CharacterService } from '../character/character.service.js';
import { MemoryService } from '../memory/memory.service.js';
import { ToolsService } from '../tools/tools.service.js';
import { PackageService } from '../packages/package.service.js';
import { planSegments } from './segment-reply.util.js';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly MAX_TOOL_ROUNDS = 3;

  constructor(
    private readonly conversations: ConversationService,
    private readonly llm: LlmService,
    private readonly characters: CharacterService,
    private readonly memories: MemoryService,
    private readonly tools: ToolsService,
    private readonly packages: PackageService,
  ) {}

  async *streamReply(userId: string, conversationId: string, content: string): AsyncGenerator<StreamEvent> {
    const conv = await this.conversations.get(userId, conversationId);
    const userMsg = await this.conversations.saveMessage({ conversationId, role: 'user', content });
    const history = await this.conversations.listMessages(userId, conversationId);
    const messages: LLMMessage[] = history.slice(-20).map((m) => ({
      role: m.role === 'user' ? 'user' : m.role === 'assistant' ? 'assistant' : 'system',
      content: m.content,
    }));

    let cardId: string | null = null;
    let cardName = '';
    let card: Awaited<ReturnType<CharacterService['get']>> | null = null;
    if (conv.characterCardId) {
      try {
        card = await this.characters.get(userId, conv.characterCardId);
        cardId = conv.characterCardId;
        cardName = card.name;
        messages.unshift({ role: 'system', content: this.characters.buildSystemPrompt(card) });
      } catch {
        this.logger.warn(`character card not found: ${conv.characterCardId}`);
      }
    }

    try {
      const mems = await this.memories.list(userId, cardId ?? undefined, 10);
      if (mems.length) {
        messages.unshift({ role: 'system', content: `Persistent memories you should remember:\n${mems.map((m) => `- [${m.type}] ${m.content}`).join('\n')}` });
      }
    } catch (err) {
      this.logger.warn('memory injection failed', err);
    }

    yield { type: 'meta', conversationId, messageId: userMsg.id, model: 'default', character: cardName || undefined };

    let replyContent = '';
    try {
      let provider;
      try {
        provider = this.llm.get('default');
      } catch {
        provider = null;
      }

      if (!provider) {
        const segments = ['你好呀～👋 我是 Operit-like 助手。', '当前处于**模拟模式**（未配置 LLM_API_KEY）。', '配置模型后即可接入真实 AI 对话。'];
        yield { type: 'typing', state: 'start' };
        for (const seg of segments) {
          yield { type: 'segment', index: segments.indexOf(seg), text: seg, delayMs: 600 };
          for (const ch of seg) yield { type: 'token', delta: ch };
          replyContent += seg;
        }
        yield { type: 'typing', state: 'end' };
        yield { type: 'done' };
      } else {
        yield { type: 'typing', state: 'start' };
        const loopMessages: LLMMessage[] = [...messages];
        let toolUsed = false;

        const enabledNames = this.packages.enabledToolNames();
        const enabledDefs = this.tools
          .listTools()
          .filter((t) => enabledNames.includes(t.name))
          .map((t) => ({ type: 'function' as const, function: { name: t.name, description: t.description, parameters: t.parameters } }));

        for (let round = 0; round < this.MAX_TOOL_ROUNDS; round++) {
          const resp = await provider.completeChat({ messages: loopMessages, tools: enabledDefs });
          if (resp.toolCalls && resp.toolCalls.length > 0) {
            toolUsed = true;
            yield { type: 'tool_call', id: '', name: `round ${round + 1}`, input: resp.toolCalls.map((t) => t.name) };
            loopMessages.push({ role: 'assistant', content: '', toolCalls: resp.toolCalls.map((t) => ({ id: t.id, name: t.name, arguments: t.arguments })) });
            for (const tc of resp.toolCalls) {
              let parsed: Record<string, unknown> = {};
              try {
                parsed = JSON.parse(tc.arguments || '{}');
              } catch {
                parsed = {};
              }
              yield { type: 'tool_call', id: tc.id, name: tc.name, input: parsed };
              const r = await this.packages.invokeProxy(tc.name, parsed);
              yield { type: 'tool_result', id: tc.id, output: r.data, error: r.error };
              loopMessages.push({ role: 'tool', toolCallId: tc.id, content: JSON.stringify(r) });
            }
            continue;
          }
          replyContent = resp.content ?? '';
          break;
        }
        if (!replyContent) replyContent = toolUsed ? '（工具执行完成，未生成文本回复）' : '';

        const plan = planSegments(replyContent);
        for (let i = 0; i < plan.segments.length; i++) {
          yield { type: 'segment', index: i, text: plan.segments[i]!, delayMs: plan.delaysMs[i] ?? 500 };
        }
        yield { type: 'typing', state: 'end' };
        yield { type: 'done', usage: undefined };
      }
    } catch (err) {
      this.logger.error(err);
      yield { type: 'error', message: String(err) };
    } finally {
      if (replyContent) {
        const plan = planSegments(replyContent);
        await this.conversations.saveMessage({ conversationId, role: 'assistant', content: replyContent, segments: plan.segments });
      }
      try {
        const facts = this.memories.extractFacts(content);
        for (const fact of facts) {
          await this.memories.create({ userId, content: `用户提到：${fact}`, type: 'fact', characterCardId: cardId ?? undefined });
        }
      } catch (err) {
        this.logger.warn('auto memory failed', err);
      }
      if (cardId && card) {
        const mood = this.characters.detectUserMood(content);
        await this.characters.updateRelationship(userId, cardId, { deltaIntimacy: 1, userMood: mood });
      }
      await this.conversations.touch(conversationId);
    }
  }
}
