// LLM provider abstraction — unified interface across providers.

export type LLMProviderType =
  | 'openai-compatible'
  | 'anthropic'
  | 'gemini';

export interface LLMConfig {
  id: string;
  name: string;
  provider: LLMProviderType;
  baseUrl?: string;
  apiKey?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  customHeaders?: Record<string, string>;
  supportsToolCall?: boolean;
  supportsVision?: boolean;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string;
  toolCalls?: LLMToolCall[];
}

export interface LLMToolCall {
  id: string;
  name: string;
  arguments: string;
}

export interface LLMToolDef {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: unknown;
  };
}

export interface LLMRequest {
  messages: LLMMessage[];
  tools?: LLMToolDef[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  signal?: AbortSignal;
}

export type LLMStreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'tool_call'; id: string; name: string; argsJson: string }
  | { type: 'tool_call_end' }
  | { type: 'reasoning'; text: string }
  | { type: 'done'; usage?: { inputTokens?: number; outputTokens?: number } }
  | { type: 'error'; message: string };

export interface LLMCompleteResponse {
  content: string;
  toolCalls?: LLMToolCall[];
  usage?: { inputTokens?: number; outputTokens?: number };
}

export interface LLMProvider {
  readonly type: LLMProviderType;
  streamChat(req: LLMRequest): AsyncGenerator<LLMStreamEvent>;
  completeChat(req: LLMRequest): Promise<LLMCompleteResponse>;
}
