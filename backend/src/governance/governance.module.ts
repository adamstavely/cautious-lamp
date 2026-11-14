import { Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ApplicationsModule } from '../applications/applications.module';
import { ApplicationsService } from '../applications/applications.service';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { DesignSystemModule } from '../design-system/design-system.module';
import { DesignSystemService } from '../design-system/design-system.service';
import { EsDocumentStore } from '../reviews/document-store';
import { GovernanceController } from './governance.controller';
import {
  META_INDEX,
  META_PROPERTIES,
  META_STORE,
  RULES_INDEX,
  RULE_PROPERTIES,
  RULE_STORE,
  SCANS_INDEX,
  SCAN_PROPERTIES,
  SCAN_STORE,
} from './governance-stores';
import { GovernanceScanScheduler } from './governance.scheduler';
import { RulesService } from './rules.service';
import { ScansService } from './scans.service';
import {
  APPLICATION_DIRECTORY,
  DESIGN_SYSTEM_SOURCE,
  DesignSystemServiceSource,
  RegistryApplicationDirectory,
} from './sources';

const esStore = (index: string, properties: Record<string, unknown>) => ({
  inject: [ElasticsearchService, EsIndexService],
  useFactory: (es: ElasticsearchService, esIndex: EsIndexService) => new EsDocumentStore(es, esIndex, index, properties),
});

/**
 * Compliance rules and scans (docs/GOVERNANCE.md). Applications come from
 * the registry (ApplicationsService) through APPLICATION_DIRECTORY; design
 * system components and tokens through DESIGN_SYSTEM_SOURCE, which adapts
 * DesignSystemService. GovernanceScanScheduler runs applications' daily and
 * weekly scans.
 */
@Module({
  imports: [DesignSystemModule, ApplicationsModule],
  controllers: [GovernanceController],
  providers: [
    RulesService,
    ScansService,
    GovernanceScanScheduler,
    { provide: RULE_STORE, ...esStore(RULES_INDEX, RULE_PROPERTIES) },
    { provide: SCAN_STORE, ...esStore(SCANS_INDEX, SCAN_PROPERTIES) },
    { provide: META_STORE, ...esStore(META_INDEX, META_PROPERTIES) },
    {
      provide: APPLICATION_DIRECTORY,
      inject: [ApplicationsService],
      useFactory: (registry: ApplicationsService) => new RegistryApplicationDirectory(registry),
    },
    {
      provide: DESIGN_SYSTEM_SOURCE,
      inject: [DesignSystemService],
      useFactory: (designSystem: DesignSystemService) => new DesignSystemServiceSource(designSystem),
    },
  ],
  exports: [APPLICATION_DIRECTORY, DESIGN_SYSTEM_SOURCE, RulesService, ScansService],
})
export class GovernanceModule {}
