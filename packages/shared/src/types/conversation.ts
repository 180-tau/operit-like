// Conversation model.

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  /** Bound character card (virtual companion). */
  characterCardId?: string;
  /** Per-conversation segmented reply config override. */
  segmentReplyConfigId?: string;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  /** Context summary (auto-generated, for long chats). */
  summary?: string;
}

export interface ConversationSummary {
  id: string;
  conversationId: string;
  content: string;
  messageCount: number;
  createdAt: string;
}
