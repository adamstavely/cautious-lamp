import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { DesignSystemModule } from '../design-system/design-system.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [DesignSystemModule, WorkspacesModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}





