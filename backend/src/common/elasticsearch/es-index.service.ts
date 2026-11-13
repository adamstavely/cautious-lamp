import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

/** Index names this app writes to */
const INDEX_PATTERNS = [
  'design-system-*',
  'color-palettes',
  'nasa-tlx',
  'sus-scores',
  'heuristic-evaluations',
  'reviews*',
];

/**
 * Installs an index template so string fields are mapped as `keyword` (with a
 * `.text` subfield for full-text search). Services look records up with `term`
 * queries on ids and emails, which never match dynamically mapped `text` fields.
 */
@Injectable()
export class EsIndexService implements OnModuleInit {
  private readonly logger = new Logger(EsIndexService.name);
  private ready: Promise<boolean> | null = null;

  constructor(private readonly elasticsearch: ElasticsearchService) {}

  onModuleInit(): void {
    // Not awaited: the app should still start when Elasticsearch is down.
    void this.ensureTemplate();
  }

  /** Resolves true once the template is installed, false if Elasticsearch is unreachable */
  ensureTemplate(): Promise<boolean> {
    if (!this.ready) {
      this.ready = this.installTemplate().then(
        () => true,
        (error) => {
          this.logger.warn(`Elasticsearch unavailable, index template not installed: ${error.message}`);
          this.ready = null;
          return false;
        },
      );
    }
    return this.ready;
  }

  /** Throws a 503 when Elasticsearch can't be reached, for write paths that must not pretend to succeed */
  async assertAvailable(): Promise<void> {
    if (!(await this.ensureTemplate())) {
      throw new ServiceUnavailableException('Storage is unavailable, please try again later');
    }
  }

  private async installTemplate(): Promise<void> {
    await this.elasticsearch.indices.putIndexTemplate({
      name: 'cautious-lamp-defaults',
      index_patterns: INDEX_PATTERNS,
      priority: 10,
      template: {
        mappings: {
          dynamic_templates: [
            {
              strings_as_keywords: {
                match_mapping_type: 'string',
                mapping: {
                  type: 'keyword',
                  ignore_above: 1024,
                  fields: { text: { type: 'text' } },
                },
              },
            },
          ],
        },
      },
    });
    this.logger.log('Elasticsearch index template installed');
  }
}

/** HTTP status from an Elasticsearch client error, if it has one */
export function esStatusCode(error: unknown): number | undefined {
  return (error as { meta?: { statusCode?: number } })?.meta?.statusCode;
}

/** Whether an Elasticsearch error means the document or index doesn't exist */
export function isEsNotFound(error: unknown): boolean {
  return esStatusCode(error) === 404;
}
