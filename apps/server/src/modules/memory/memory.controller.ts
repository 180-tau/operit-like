import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, AuthedRequest } from '../auth/jwt-auth.guard.js';
import { MemoryService } from './memory.service.js';

@Controller('memories')
@UseGuards(JwtAuthGuard)
export class MemoryController {
  constructor(private readonly memories: MemoryService) {}

  @Get()
  list(@Req() req: AuthedRequest, @Query('characterCardId') characterCardId?: string) {
    return this.memories.list(req.user.sub, characterCardId);
  }

  @Get('search')
  search(@Req() req: AuthedRequest, @Query('q') q: string, @Query('characterCardId') characterCardId?: string) {
    return this.memories.search(req.user.sub, q ?? '', characterCardId);
  }

  @Post()
  create(
    @Req() req: AuthedRequest,
    @Body() body: { content: string; type?: string; characterCardId?: string; tags?: string },
  ) {
    return this.memories.create({
      userId: req.user.sub,
      content: body.content,
      type: (body.type as 'fact' | 'preference' | 'event' | 'note') ?? 'fact',
      characterCardId: body.characterCardId,
      tags: body.tags,
    });
  }

  @Delete(':id')
  remove(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.memories.remove(req.user.sub, id);
  }
}
