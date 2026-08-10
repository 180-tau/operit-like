import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CharacterCard } from './character-card.entity.js';

export interface CreateCharacterInput {
  userId: string;
  name: string;
  description?: string;
  personality?: string;
  scenario?: string;
  firstMes?: string;
  mesExample?: string;
  systemPrompt?: string;
  postHistoryInstructions?: string;
  characterBook?: { keys: string[]; content: string; constant?: boolean }[];
}

/** Tavern AI / SillyTavern Character Card V2 payload. */
export interface TavernCardV2 {
  spec: 'chara_card_v2';
  data: {
    name: string;
    description?: string;
    personality?: string;
    scenario?: string;
    first_mes?: string;
    mes_example?: string;
    creator_notes?: string;
    system_prompt?: string;
    post_history_instructions?: string;
    character_book?: { entries: { keys?: string[]; content?: string; constant?: boolean }[] };
  };
}

@Injectable()
export class CharacterService {
  constructor(@InjectRepository(CharacterCard) private readonly cards: Repository<CharacterCard>) {}

  list(userId: string): Promise<CharacterCard[]> {
    return this.cards.find({ where: { userId, enabled: true }, order: { updatedAt: 'DESC' } });
  }

  async get(userId: string, id: string): Promise<CharacterCard> {
    const card = await this.cards.findOne({ where: { id, userId } });
    if (!card) throw new NotFoundException('character card not found');
    return card;
  }

  async create(userId: string, input: CreateCharacterInput): Promise<CharacterCard> {
    const card = this.cards.create({
      userId,
      name: input.name,
      description: input.description ?? '',
      personality: input.personality ?? '',
      scenario: input.scenario ?? '',
      firstMes: input.firstMes ?? '',
      mesExample: input.mesExample ?? '',
      systemPrompt: input.systemPrompt ?? '',
      postHistoryInstructions: input.postHistoryInstructions ?? '',
      characterBook: input.characterBook ?? [],
    });
    return this.cards.save(card);
  }

  async update(userId: string, id: string, patch: Partial<CreateCharacterInput>): Promise<CharacterCard> {
    const card = await this.get(userId, id);
    Object.assign(card, patch);
    return this.cards.save(card);
  }

  async remove(userId: string, id: string): Promise<void> {
    const card = await this.get(userId, id);
    await this.cards.remove(card);
  }

  /** Import from Tavern/SillyTavern Character Card V2 JSON. */
  async importFromTavern(userId: string, json: TavernCardV2): Promise<CharacterCard> {
    const d = json.data;
    const input: CreateCharacterInput = {
      userId,
      name: d.name,
      description: d.description ?? '',
      personality: d.personality ?? '',
      scenario: d.scenario ?? '',
      firstMes: d.first_mes ?? '',
      mesExample: d.mes_example ?? '',
      systemPrompt: d.system_prompt ?? '',
      postHistoryInstructions: d.post_history_instructions ?? '',
      characterBook:
        d.character_book?.entries?.map((e) => ({
          keys: e.keys ?? [],
          content: e.content ?? '',
          constant: e.constant ?? false,
        })) ?? [],
    };
    return this.create(userId, input);
  }

  /** Export to Tavern/SillyTavern Character Card V2 JSON. */
  exportToTavern(card: CharacterCard): TavernCardV2 {
    return {
      spec: 'chara_card_v2',
      data: {
        name: card.name,
        description: card.description,
        personality: card.personality,
        scenario: card.scenario,
        first_mes: card.firstMes,
        mes_example: card.mesExample,
        creator_notes: card.creatorNotes,
        system_prompt: card.systemPrompt,
        post_history_instructions: card.postHistoryInstructions,
        character_book: { entries: card.characterBook.map((e) => ({ keys: e.keys, content: e.content, constant: e.constant })) },
      },
    };
  }

  /** Build the system prompt for a character (assembled before chat). */
  buildSystemPrompt(card: CharacterCard): string {
    const parts: string[] = [];
    if (card.systemPrompt) parts.push(card.systemPrompt);
    parts.push(`You are now roleplaying as ${card.name}. Stay fully in character.`);
    if (card.description) parts.push(`Character description:\n${card.description}`);
    if (card.personality) parts.push(`Personality:\n${card.personality}`);
    if (card.scenario) parts.push(`Scenario:\n${card.scenario}`);
    if (card.mesExample) parts.push(`Example dialogue (use this style):\n${card.mesExample}`);
    if (card.postHistoryInstructions) parts.push(card.postHistoryInstructions);
    return parts.join('\n\n');
  }
}
