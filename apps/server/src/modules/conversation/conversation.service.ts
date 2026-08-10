import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity.js';
import { Message } from './message.entity.js';

export interface CreateConversationInput {
  userId: string;
  title?: string;
  characterCardId?: string;
}

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation) private readonly conversations: Repository<Conversation>,
    @InjectRepository(Message) private readonly messages: Repository<Message>,
  ) {}

  list(userId: string): Promise<Conversation[]> {
    return this.conversations.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async create(input: CreateConversationInput): Promise<Conversation> {
    const conv = this.conversations.create({
      userId: input.userId,
      title: input.title ?? 'New chat',
      characterCardId: input.characterCardId ?? null,
    });
    return this.conversations.save(conv);
  }

  async get(userId: string, id: string): Promise<Conversation> {
    const conv = await this.conversations.findOne({ where: { id, userId } });
    if (!conv) throw new NotFoundException('conversation not found');
    return conv;
  }

  async rename(userId: string, id: string, title: string): Promise<Conversation> {
    const conv = await this.get(userId, id);
    conv.title = title;
    return this.conversations.save(conv);
  }

  async remove(userId: string, id: string): Promise<void> {
    const conv = await this.get(userId, id);
    await this.messages.delete({ conversationId: id });
    await this.conversations.remove(conv);
  }

  listMessages(userId: string, conversationId: string): Promise<Message[]> {
    return this.messages.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  saveMessage(msg: Partial<Message>): Promise<Message> {
    return this.messages.save(this.messages.create(msg as Message));
  }

  async touch(id: string): Promise<void> {
    await this.conversations.update({ id }, { updatedAt: new Date() });
  }
}
