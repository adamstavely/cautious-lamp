import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { FeatureFlagsService, FeatureFlag } from './feature-flags.service';

@Controller('api/v1/feature-flags')
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Get()
  async getAllFlags() {
    return this.featureFlagsService.getAllFlags();
  }

  @Get(':id')
  async getFlag(@Param('id') id: string) {
    const flag = await this.featureFlagsService.getFlag(id);
    if (!flag) {
      return { error: 'Feature flag not found' };
    }
    return flag;
  }

  @Get('key/:key')
  async getFlagByKey(@Param('key') key: string) {
    const flag = await this.featureFlagsService.getFlagByKey(key);
    if (!flag) {
      return { error: 'Feature flag not found' };
    }
    return flag;
  }

  @Get('check/:key')
  async checkFlag(
    @Param('key') key: string,
    @Query('userId') userId?: string,
    @Query('userGroups') userGroups?: string,
  ) {
    const groups = userGroups ? userGroups.split(',') : undefined;
    const enabled = await this.featureFlagsService.isEnabled(key, userId, groups);
    return { key, enabled };
  }

  @Post()
  async createFlag(@Body() flag: Omit<FeatureFlag, 'id'>) {
    return this.featureFlagsService.createFlag(flag);
  }

  @Put(':id')
  async updateFlag(
    @Param('id') id: string,
    @Body() updates: Partial<FeatureFlag>,
  ) {
    const flag = await this.featureFlagsService.updateFlag(id, updates);
    if (!flag) {
      return { error: 'Feature flag not found' };
    }
    return flag;
  }

  @Put(':id/toggle')
  async toggleFlag(@Param('id') id: string) {
    const flag = await this.featureFlagsService.toggleFlag(id);
    if (!flag) {
      return { error: 'Feature flag not found' };
    }
    return flag;
  }

  @Delete(':id')
  async deleteFlag(@Param('id') id: string) {
    const deleted = await this.featureFlagsService.deleteFlag(id);
    if (!deleted) {
      return { error: 'Feature flag not found' };
    }
    return { success: true };
  }

  @Post('enable-all')
  async enableAllFeatures() {
    await this.featureFlagsService.ensureAllFeaturesEnabled();
    return { success: true, message: 'All features have been enabled' };
  }
}

