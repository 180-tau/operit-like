import { Module, OnModuleInit } from '@nestjs/common';
import { LlmService } from './llm.service.js';

export const LLM_SERVICE = 'LLM_SERVICE';

@Module({
  providers: [LlmService],
  exports: [LlmService],
})
export class LlmModule implements OnModuleInit {
  constructor(private readonly llm: LlmService) {}

  onModuleInit(): void {
    // Register default model from env (MVP single-model mode).
    if (process.env.LLM_API_KEY || process.env.LLM_BASE_URL) {
      this.llm.register(this.llm.defaultConfig());
    }
  }
}
