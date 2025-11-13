import { Module, Global } from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import { KeyManagementService } from './key-management.service';
import { TokenRotationService } from './token-rotation.service';
import { OAuthService } from '../auth/oauth.service';
import { TokenRefreshService } from '../auth/token-refresh.service';
import { AuditModule } from '../../audit/audit.module';

@Global()
@Module({
  imports: [AuditModule],
  providers: [
    EncryptionService,
    KeyManagementService,
    TokenRotationService,
    OAuthService,
    TokenRefreshService,
  ],
  exports: [
    EncryptionService,
    KeyManagementService,
    TokenRotationService,
    OAuthService,
    TokenRefreshService,
  ],
})
export class SecurityModule {}

