import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AdminKeyGuard } from '../common/security/api-key.guard';
import { AdminExtendQueryDto, AdminListQueryDto, BatchDeleteDto, PasswordDto, StrictBody } from './review.dto';
import { ActingUser } from './review.types';
import { ReviewsService } from './reviews.service';
import { CurrentUser } from './request-context';

/** Review administration, behind ADMIN_API_KEY. These routes still work on expired reviews. */
@Controller('api/v1/admin/reviews')
@UseGuards(AdminKeyGuard)
export class AdminReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get()
  list(@Query(StrictBody()) query: AdminListQueryDto) {
    return this.reviews.adminList(query.showExpired === 'true');
  }

  @Post('batch-delete')
  @HttpCode(200)
  batchDelete(@Body(StrictBody()) dto: BatchDeleteDto) {
    return this.reviews.batchDelete(dto.ids);
  }

  @Post(':id/extend')
  @HttpCode(200)
  extend(@Param('id') id: string, @Query(StrictBody()) query: AdminExtendQueryDto, @CurrentUser() user: ActingUser) {
    return this.reviews.extend(id, query.days, user, true);
  }

  @Post(':id/reactivate')
  @HttpCode(200)
  reactivate(@Param('id') id: string) {
    return this.reviews.reactivate(id);
  }

  @Post(':id/reset-password')
  @HttpCode(200)
  resetPassword(@Param('id') id: string, @Body(StrictBody()) dto: PasswordDto, @CurrentUser() user: ActingUser) {
    return this.reviews.setPassword(id, dto.password, user, true);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.reviews.delete(id);
  }
}
