import { Module } from '@nestjs/common';
import { PackageController } from './package.controller.js';
import { PackageService } from './package.service.js';
import { ToolsModule } from '../tools/tools.module.js';

@Module({
  imports: [ToolsModule],
  controllers: [PackageController],
  providers: [PackageService],
  exports: [PackageService],
})
export class PackagesModule {}
