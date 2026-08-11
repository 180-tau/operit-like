import { LLMProvider, LLMRequest, LLMStreamEvent, LLMConfig, LLMCompleteResponse } from '@operit/shared';

export class AnthropicProvider implements LLMProvider {
  readonly type = 'anthropic' as const;
  constructor(private readonly config: LLMConfig) {}

  private buildBody(req: LLMRequest): Record<string, unknown> {
    const system = req.messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n');
    const messages = req.messages.filter((m) => m.role !== 'system').map((m) => ({ role: m.role === 'tool' ? 'user' : m.role, content: m.content }));
    const body: Record<string, unknown> = { model: this.config.model, max_tokens: req.maxTokens ?? this.config.maxTokens ?? 4096, messages, stream: req.stream ?? true };
    if (system) body.system = system;
    if (req.tools?.length) body.tools = req.tools;
    return body;
  }

  async completeChat(req: LLMRequest): Promise<LLMCompleteResponse> {
    const url = `${this.config.baseUrl ?? 'https://api.anthropic.com'}/v1/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': this.config.apiKey ?? '', 'anthropic-version': '2023-06-01', ...this.config.customHeaders },
      body: JSON.stringify(this.buildBody({ ...req, stream: false })),
      signal: req.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Anthropic ${res.status}: ${text.slice(0, 300)}`);
    }
    const json = (await res.json()) as { content?: { type?: string; text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number } };
    return { content: json.content?.map((c) => c.text ?? '').join('') ?? '', usage: json.usage ? { inputTokens: json.usage.input_tokens, outputTokens: json.usage.output_tokens } : undefined };
  }

  async *streamChat(req: LLMRequest): AsyncGenerator<LLMStreamEvent> {
    const url = `${this.config.baseUrl ?? 'https://api.anthropic.com'}/v1/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': this.config.apiKey ?? '', 'anthropic-version': '2023-06-01', ...this.config.customHeaders },
      body: JSON.stringify(this.buildBody(req)),
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
            if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') yield { type: 'delta', text: json.delta.text };
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
