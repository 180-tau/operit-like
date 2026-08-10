import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type MemoryType = 'fact' | 'preference' | 'event' | 'note';

@Entity('memories')
export class Memory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  userId!: string;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  characterCardId?: string | null;

  @Column()
  type!: MemoryType;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'varchar', nullable: true })
  tags?: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
