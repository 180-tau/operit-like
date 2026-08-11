// API client for operit-like backend.
import Constants from 'expo-constants';

const DEFAULT_API = 'http://39.108.174.241:3000/api';
export const API_BASE =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined)?.replace(/\/$/, '') ?? DEFAULT_API;

let token: string | null = null;
export function setToken(t: string | null) {
  token = t;
}
export function getToken() {
  return token;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, (json as { message?: string }).message ?? `HTTP ${res.status}`);
  return json as T;
}

export interface AuthResponse {
  token: string;
  user: { id: string; username: string; role: string };
}
export const api = {
  login: (username: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: { username, password } }),
  register: (username: string, password: string) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: { username, password } }),
  conversations: () => request<Conversation[]>('/conversations'),
  createConversation: (title: string, characterCardId?: string) =>
    request<Conversation>('/conversations', { method: 'POST', body: { title, characterCardId } }),
  messages: (cid: string) => request<Message[]>('/conversations/' + cid + '/messages'),
  characters: () => request<Character[]>('/characters'),
  createCharacter: (data: Record<string, unknown>) => request<Character>('/characters', { method: 'POST', body: data }),
  memories: () => request<Memory[]>('/memories'),
  // SSE stream helper
  streamChat: async (conversationId: string, content: string, onEvent: (ev: StreamEvent) => void) => {
    const res = await fetch(`${API_BASE}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
      body: JSON.stringify({ conversationId, content }),
    });
    const reader = res.body?.getReader();
    if (!reader) return;
    const dec = new TextDecoder();
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const parts = buf.split('\n\n');
      buf = parts.pop() ?? '';
      for (const p of parts) {
        const line = p.trim();
        if (!line.startsWith('data:')) continue;
        try {
          onEvent(JSON.parse(line.slice(5).trim()) as StreamEvent);
        } catch {
          // ignore
        }
      }
    }
  },
};

export interface Conversation {
  id: string;
  title: string;
  characterCardId?: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}
export interface Character {
  id: string;
  name: string;
  personality: string;
  description: string;
  relationship?: { intimacy: number; mood: string; interactionCount: number };
}
export interface Memory {
  id: string;
  content: string;
  type: string;
  createdAt: string;
}
export type StreamEvent =
  | { type: 'meta'; character?: string }
  | { type: 'token'; delta: string }
  | { type: 'segment'; index: number; text: string }
  | { type: 'tool_call'; name: string }
  | { type: 'tool_result' }
  | { type: 'done' }
  | { type: 'error'; message: string };