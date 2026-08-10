import { Injectable, Logger } from '@nestjs/common';
import { LLMConfig, LLMProvider } from '@operit/shared';
import { OpenAICompatibleProvider } from './providers/openai-compatible.provider.js';
import { AnthropicProvider } from './providers/anthropic.provider.js';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly providers = new Map<string, LLMProvider>();

  /** Register a model config (from env or admin API). */
  register(config: LLMConfig): void {
    const provider = this.build(config);
    this.providers.set(config.id, provider);
    this.logger.log(`registered LLM config '${config.name}' (${config.provider}/${config.model})`);
  }

  get(configId: string): LLMProvider {
    const p = this.providers.get(configId);
    if (!p) throw new Error(`LLM config not found: ${configId}`);
    return p;
  }

  private build(config: LLMConfig): LLMProvider {
    switch (config.provider) {
      case 'anthropic':
        return new AnthropicProvider(config);
      case 'openai-compatible':
      default:
        return new OpenAICompatibleProvider(config);
    }
  }

  /** Default config from environment (MVP single-model mode). */
  defaultConfig(): LLMConfig {
    const provider = process.env.LLM_PROVIDER ?? 'openai-compatible';
    return {
      id: 'default',
      name: 'Default',
      provider: provider as LLMConfig['provider'],
      baseUrl: process.env.LLM_BASE_URL,
      apiKey: process.env.LLM_API_KEY,
      model: process.env.LLM_MODEL ?? 'gpt-4o-mini',
      maxTokens: process.env.LLM_MAX_TOKENS ? Number(process.env.LLM_MAX_TOKENS) : 4096,
      temperature: process.env.LLM_TEMPERATURE ? Number(process.env.LLM_TEMPERATURE) : 0.7,
      supportsToolCall: process.env.LLM_TOOL_CALL !== 'false',
    };
  }
}
