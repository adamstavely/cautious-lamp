import { Controller, Post, Get, Body, Param, Req, UploadedFile, UseInterceptors, UseGuards, BadRequestException, HttpException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosensitivityService } from './photosensitivity.service';
import { ApiKeyGuard } from '../common/security/api-key.guard';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { AdmittedRequest, AnalysisAdmissionGuard, callerKey } from './analysis-admission.guard';
import { AuthPrincipal, Principal } from '../auth/principal';
import { AnalyzeVideoDto } from './photosensitivity.dto';

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

  /**
   * The admission guard runs first: when the server is full (503
   * PHOTOSENSITIVITY_BUSY) or the caller has its share (429
   * PHOTOSENSITIVITY_QUOTA_EXCEEDED), the request is refused with Retry-After
   * before any of the upload is written.
   */
  @Post('analyze')
  @UseGuards(AnalysisAdmissionGuard)
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
    @Body() body: AnalyzeVideoDto,
    @Req() req: AdmittedRequest,
    @Principal() principal: AuthPrincipal,
  ) {
    if (!file) {
      throw new BadRequestException('No video file uploaded');
    }

    // outputJson is accepted for older clients and ignored: the response is the same either way
    const result = await this.photosensitivityService.analyzeVideo(
      file.path,
      { enablePatternDetection: body.enablePatternDetection !== 'false' },
      req.analysisTicket,
      callerKey(req),
    );
    const applicationName = body.applicationName || 'Unknown Application';

    const complianceChecks = this.photosensitivityService.convertToComplianceChecks(
      result.summary,
      applicationName,
      file.originalname
    );

    // The analysis stands even when it can't be stored; it just has no id to fetch it by
    let analysisId: string | null = null;
    let saveError: string | undefined;
    try {
      analysisId = await this.photosensitivityService.saveSummary(
        { videoName: file.originalname, applicationName, summary: result.summary, resultsCount: result.results.length },
        principal,
      );
    } catch (error) {
      if (!(error instanceof HttpException)) throw error;
      saveError = error.message;
    }

    return {
      analysisId,
      saved: analysisId !== null,
      ...(saveError ? { saveError } : {}),
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

  /** A stored summary: only for whoever ran the analysis, or an admin:users holder */
  @Get('summary/:analysisId')
  async getSummary(@Principal() principal: AuthPrincipal, @Param('analysisId') analysisId: string) {
    return this.photosensitivityService.getSummary(principal, analysisId);
  }
}
