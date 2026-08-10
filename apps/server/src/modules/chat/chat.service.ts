import { Injectable, Logger } from '@nestjs/common';
import { LLMMessage, StreamEvent } from '@operit/shared';
import { ConversationService } from '../conversation/conversation.service.js';
import { LlmService } from '../llm/llm.service.js';
import { Message } from '../conversation/message.entity.js';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly conversations: ConversationService,
    private readonly llm: LlmService,
  ) {}

  /**
   * Stream a reply for the given user message.
   * Yields SSE events. Falls back to mock streaming when no LLM is configured.
   */
  async *streamReply(userId: string, conversationId: string, content: string): AsyncGenerator<StreamEvent> {
    const conv = await this.conversations.get(userId, conversationId);

    // Persist user message
    const userMsg = await this.conversations.saveMessage({
      conversationId,
      role: 'user',
      content,
    });

    const history = await this.conversations.listMessages(userId, conversationId);
    const messages: LLMMessage[] = history.slice(-20).map((m: Message) => ({
      role: m.role === 'user' ? 'user' : m.role === 'assistant' ? 'assistant' : 'system',
      content: m.content,
    }));

    // System prompt (MVP, character engine will extend in Phase 3)
    if (conv.characterCardId) {
      messages.unshift({ role: 'system', content: 'You are the character bound to this conversation. Stay in character.' });
    }

    yield { type: 'meta', conversationId, messageId: userMsg.id, model: 'default' };

    try {
      let provider;
      try {
        provider = this.llm.get('default');
      } catch {
        provider = null;
      }

      if (!provider) {
        yield* this.mockStream();
      } else {
        const full: string[] = [];
        for await (const ev of provider.streamChat({ messages, stream: true })) {
          if (ev.type === 'delta') {
            full.push(ev.text);
            yield { type: 'token', delta: ev.text };
          } else if (ev.type === 'reasoning') {
            yield { type: 'reasoning', delta: ev.text };
          } else if (ev.type === 'error') {
            yield { type: 'error', message: ev.message };
          } else if (ev.type === 'done') {
            yield { type: 'done', usage: ev.usage };
          }
        }
        await this.conversations.saveMessage({
          conversationId,
          role: 'assistant',
          content: full.join(''),
        });
      }
    } catch (err) {
      this.logger.error(err);
      yield { type: 'error', message: String(err) };
    } finally {
      await this.conversations.touch(conversationId);
    }
  }

  /** Mock streaming reply — lets you test SSE without an LLM key. */
  private async *mockStream(): AsyncGenerator<StreamEvent> {
    const segments = [
      '你好呀～👋 我是 Operit-like 助手。',
      '当前处于**模拟模式**（未配置 LLM_API_KEY）。',
      '在 .env 中配置模型后即可接入真实 AI 对话。',
      '接下来将开发：工具系统、角色卡引擎、分段分句回复。',
    ];
    yield { type: 'typing', state: 'start' };
    for (const seg of segments) {
      yield { type: 'segment', index: segments.indexOf(seg), text: seg, delayMs: 600 };
      for (const ch of seg) {
        yield { type: 'token', delta: ch };
      }
    }
    yield { type: 'typing', state: 'end' };
    yield { type: 'done' };
  }
}
