import { Controller, Get, Headers, Param, Put, Query, Req, Res, StreamableFile } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createReadStream } from 'fs';
import { Public } from '../auth/principal';
import { ReviewsService } from './reviews.service';
import { SIGNED_URL_TTL_SECONDS, contentDisposition } from './review-files.service';

/**
 * Public routes, authorized by something other than a user token or API key:
 * the one-time upload token, and HMAC-signed file URLs (so `<iframe>` and the
 * PDF viewer can load files without sending headers).
 */
@Controller('api/v1')
export class ReviewFilesController {
  constructor(private readonly reviews: ReviewsService) {}

  /**
   * Raw file body. Not parsed by Nest's body parsers (they only handle JSON and
   * form bodies, capped at 100kb); the service streams it to disk with its own
   * 50MB cap, so no global limit is raised.
   */
  @Public()
  @Put('upload/:reviewId/:token')
  upload(
    @Param('reviewId') reviewId: string,
    @Param('token') token: string,
    @Headers('content-type') contentType: string | undefined,
    @Headers('content-length') contentLength: string | undefined,
    @Req() req: Request,
  ) {
    return this.reviews.receiveUpload(reviewId, token, contentType, contentLength, req);
  }

  @Public()
  @Get('review-files/:fileId')
  async file(
    @Param('fileId') fileId: string,
    @Query('expires') expires: string,
    @Query('sig') sig: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const file = await this.reviews.resolveSignedFile(fileId, expires, sig);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', `private, max-age=${SIGNED_URL_TTL_SECONDS}`);
    if (file.contentType === 'image/svg+xml') {
      res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
    }
    return new StreamableFile(createReadStream(file.filePath), {
      type: file.contentType,
      disposition: contentDisposition(file.filename),
    });
  }
}
