import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PackageService } from './package.service.js';

@Controller('packages')
@UseGuards(JwtAuthGuard)
export class PackageController {
  constructor(private readonly packages: PackageService) {}

  @Get()
  list() {
    return this.packages.list();
  }

  @Post(':name/use')
  activate(@Param('name') name: string) {
    return this.packages.activate(name);
  }

  @Post(':name/unuse')
  deactivate(@Param('name') name: string) {
    return this.packages.deactivate(name);
  }

  @Post('invoke')
  invoke(@Body() body: { tool: string; params?: Record<string, unknown> }) {
    return this.packages.invokeProxy(body.tool, body.params ?? {});
  }
}
