import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { ApiKeyGuard } from '../common/security/api-key.guard';
import {
  ApproveDto,
  CommentsQueryDto,
  CreateCommentDto,
  CreateFromUrlDto,
  CreateUploadDto,
  ExtendDto,
  ListReviewsQueryDto,
  PasswordDto,
  ReactionDto,
  RejectDto,
  ReplyDto,
  ResubmitDto,
  SharingDto,
  StrictBody,
  UpdateCommentDto,
  VersionDto,
} from './review.dto';
import { newId, reviewIncomingDir } from './review-files.service';
import { ALLOWED_FILE_TYPES, ActingUser, MAX_FILE_BYTES } from './review.types';
import { ReviewsService, StagedFile } from './reviews.service';
import { CurrentUser, PublicBaseUrl, ReviewPassword } from './request-context';

/** Multipart version uploads: staged under a random name, PDF/PNG/JPEG/GIF/WebP/SVG only, 50MB max */
const versionUpload = FileInterceptor('file', {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      const dir = reviewIncomingDir();
      try {
        mkdirSync(dir, { recursive: true });
        cb(null, dir);
      } catch (error) {
        cb(error as Error, dir);
      }
    },
    // The stored name never includes anything from the client
    filename: (_req, _file, cb) => cb(null, newId('upload')),
  }),
  limits: { fileSize: MAX_FILE_BYTES, files: 1, fields: 10, fieldSize: 10 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_FILE_TYPES[file.mimetype]) cb(null, true);
    else cb(new UnsupportedMediaTypeException('Only PDF, PNG, JPEG, GIF, WebP and SVG files are accepted'), false);
  },
});

