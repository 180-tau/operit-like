import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard, AuthedRequest } from '../auth/jwt-auth.guard.js';
import { ChatService } from './chat.service.js';

export interface ChatStreamDto {
  conversationId: string;
  content: string;
  characterCardId?: string;
  segmentReply?: boolean;
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  /**
   * POST /api/chat/stream — Server-Sent Events stream.
   */
  @Post('stream')
  async stream(@Req() req: AuthedRequest, @Body() body: ChatStreamDto, @Res() res: Response): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const send = (event: unknown) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    try {
      for await (const ev of this.chat.streamReply(req.user.sub, body.conversationId, body.content)) {
        send(ev);
      }
    } catch (err) {
      send({ type: 'error', message: String(err) });
    } finally {
      res.end();
    }
  }
}
