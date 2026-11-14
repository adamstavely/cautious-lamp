import { Controller, Post, Get, Body, Param, UploadedFile, UseInterceptors, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosensitivityService } from './photosensitivity.service';
import { ApiKeyGuard } from '../common/security/api-key.guard';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';

/** Accepted video types and the extension each is stored with */
const VIDEO_EXTENSIONS: Record<string, string> = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
  'video/x-msvideo': '.avi',
  'video/avi': '.avi',
};

@Controller('api/v1/photosensitivity')
@UseGuards(ApiKeyGuard)
export class PhotosensitivityController {
  constructor(private readonly photosensitivityService: PhotosensitivityService) {}

  @Post('analyze')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: './uploads/videos',
        // The stored name never includes anything from the client
        filename: (req, file, cb) => {
          cb(null, `${randomUUID()}${VIDEO_EXTENSIONS[file.mimetype]}`);
        },
      }),
      limits: {
        fileSize: 200 * 1024 * 1024, // 200MB limit
        files: 1,
      },
      fileFilter: (req, file, cb) => {
        if (VIDEO_EXTENSIONS[file.mimetype]) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only MP4, WebM, MOV and AVI videos are accepted'), false);
        }
      },
    })
  )
  async analyzeVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { enablePatternDetection?: string; outputJson?: string; applicationName?: string },
  ) {
    if (!file) {
      throw new BadRequestException('No video file uploaded');
    }

    // outputJson is accepted for older clients and ignored: the response is the same either way
    const result = await this.photosensitivityService.analyzeVideo(file.path, {
      enablePatternDetection: body.enablePatternDetection !== 'false',
    });
    const applicationName = body.applicationName || 'Unknown Application';

    const complianceChecks = this.photosensitivityService.convertToComplianceChecks(
      result.summary,
      applicationName,
      file.originalname
    );

    const analysisId = await this.photosensitivityService.saveSummary({
      videoName: file.originalname,
      applicationName,
      summary: result.summary,
      resultsCount: result.results.length,
    });

    return {
      analysisId,
      videoName: file.originalname,
      summary: result.summary,
      complianceChecks,
      resultsCount: result.results.length,
    };
  }

  /** Whether IRIS is installed here (nothing is run) */
  @Get('verify')
  async verifyInstallation() {
    const { executable, config, problem } = await this.photosensitivityService.status();
    return {
      installed: !problem,
      executable,
      config,
      message: problem ?? 'IRIS is installed and ready',
    };
  }

  @Get('summary/:analysisId')
  async getSummary(@Param('analysisId') analysisId: string) {
    return this.photosensitivityService.getSummary(analysisId);
  }
}
