import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module.js';
import { LlmModule } from './modules/llm/llm.module.js';

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
    // ConversationModule · CharacterModule · AgentModule · ToolModule (per phase)
  ],
})
export class AppModule {}
