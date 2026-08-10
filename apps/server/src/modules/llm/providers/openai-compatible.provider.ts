import { LLMProvider, LLMRequest, LLMStreamEvent, LLMConfig } from '@operit/shared';

/**
 * OpenAI-compatible chat completions provider (works with DeepSeek/Qwen/OpenRouter/any OpenAI-style endpoint).
 */
export class OpenAICompatibleProvider implements LLMProvider {
  readonly type = 'openai-compatible' as const;

  constructor(private readonly config: LLMConfig) {}

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.apiKey ?? ''}`,
      ...this.config.customHeaders,
    };
  }

  private buildBody(req: LLMRequest): Record<string, unknown> {
    return {
      model: this.config.model,
      messages: req.messages.map((m) => {
        if (m.role === 'tool') {
          return { role: 'tool', tool_call_id: m.toolCallId, content: m.content };
        }
        if (m.role === 'assistant' && m.toolCalls?.length) {
          return {
            role: 'assistant',
            content: m.content || null,
            tool_calls: m.toolCalls.map((tc) => ({
              id: tc.id,
              type: 'function',
              function: { name: tc.name, arguments: tc.arguments },
            })),
          };
        }
        return { role: m.role, content: m.content };
      }),
      tools: req.tools,
      temperature: req.temperature ?? this.config.temperature,
      max_tokens: req.maxTokens ?? this.config.maxTokens,
      stream: req.stream ?? true,
    };
  }

  async *streamChat(req: LLMRequest): AsyncGenerator<LLMStreamEvent> {
    const url = `${this.config.baseUrl ?? 'https://api.openai.com/v1'}/chat/completions`;
    const res = await fetch(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(this.buildBody(req)),
      signal: req.signal,
    });

    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => '');
      yield { type: 'error', message: `LLM ${res.status}: ${text.slice(0, 500)}` };
      return;
    }

    // Parse SSE stream
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let usage: { inputTokens?: number; outputTokens?: number } | undefined;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta;
            if (delta?.content) yield { type: 'delta', text: delta.content };
            if (delta?.reasoning_content) yield { type: 'reasoning', text: delta.reasoning_content };
            if (delta?.tool_calls) {
              for (const tc of delta.tool_calls) {
                if (tc.function?.name) {
                  yield { type: 'tool_call', id: tc.id ?? crypto.randomUUID(), name: tc.function.name, argsJson: tc.function.arguments ?? '' };
                } else {
                  // Streaming args continuation — append to last call
                  yield { type: 'tool_call', id: tc.id ?? '', name: '', argsJson: tc.function?.arguments ?? '' };
                }
              }
            }
            if (json.choices?.[0]?.finish_reason === 'tool_calls') {
              yield { type: 'tool_call_end' };
            }
            usage = json.usage ?? usage;
          } catch {
            // partial JSON line — ignore
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    yield { type: 'done', usage };
  }
}
