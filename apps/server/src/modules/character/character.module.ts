import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterCard } from './character-card.entity.js';
import { CharacterController } from './character.controller.js';
import { CharacterService } from './character.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([CharacterCard])],
  controllers: [CharacterController],
  providers: [CharacterService],
  exports: [CharacterService],
})
export class CharacterModule {}
