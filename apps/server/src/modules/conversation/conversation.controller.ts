import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, AuthedRequest } from '../auth/jwt-auth.guard.js';
import { ConversationService } from './conversation.service.js';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(private readonly conversations: ConversationService) {}

  @Get()
  list(@Req() req: AuthedRequest) {
    return this.conversations.list(req.user.sub);
  }

  @Post()
  create(@Req() req: AuthedRequest, @Body() body: { title?: string; characterCardId?: string }) {
    return this.conversations.create({ userId: req.user.sub, title: body.title, characterCardId: body.characterCardId });
  }

  @Get(':id')
  get(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.conversations.get(req.user.sub, id);
  }

  @Get(':id/messages')
  messages(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.conversations.listMessages(req.user.sub, id);
  }

  @Delete(':id')
  remove(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.conversations.remove(req.user.sub, id);
  }
}
