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
  // SSE stream helper — robust: never throws, always terminates.
  streamChat: async (conversationId: string, content: string, onEvent: (ev: StreamEvent) => void) => {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
        body: JSON.stringify({ conversationId, content }),
      });
    } catch (e) {
      onEvent({ type: 'error', message: (e as Error).message ?? '网络请求失败' });
      return;
    }
    if (!res.ok) {
      onEvent({ type: 'error', message: `HTTP ${res.status}` });
      return;
    }
    const reader = res.body?.getReader();
    if (!reader) {
      onEvent({ type: 'error', message: '当前环境不支持流式读取' });
      return;
    }
    const dec = new TextDecoder();
    let buf = '';
    try {
      while (true) {
        let done = false;
        let value: Uint8Array | undefined;
        try {
          const r = await reader.read();
          done = r.done;
          value = r.value;
        } catch (e) {
          onEvent({ type: 'error', message: (e as Error).message ?? '流读取中断' });
          break;
        }
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
            // ignore malformed frame
          }
        }
      }
    } catch (e) {
      onEvent({ type: 'error', message: (e as Error).message ?? '流解析失败' });
    } finally {
      try {
        await reader.cancel();
      } catch {
        // ignore
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
  | { type: 'typing'; state: 'start' | 'end' }
  | { type: 'tool_call'; id?: string; name: string; input?: unknown }
  | { type: 'tool_result'; id?: string; output?: unknown; error?: unknown }
  | { type: 'done'; usage?: unknown }
  | { type: 'error'; message: string };