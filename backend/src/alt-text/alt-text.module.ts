import { Module } from '@nestjs/common';
import { AltTextController } from './alt-text.controller';
import { AltTextService } from './alt-text.service';

@Module({
  controllers: [AltTextController],
  providers: [AltTextService],
})
export class AltTextModule {}
