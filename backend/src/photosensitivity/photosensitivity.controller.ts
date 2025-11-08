import { Controller, Post, Get, Body, Param, UploadedFile, UseInterceptors, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosensitivityService, IRISSummary } from './photosensitivity.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('api/v1/photosensitivity')
export class PhotosensitivityController {
  constructor(private readonly photosensitivityService: PhotosensitivityService) {}

  @Post('analyze')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: './uploads/videos',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 500 * 1024 * 1024, // 500MB limit
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['video/mp4', 'video/avi', 'video/mov', 'video/webm', 'video/quicktime'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only video files are allowed.'), false);
        }
      },
    })
  )
  async analyzeVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { enablePatternDetection?: string; outputJson?: string; applicationName?: string }
  ) {
    if (!file) {
      throw new Error('No video file uploaded');
    }

    const options = {
      enablePatternDetection: body.enablePatternDetection !== 'false',
      outputJson: body.outputJson === 'true',
    };

    const result = await this.photosensitivityService.analyzeVideo(file.path, options);

    // Convert to compliance checks
    const complianceChecks = this.photosensitivityService.convertToComplianceChecks(
      result.summary,
      body.applicationName || 'Unknown Application',
      file.originalname
    );

    return {
      analysisId: `iris-${Date.now()}`,
      videoName: file.originalname,
      summary: result.summary,
      complianceChecks,
      resultsCount: result.results.length,
      outputPath: result.outputPath,
    };
  }

  @Get('verify')
  async verifyInstallation() {
    const isInstalled = await this.photosensitivityService.verifyInstallation();
    return {
      installed: isInstalled,
      message: isInstalled
        ? 'IRIS is installed and accessible'
        : 'IRIS is not installed or not accessible. Please install IRIS and set IRIS_EXECUTABLE_PATH environment variable.',
    };
  }

  @Get('summary/:analysisId')
  async getSummary(@Param('analysisId') analysisId: string) {
    // In a real implementation, this would retrieve stored analysis results
    // For now, return a placeholder
    return {
      analysisId,
      message: 'Analysis summary retrieval not yet implemented',
    };
  }
}

