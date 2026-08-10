import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, AuthedRequest } from '../auth/jwt-auth.guard.js';
import { CharacterService, CreateCharacterInput, TavernCardV2 } from './character.service.js';

@Controller('characters')
@UseGuards(JwtAuthGuard)
export class CharacterController {
  constructor(private readonly characters: CharacterService) {}

  @Get()
  list(@Req() req: AuthedRequest) {
    return this.characters.list(req.user.sub);
  }

  @Get(':id')
  get(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.characters.get(req.user.sub, id);
  }

  @Post()
  create(@Req() req: AuthedRequest, @Body() body: CreateCharacterInput) {
    return this.characters.create(req.user.sub, body);
  }

  @Post('import/tavern')
  importTavern(@Req() req: AuthedRequest, @Body() body: TavernCardV2) {
    return this.characters.importFromTavern(req.user.sub, body);
  }

  @Post(':id/export/tavern')
  exportTavern(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.characters.exportToTavern(this.characters.get(req.user.sub, id));
  }

  @Post(':id')
  update(@Req() req: AuthedRequest, @Param('id') id: string, @Body() body: Partial<CreateCharacterInput>) {
    return this.characters.update(req.user.sub, id, body);
  }

  @Delete(':id')
  remove(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.characters.remove(req.user.sub, id);
  }
}
