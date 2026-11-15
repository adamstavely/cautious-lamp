import { Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { SEED_MARKER_PROPERTIES } from '../common/elasticsearch/seed-defaults';
import { EsDocumentStore } from '../reviews/document-store';
import {
  CHECKS_INDEX,
  CHECK_PROPERTIES,
  CHECK_STORE,
  CONTRIBUTION_META_INDEX,
  CONTRIBUTION_META_STORE,
  ContributionWorkflowService,
  GUIDELINES_INDEX,
  GUIDELINE_PROPERTIES,
  GUIDELINE_STORE,
  TEMPLATES_INDEX,
  TEMPLATE_PROPERTIES,
  TEMPLATE_STORE,
} from './contribution-workflow.service';
import { ContributionWorkflowController } from './contribution-workflow.controller';
import { GitHubPullRequests } from './github-pull-requests';
import { DesignSystemModule } from '../design-system/design-system.module';
import { GovernanceModule } from '../governance/governance.module';

const store = (provide: symbol, index: string, properties: Record<string, unknown>) => ({
  provide,
  inject: [ElasticsearchService, EsIndexService],
  useFactory: (es: ElasticsearchService, esIndex: EsIndexService) => new EsDocumentStore(es, esIndex, index, properties),
});

@Module({
  imports: [DesignSystemModule, GovernanceModule],
  controllers: [ContributionWorkflowController],
  providers: [
    ContributionWorkflowService,
    { provide: GitHubPullRequests, useFactory: () => new GitHubPullRequests() },
    store(GUIDELINE_STORE, GUIDELINES_INDEX, GUIDELINE_PROPERTIES),
    store(TEMPLATE_STORE, TEMPLATES_INDEX, TEMPLATE_PROPERTIES),
    store(CHECK_STORE, CHECKS_INDEX, CHECK_PROPERTIES),
    store(CONTRIBUTION_META_STORE, CONTRIBUTION_META_INDEX, SEED_MARKER_PROPERTIES),
  ],
  exports: [ContributionWorkflowService],
})
export class ContributionWorkflowModule {}
