import { Module } from '@nestjs/common';
import { ApiVersioningService } from './api-versioning.service';
import { ApiVersioningController } from './api-versioning.controller';

@Module({
  controllers: [ApiVersioningController],
  providers: [ApiVersioningService],
  exports: [ApiVersioningService],
})
export class ApiVersioningModule {}




