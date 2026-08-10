// Chat message & streaming protocol (SSE events shared with RN/Web clients).

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  /** For role === 'tool'. */
  toolCallId?: string;
  toolName?: string;
  createdAt: string;
  /** Segmented reply metadata (virtual companion). */
  segments?: string[];
  segmentIndex?: number;
  reasoning?: string;
}

/** SSE event envelope. */
export type StreamEvent =
  | { type: 'meta'; conversationId: string; messageId: string; model: string; character?: string }
  | { type: 'token'; delta: string }
  | { type: 'segment'; index: number; text: string; delayMs?: number }
  | { type: 'typing'; state: 'start' | 'end' }
  | { type: 'tool_call'; id: string; name: string; input: unknown }
  | { type: 'tool_result'; id: string; output: unknown; error?: string }
  | { type: 'reasoning'; delta: string }
  | { type: 'done'; usage?: { inputTokens?: number; outputTokens?: number } }
  | { type: 'error'; message: string };

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  characterCardId?: string;
  /** Override per-conversation segmented reply behavior. */
  segmentReply?: boolean;
}
