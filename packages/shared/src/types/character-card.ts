// Character Card V2 compatible model (SillyTavern community spec — data format only, no code copied).

/** Character Card V2 — spec fields. */
export interface CharacterCardV2 {
  spec: 'chara_card_v2';
  spec_version: '2.0';
  data: {
    name: string;
    description: string;
    personality?: string;
    scenario?: string;
    first_mes?: string;
    mes_example?: string;
    creator_notes?: string;
    system_prompt?: string;
    post_history_instructions?: string;
    alternate_greetings?: string[];
    tags?: string[];
    creator?: string;
    character_version?: string;
    extensions?: Record<string, unknown>;
    /** World book / lorebook (conditionally triggered background knowledge). */
    character_book?: CharacterBook;
  };
}

export interface CharacterBook {
  name?: string;
  description?: string;
  entries: CharacterBookEntry[];
}

export interface CharacterBookEntry {
  keys: string[];
  content: string;
  extensions?: Record<string, unknown>;
  enabled?: boolean;
  /** Insertion position: before_char / after_char. */
  insertion_order?: number;
  /** Case-insensitive keyword matching. */
  case_sensitive?: boolean;
  /** true = always active. */
  constant?: boolean;
  /** Regex mode. */
  regex?: boolean;
  /** Number of most recent messages to scan for keys. */
  scan_depth?: number;
}

/** Internal character card (persisted in DB, extends V2). */
export interface CharacterCard extends CharacterCardV2 {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  /** Relationship state (virtual companion). */
  relationship?: RelationshipState;
  /** Whitelists for tool access. */
  toolAccess?: {
    enabled: boolean;
    allowedTools?: string[];
    allowedPackages?: string[];
  };
}

export interface RelationshipState {
  intimacy: number; // 0..100
  mood: string;
  lastInteractionAt?: string;
  interactionCount: number;
}

/** Typing / segmented reply config (virtual companion experience). */
export interface SegmentReplyConfig {
  enabled: boolean;
  /** Split by sentence (。！？.!?\n etc.) */
  splitBy: 'sentence' | 'clause' | 'paragraph';
  /** Base delay between segments (ms). */
  baseDelayMs: number;
  /** Random delay jitter (ms). */
  jitterMs: number;
  /** Max chars per segment. */
  maxSegmentChars: number;
  /** Show typing indicator between segments. */
  showTypingIndicator: boolean;
}
