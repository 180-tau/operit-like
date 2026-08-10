import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

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
    // Feature modules (to be added per phase):
    // AuthModule · ConversationModule · CharacterModule · AgentModule · ToolModule
  ],
})
export class AppModule {}
