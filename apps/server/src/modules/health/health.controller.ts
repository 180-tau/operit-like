import { Controller, Get } from '@nestjs/common';

@Controller('api/health')
export class HealthController {
  @Get()
  health() {
    return {
      status: 'ok',
      service: 'operit-like',
      version: '0.1.0',
      time: new Date().toISOString(),
    };
  }
}
