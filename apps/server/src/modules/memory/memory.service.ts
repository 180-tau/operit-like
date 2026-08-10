import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Memory, MemoryType } from './memory.entity.js';

export interface CreateMemoryInput {
  userId: string;
  content: string;
  type?: MemoryType;
  characterCardId?: string;
  tags?: string;
}

@Injectable()
export class MemoryService {
  constructor(@InjectRepository(Memory) private readonly memories: Repository<Memory>) {}

  /** List memories for a user, optionally scoped to a character. */
  list(userId: string, characterCardId?: string, limit = 50): Promise<Memory[]> {
    const where: Record<string, unknown> = { userId };
    if (characterCardId) where.characterCardId = characterCardId;
    return this.memories.find({ where, order: { createdAt: 'DESC' }, take: limit });
  }

  /** Keyword search over memories (simple LIKE for MVP). */
  search(userId: string, q: string, characterCardId?: string, limit = 20): Promise<Memory[]> {
    const where: Record<string, unknown> = { userId, content: Like(`%${q}%`) };
    if (characterCardId) where.characterCardId = characterCardId;
    return this.memories.find({ where, order: { createdAt: 'DESC' }, take: limit });
  }

  create(input: CreateMemoryInput): Promise<Memory> {
    const mem = this.memories.create({
      userId: input.userId,
      content: input.content,
      type: input.type ?? 'fact',
      characterCardId: input.characterCardId ?? null,
      tags: input.tags ?? null,
    });
    return this.memories.save(mem);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.memories.delete({ id, userId });
  }

  /** Simple fact extraction from a user message (MVP heuristic). */
  extractFacts(content: string): string[] {
    const facts: string[] = [];
    const patterns: RegExp[] = [
      /(?:我|俺|人家)叫(.{1,12})/, // 我叫XX
      /(?:我|俺)是(.{1,12})(?:人|的|，|。|！)/, // 我是XX人
      /(?:我|俺)喜欢(.{1,24})/, // 我喜欢XX
      /(?:我|俺)最(?:喜欢|爱)(.{1,24})/, // 我最喜欢XX
      /(?:我|俺)不喜欢(.{1,24})/, // 我不喜欢XX
      /(?:我|俺)(?:养了|有)一?只(.{1,20})/, // 我养了一只XX
      /(?:我|俺)在(.{1,12})(?:工作|上班|学习)/, // 我在XX工作
    ];
    for (const re of patterns) {
      const m = content.match(re);
      if (m?.[1]) facts.push(m[1].trim());
    }
    return facts;
  }
}
