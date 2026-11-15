import { Module, Global } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsDocumentStore } from '../../reviews/document-store';
import { EsIndexService } from '../elasticsearch/es-index.service';
import { EncryptionService } from './encryption.service';
import { API_KEYS_INDEX, API_KEY_PROPERTIES, API_KEY_STORE, KeyManagementService } from './key-management.service';
import { TokenRotationService } from './token-rotation.service';
import { AuditModule } from '../../audit/audit.module';

@Global()
@Module({
  imports: [AuditModule],
  providers: [
    EncryptionService,
    KeyManagementService,
    TokenRotationService,
    {
      provide: API_KEY_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) =>
        new EsDocumentStore(es, esIndex, API_KEYS_INDEX, API_KEY_PROPERTIES),
    },
  ],
  exports: [
    EncryptionService,
    KeyManagementService,
    TokenRotationService,
  ],
})
export class SecurityModule {}

