import { create } from 'zustand';
import { api, setToken, Conversation, Character, Memory, Message } from '../api';

interface AppState {
  token: string | null;
  username: string | null;
  conversations: Conversation[];
  characters: Character[];
  memories: Memory[];
  activeCid: string | null;
  activeCharacter: Character | null;
  login: (u: string, p: string) => Promise<void>;
  register: (u: string, p: string) => Promise<void>;
  logout: () => void;
  refreshConversations: () => Promise<void>;
  refreshCharacters: () => Promise<void>;
  refreshMemories: () => Promise<void>;
  setActive: (cid: string | null, char: Character | null) => void;
  createConv: (title: string, characterCardId?: string) => Promise<void>;
  createChar: (d: Record<string, unknown>) => Promise<void>;
}

export const useApp = create<AppState>((set, get) => ({
  token: null,
  username: null,
  conversations: [],
  characters: [],
  memories: [],
  activeCid: null,
  activeCharacter: null,

  async login(u, p) {
    const r = await api.login(u, p);
    setToken(r.token);
    set({ token: r.token, username: r.user.username });
    await get().refreshConversations();
    await get().refreshCharacters();
    await get().refreshMemories();
  },
  async register(u, p) {
    const r = await api.register(u, p);
    setToken(r.token);
    set({ token: r.token, username: r.user.username });
    await get().refreshConversations();
    await get().refreshCharacters();
  },
  logout() {
    setToken(null);
    set({ token: null, username: null, conversations: [], characters: [], memories: [], activeCid: null, activeCharacter: null });
  },

  async refreshConversations() {
    const list = await api.conversations();
    set({ conversations: list });
    const cid = get().activeCid ?? list[0]?.id ?? null;
    set({ activeCid: cid });
  },
  async refreshCharacters() {
    set({ characters: await api.characters() });
  },
  async refreshMemories() {
    set({ memories: await api.memories() });
  },
  setActive(cid, char) {
    set({ activeCid: cid, activeCharacter: char });
  },
  async createConv(title, characterCardId) {
    const conv = await api.createConversation(title, characterCardId);
    set({ activeCid: conv.id });
    await get().refreshConversations();
  },
  async createChar(d) {
    await api.createCharacter(d);
    await get().refreshCharacters();
  },
}));