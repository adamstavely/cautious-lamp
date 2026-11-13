import { Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { AdminReviewsController } from './admin-reviews.controller';
import {
  EsDocumentStore,
  REVIEWS_INDEX,
  REVIEW_PROPERTIES,
  REVIEW_STORE,
  TEAMS_INDEX,
  TEAM_PROPERTIES,
  TEAM_STORE,
} from './document-store';
import { ReviewFilesController } from './review-files.controller';
import { ReviewFilesService } from './review-files.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';

/** Design reviews and teams (docs/REVIEW_API.md) */
@Module({
  controllers: [ReviewsController, ReviewFilesController, AdminReviewsController, TeamsController],
  providers: [
    ReviewsService,
    TeamsService,
    ReviewFilesService,
    {
      provide: REVIEW_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) =>
        new EsDocumentStore(es, esIndex, REVIEWS_INDEX, REVIEW_PROPERTIES),
    },
    {
      provide: TEAM_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) =>
        new EsDocumentStore(es, esIndex, TEAMS_INDEX, TEAM_PROPERTIES),
    },
  ],
})
export class ReviewsModule {}
