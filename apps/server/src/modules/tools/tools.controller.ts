import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, AuthedRequest } from '../auth/jwt-auth.guard.js';
import { ToolsService } from './tools.service.js';

@Controller('tools')
@UseGuards(JwtAuthGuard)
export class ToolsController {
  constructor(private readonly tools: ToolsService) {}

  @Get()
  list() {
    return this.tools.listTools().map((t) => ({ name: t.name, description: t.description, parameters: t.parameters, permission: t.permission }));
  }

  @Post('invoke')
  invoke(@Req() req: AuthedRequest, @Body() body: { toolName: string; args?: Record<string, unknown> }) {
    return this.tools.invoke(body.toolName, body.args ?? {});
  }
}
