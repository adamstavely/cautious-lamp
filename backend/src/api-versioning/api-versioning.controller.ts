import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
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

  /** The routes the server registers, with who may call them */
  @Get('versions/current/routes')
  getRoutes() {
    return this.versioningService.getRoutes();
  }

  @Get('versions/:version')
  getVersion(
    @Param('version') version: string,
  ) {
    const versionInfo = this.versioningService.getVersion(version);
    if (!versionInfo) {
      throw new NotFoundException(`Version '${version}' not found`);
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
