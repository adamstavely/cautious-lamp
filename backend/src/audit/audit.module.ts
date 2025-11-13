import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditInterceptor } from './audit.interceptor';
import { SecurityAuditService } from '../common/security/security-audit.service';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [],
  providers: [
    AuditService,
    SecurityAuditService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  controllers: [AuditController],
  exports: [AuditService, SecurityAuditService],
})
export class AuditModule {}

