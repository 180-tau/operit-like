import { LLMProvider, LLMRequest, LLMStreamEvent, LLMConfig } from '@operit/shared';

/** Anthropic Messages API provider. */
export class AnthropicProvider implements LLMProvider {
  readonly type = 'anthropic' as const;

  constructor(private readonly config: LLMConfig) {}

  async *streamChat(req: LLMRequest): AsyncGenerator<LLMStreamEvent> {
    const url = `${this.config.baseUrl ?? 'https://api.anthropic.com'}/v1/messages`;
    const system = req.messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n');
    const messages = req.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role === 'tool' ? 'user' : m.role, content: m.content }));

    const body: Record<string, unknown> = {
      model: this.config.model,
      max_tokens: req.maxTokens ?? this.config.maxTokens ?? 4096,
      messages,
      stream: true,
    };
    if (system) body.system = system;
    if (req.tools?.length) body.tools = req.tools;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey ?? '',
        'anthropic-version': '2023-06-01',
        ...this.config.customHeaders,
      },
      body: JSON.stringify(body),
      signal: req.signal,
    });

    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => '');
      yield { type: 'error', message: `Anthropic ${res.status}: ${text.slice(0, 500)}` };
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

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
          if (!data || data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
              yield { type: 'delta', text: json.delta.text };
            } else if (json.type === 'content_block_delta' && json.delta?.type === 'input_json_delta') {
              yield { type: 'tool_call', id: '', name: '', argsJson: json.delta.partial_json ?? '' };
            } else if (json.type === 'message_start' && json.message?.usage) {
              // noop
            } else if (json.type === 'message_delta' && json.usage) {
              // noop
            }
          } catch {
            // ignore partial
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
    yield { type: 'done' };
  }
}
