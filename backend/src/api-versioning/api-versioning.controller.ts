import { Controller, Get, Param, Headers, BadRequestException } from '@nestjs/common';
import { ApiVersioningService } from './api-versioning.service';
import { KeyManagementService } from '../common/security/key-management.service';

@Controller('api')
export class ApiVersioningController {
  constructor(
    private readonly versioningService: ApiVersioningService,
    private readonly keyManagementService: KeyManagementService,
  ) {}

  private validateRequest(authHeader?: string): void {
    this.keyManagementService.assertValidApiKey(authHeader);
  }

  @Get('versions')
  getAllVersions(
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.versioningService.getAllVersions();
  }

  @Get('versions/current')
  getCurrentVersion(
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.versioningService.getCurrentVersion();
  }

  @Get('versions/:version')
  getVersion(
    @Param('version') version: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const versionInfo = this.versioningService.getVersion(version);
    if (!versionInfo) {
      throw new BadRequestException(`Version '${version}' not found`);
    }
    return versionInfo;
  }

  @Get('versions/:version/supported')
  checkVersionSupported(
    @Param('version') version: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return {
      version,
      supported: this.versioningService.isVersionSupported(version),
    };
  }
}





