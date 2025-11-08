import { Module } from '@nestjs/common';
import { PhotosensitivityService } from './photosensitivity.service';
import { PhotosensitivityController } from './photosensitivity.controller';

@Module({
  controllers: [PhotosensitivityController],
  providers: [PhotosensitivityService],
  exports: [PhotosensitivityService],
})
export class PhotosensitivityModule {}

