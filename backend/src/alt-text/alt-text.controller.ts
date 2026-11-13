import { BadRequestException, Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiKeyGuard } from '../common/security/api-key.guard';
import { AltTextService, SupportedImageType } from './alt-text.service';

const IMAGE_TYPES = new Set<SupportedImageType>(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);

@Controller('api/v1/alt-text')
@UseGuards(ApiKeyGuard)
export class AltTextController {
  constructor(private readonly altTextService: AltTextService) {}

  /** multipart: `image` (PNG, JPEG, GIF or WebP, up to 5MB) and optional `context` */
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
      fileFilter: (req, file, cb) => {
        if (IMAGE_TYPES.has(file.mimetype as SupportedImageType)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only PNG, JPEG, GIF and WebP images are accepted'), false);
        }
      },
    }),
  )
  generate(@UploadedFile() image: Express.Multer.File, @Body() body: { context?: string }) {
    if (!image) {
      throw new BadRequestException('No image uploaded');
    }
    return this.altTextService.generate(image.buffer, image.mimetype as SupportedImageType, body?.context);
  }
}
