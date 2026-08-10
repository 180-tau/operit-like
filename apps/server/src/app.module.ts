import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module.js';
import { LlmModule } from './modules/llm/llm.module.js';
import { ConversationModule } from './modules/conversation/conversation.module.js';
import { ChatModule } from './modules/chat/chat.module.js';
import { CharacterModule } from './modules/character/character.module.js';
import { HealthController } from './modules/health/health.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.POSTGRES_HOST ?? 'localhost',
        port: Number(process.env.POSTGRES_PORT ?? 5432),
        username: process.env.POSTGRES_USER ?? 'operit',
        password: process.env.POSTGRES_PASSWORD ?? 'change-me',
        database: process.env.POSTGRES_DB ?? 'operit',
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production',
      }),
    }),
    AuthModule,
    LlmModule,
    ConversationModule,
    ChatModule,
    CharacterModule,
    // AgentModule · ToolModule (per phase)
  ],
  controllers: [HealthController],
})
export class AppModule {}
