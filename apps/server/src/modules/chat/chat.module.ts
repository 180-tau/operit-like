import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller.js';
import { ChatService } from './chat.service.js';
import { ConversationModule } from '../conversation/conversation.module.js';
import { LlmModule } from '../llm/llm.module.js';
import { CharacterModule } from '../character/character.module.js';
import { MemoryModule } from '../memory/memory.module.js';

@Module({
  imports: [ConversationModule, LlmModule, CharacterModule, MemoryModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
