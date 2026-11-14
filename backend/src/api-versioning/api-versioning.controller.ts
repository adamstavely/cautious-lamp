import { Controller, Get, Param, BadRequestException } from '@nestjs/common';
import { ApiVersioningService } from './api-versioning.service';

@Controller('api')
export class ApiVersioningController {
  constructor(
    private readonly versioningService: ApiVersioningService,
  ) {}

  @Get('versions')
  getAllVersions() {
    return this.versioningService.getAllVersions();
  }

  @Get('versions/current')
  getCurrentVersion() {
    return this.versioningService.getCurrentVersion();
  }

  @Get('versions/:version')
  getVersion(
    @Param('version') version: string,
  ) {
    const versionInfo = this.versioningService.getVersion(version);
    if (!versionInfo) {
      throw new BadRequestException(`Version '${version}' not found`);
    }
    return versionInfo;
  }

  @Get('versions/:version/supported')
  checkVersionSupported(
    @Param('version') version: string,
  ) {
    return {
      version,
      supported: this.versioningService.isVersionSupported(version),
    };
  }
}
