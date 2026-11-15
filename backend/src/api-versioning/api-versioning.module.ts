import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ApiVersioningService } from './api-versioning.service';
import { ApiVersioningController } from './api-versioning.controller';

@Module({
  imports: [DiscoveryModule],
  controllers: [ApiVersioningController],
  providers: [ApiVersioningService],
  exports: [ApiVersioningService],
})
export class ApiVersioningModule {}
