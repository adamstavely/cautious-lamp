import { Module } from '@nestjs/common';
import { DesignSystemController } from './design-system.controller';
import { DesignSystemService } from './design-system.service';
import { ComplianceScannerService } from './compliance-scanner.service';
import { ApplicationScannerService } from './application-scanner.service';

@Module({
  controllers: [DesignSystemController],
  providers: [DesignSystemService, ComplianceScannerService, ApplicationScannerService],
})
export class DesignSystemModule {}

