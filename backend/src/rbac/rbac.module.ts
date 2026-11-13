import { Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { RbacService } from './rbac.service';
import { RbacController } from './rbac.controller';
import { EsRbacStore, RBAC_STORE } from './rbac.store';

/** Roles and permissions. The controller uses UsersService from the global AuthModule. */
@Module({
  imports: [],
  providers: [
    RbacService,
    {
      provide: RBAC_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) => new EsRbacStore(es, esIndex),
    },
  ],
  controllers: [RbacController],
  exports: [RbacService],
})
export class RbacModule {}
