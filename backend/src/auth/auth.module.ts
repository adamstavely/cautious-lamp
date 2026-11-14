import { Global, Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { AuditModule } from '../audit/audit.module';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { RbacModule } from '../rbac/rbac.module';
import { EsDocumentStore } from '../reviews/document-store';
import { ApiKeysController } from './api-keys.controller';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { USERS_INDEX, USER_PROPERTIES, USER_STORE } from './user.types';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

/**
 * Users, sign-in and the global AuthGuard (docs/AUTH.md). Global so the RBAC
 * controller and the WebSocket gateway can use UsersService and AuthService.
 * The guard itself is registered as APP_GUARD in AppModule, after the throttler.
 */
@Global()
@Module({
  imports: [RbacModule, AuditModule],
  controllers: [AuthController, UsersController, ApiKeysController],
  providers: [
    AuthService,
    AuthGuard,
    TokenService,
    UsersService,
    {
      provide: USER_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) =>
        new EsDocumentStore(es, esIndex, USERS_INDEX, USER_PROPERTIES),
    },
  ],
  exports: [AuthService, AuthGuard, UsersService],
})
export class AuthModule {}
