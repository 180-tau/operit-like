import { Injectable, Logger } from '@nestjs/common';
import { LLMMessage, StreamEvent } from '@operit/shared';
import { ConversationService } from '../conversation/conversation.service.js';
import { LlmService } from '../llm/llm.service.js';
import { CharacterService } from '../character/character.service.js';
import { planSegments } from './segment-reply.util.js';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly conversations: ConversationService,
    private readonly llm: LlmService,
    private readonly characters: CharacterService,
  ) {}

  /**
   * Stream a reply for the given user message.
   * Supports character-bound conversations + segmented reply delivery.
   */
  async *streamReply(userId: string, conversationId: string, content: string): AsyncGenerator<StreamEvent> {
    const conv = await this.conversations.get(userId, conversationId);

    const userMsg = await this.conversations.saveMessage({ conversationId, role: 'user', content });
    const history = await this.conversations.listMessages(userId, conversationId);
    const messages: LLMMessage[] = history.slice(-20).map((m) => ({
      role: m.role === 'user' ? 'user' : m.role === 'assistant' ? 'assistant' : 'system',
      content: m.content,
    }));

    // Character card injection (Phase 3)
    let cardName = '';
    if (conv.characterCardId) {
      try {
        const card = await this.characters.get(userId, conv.characterCardId);
        cardName = card.name;
        messages.unshift({ role: 'system', content: this.characters.buildSystemPrompt(card) });
      } catch {
        this.logger.warn(`character card not found: ${conv.characterCardId}`);
      }
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
        const segments = [
          '你好呀～👋 我是 Operit-like 助手。',
          '当前处于**模拟模式**（未配置 LLM_API_KEY）。',
          '配置模型后即可接入真实 AI 对话。',
        ];
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
        const full: string[] = [];
        for await (const ev of provider.streamChat({ messages, stream: true })) {
          if (ev.type === 'delta') {
            full.push(ev.text);
            yield { type: 'token', delta: ev.text };
          } else if (ev.type === 'reasoning') {
            yield { type: 'reasoning', delta: ev.text };
          } else if (ev.type === 'error') {
            yield { type: 'error', message: ev.message };
          }
        }
        replyContent = full.join('');
        // Segmented delivery after full generation (human-like rhythm)
        const plan = planSegments(replyContent);
        for (let i = 0; i < plan.segments.length; i++) {
          yield { type: 'segment', index: i, text: plan.segments[i], delayMs: plan.delaysMs[i] };
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
        await this.conversations.saveMessage({
          conversationId,
          role: 'assistant',
          content: replyContent,
          segments: plan.segments,
        });
      }
      await this.conversations.touch(conversationId);
    }
  }
}
