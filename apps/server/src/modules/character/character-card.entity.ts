import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** Character card entity — stores SillyTavern V2-compatible fields + relationship state. */
@Entity('character_cards')
export class CharacterCard {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  userId!: string;

  /** Character name. */
  @Column()
  name!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ type: 'text', default: '' })
  personality!: string;

  @Column({ type: 'text', default: '' })
  scenario!: string;

  @Column({ type: 'text', default: '' })
  firstMes!: string;

  @Column({ type: 'text', default: '' })
  mesExample!: string;

  @Column({ type: 'text', default: '' })
  systemPrompt!: string;

  @Column({ type: 'text', default: '' })
  postHistoryInstructions!: string;

  @Column({ type: 'text', default: '' })
  creatorNotes!: string;

  /** World book (JSON array of entries). */
  @Column({ type: 'jsonb', default: [] })
  characterBook!: { keys: string[]; content: string; constant?: boolean }[];

  /** Relationship state for virtual companion. */
  @Column({ type: 'jsonb', default: { intimacy: 0, mood: 'neutral', interactionCount: 0 } })
  relationship!: { intimacy: number; mood: string; interactionCount: number };

  @Column({ default: true })
  enabled!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
