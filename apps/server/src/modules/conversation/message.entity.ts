import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  conversationId!: string;

  @Column()
  role!: MessageRole;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'varchar', nullable: true })
  toolCallId?: string | null;

  @Column({ type: 'varchar', nullable: true })
  toolName?: string | null;

  /** Segmented reply: full message + segment metadata. */
  @Column({ type: 'jsonb', nullable: true })
  segments?: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  usage?: { inputTokens?: number; outputTokens?: number } | null;

  @CreateDateColumn()
  createdAt!: Date;
}
