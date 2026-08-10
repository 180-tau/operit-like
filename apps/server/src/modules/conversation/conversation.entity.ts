import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  userId!: string;

  @Column({ default: 'New chat' })
  title!: string;

  @Column({ type: 'varchar', nullable: true })
  characterCardId?: string | null;

  @Column({ default: false })
  pinned!: boolean;

  @Column({ type: 'text', nullable: true })
  summary?: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