@Controller('api/v1')
@UseGuards(ApiKeyGuard)
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get('reviews')
  list(@Query(StrictBody()) query: ListReviewsQueryDto, @CurrentUser() user: ActingUser) {
    return this.reviews.list(
      { workflowState: query.workflowState, q: query.q, showExpired: query.showExpired === 'true' },
      user,
    );
  }

  @Post('upload')
  createUpload(
    @Body(StrictBody()) dto: CreateUploadDto,
    @CurrentUser() user: ActingUser,
    @PublicBaseUrl() baseUrl: string,
  ) {
    return this.reviews.createUpload(dto, user, baseUrl);
  }

  @Post('review/create-from-url')
  createFromUrl(@Body(StrictBody()) dto: CreateFromUrlDto, @CurrentUser() user: ActingUser) {
    return this.reviews.createFromUrl(dto, user);
  }

  @Get('review/:id')
  get(@Param('id') id: string, @CurrentUser() user: ActingUser, @ReviewPassword() password?: string) {
    return this.reviews.getReview(id, user, password);
  }

  @Get('review/:id/version/:versionId')
  version(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @CurrentUser() user: ActingUser,
    @PublicBaseUrl() baseUrl: string,
    @ReviewPassword() password?: string,
  ) {
    return this.reviews.getVersionUrl(id, versionId, user, password, baseUrl);
  }

  @Post('review/:id/versions')
  @UseInterceptors(versionUpload)
  async addVersion(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: ActingUser,
  ) {
    const staged: StagedFile | undefined = file
      ? { path: file.path, mimetype: file.mimetype, size: file.size, originalname: file.originalname }
      : undefined;
    // Validated here rather than by a pipe so a rejected request doesn't leave its staged file behind
    const dto = plainToInstance(VersionDto, body ?? {});
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length) {
      if (staged) await this.reviews.discardStaged(staged);
      throw new BadRequestException(errors.flatMap((e) => Object.values(e.constraints ?? {})));
    }
    return this.reviews.addVersion(id, staged, dto, user);
  }

  @Post('review/:id/complete')
  @HttpCode(200)
  complete(@Param('id') id: string, @CurrentUser() user: ActingUser) {
    return this.reviews.complete(id, user);
  }

  @Post('review/:id/sharing')
  @HttpCode(200)
  sharing(@Param('id') id: string, @Body(StrictBody()) dto: SharingDto, @CurrentUser() user: ActingUser) {
    return this.reviews.updateSharing(id, dto, user);
  }

  @Post('review/:id/password')
  @HttpCode(200)
  password(@Param('id') id: string, @Body(StrictBody()) dto: PasswordDto, @CurrentUser() user: ActingUser) {
    return this.reviews.setPassword(id, dto.password, user);
  }

  @Post('review/:id/extend')
  @HttpCode(200)
  extend(@Param('id') id: string, @Body(StrictBody()) dto: ExtendDto, @CurrentUser() user: ActingUser) {
    return this.reviews.extend(id, dto.days, user);
  }

  // ------------------------------------------------------------- workflow

  @Post('review/:id/workflow/move-to-client-review')
  @HttpCode(200)
  moveToClientReview(@Param('id') id: string, @CurrentUser() user: ActingUser, @ReviewPassword() password?: string) {
    return this.reviews.workflow(id, { type: 'move-to-client-review' }, user, password);
  }

  @Post('review/:id/workflow/move-to-art-director-review')
  @HttpCode(200)
  moveToArtDirectorReview(@Param('id') id: string, @CurrentUser() user: ActingUser, @ReviewPassword() password?: string) {
    return this.reviews.workflow(id, { type: 'move-to-art-director-review' }, user, password);
  }

  /** Approve and reject need the current stage's role; `allowedActions` on the review says whether the caller has it */
  @Post('review/:id/workflow/approve')
  @HttpCode(200)
  approve(
    @Param('id') id: string,
    @Body(StrictBody()) dto: ApproveDto,
    @CurrentUser() user: ActingUser,
    @ReviewPassword() password?: string,
  ) {
    return this.reviews.workflow(id, { type: 'approve', stage: dto.stage }, user, password);
  }

  @Post('review/:id/workflow/reject')
  @HttpCode(200)
  reject(
    @Param('id') id: string,
    @Body(StrictBody()) dto: RejectDto,
    @CurrentUser() user: ActingUser,
    @ReviewPassword() password?: string,
  ) {
    return this.reviews.workflow(id, { type: 'reject', stage: dto.stage, reason: dto.reason ?? undefined }, user, password);
  }

  @Post('review/:id/workflow/resubmit')
  @HttpCode(200)
  resubmit(
    @Param('id') id: string,
    @Body(StrictBody()) dto: ResubmitDto,
    @CurrentUser() user: ActingUser,
    @ReviewPassword() password?: string,
  ) {
    return this.reviews.workflow(id, { type: 'resubmit', targetStage: dto.targetStage }, user, password);
  }

  // ------------------------------------------------------------- comments

  @Get('review/:id/comments')
  comments(
    @Param('id') id: string,
    @Query(StrictBody()) query: CommentsQueryDto,
    @CurrentUser() user: ActingUser,
    @ReviewPassword() password?: string,
  ) {
    return this.reviews.getComments(id, user, password, query.versionId);
  }

  @Post('review/:id/comments')
  addComment(
    @Param('id') id: string,
    @Body(StrictBody()) dto: CreateCommentDto,
    @CurrentUser() user: ActingUser,
    @ReviewPassword() password?: string,
  ) {
    return this.reviews.addComment(id, dto, user, password);
  }

  @Patch('review/:id/comments/:commentId')
  updateComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Body(StrictBody()) dto: UpdateCommentDto,
    @CurrentUser() user: ActingUser,
    @ReviewPassword() password?: string,
  ) {
    return this.reviews.updateComment(id, commentId, dto, user, password);
  }

  @Delete('review/:id/comments/:commentId')
  @HttpCode(204)
  async deleteComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: ActingUser,
    @ReviewPassword() password?: string,
  ): Promise<void> {
    await this.reviews.deleteComment(id, commentId, user, password);
  }

  @Post('review/:id/comments/:commentId/replies')
  addReply(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Body(StrictBody()) dto: ReplyDto,
    @CurrentUser() user: ActingUser,
    @ReviewPassword() password?: string,
  ) {
    return this.reviews.addReply(id, commentId, dto.text, user, password);
  }

  @Post('review/:id/comments/:commentId/reactions')
  @HttpCode(200)
  react(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Body(StrictBody()) dto: ReactionDto,
    @CurrentUser() user: ActingUser,
    @ReviewPassword() password?: string,
  ) {
    return this.reviews.toggleReaction(id, commentId, dto.emoji, user, undefined, password);
  }

  @Post('review/:id/comments/:commentId/replies/:replyId/reactions')
  @HttpCode(200)
  reactToReply(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Param('replyId') replyId: string,
    @Body(StrictBody()) dto: ReactionDto,
    @CurrentUser() user: ActingUser,
    @ReviewPassword() password?: string,
  ) {
    return this.reviews.toggleReaction(id, commentId, dto.emoji, user, replyId, password);
  }
}
