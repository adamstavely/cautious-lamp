import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';

export interface HealthReport {
  /** ok when every dependency answers */
  status: 'ok' | 'unavailable';
  /** The API's version, from backend/package.json */
  version: string;
  timestamp: string;
  elasticsearch: { status: 'up' | 'down'; error?: string };
}

/** The backend's package.json version: the nearest package.json above this file, from src/ or dist/ alike */
export function packageVersion(from = __dirname): string {
  for (let dir = from; ; dir = dirname(dir)) {
    try {
      const version = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).version;
      if (typeof version === 'string') return version;
    } catch {
      // No package.json here; keep looking up
    }
    if (dirname(dir) === dir) return 'unknown';
  }
}

/** Whether the API can serve requests: Elasticsearch holds all of its data */
@Injectable()
export class HealthService {
  private readonly version = packageVersion();

  constructor(private readonly elasticsearch: ElasticsearchService) {}

  async check(): Promise<HealthReport> {
    let elasticsearch: HealthReport['elasticsearch'];
    try {
      await this.elasticsearch.ping();
      elasticsearch = { status: 'up' };
    } catch (error) {
      elasticsearch = { status: 'down', error: (error as Error)?.message || 'Elasticsearch did not answer' };
    }
    return {
      status: elasticsearch.status === 'up' ? 'ok' : 'unavailable',
      version: this.version,
      timestamp: new Date().toISOString(),
      elasticsearch,
    };
  }
}
