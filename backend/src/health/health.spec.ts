import { HttpStatus } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as fs from 'fs';
import * as path from 'path';
import { HealthController } from './health.controller';
import { HealthService, packageVersion } from './health.service';

const backendVersion = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8')).version;

describe('health', () => {
  const ping = jest.fn();
  const service = new HealthService({ ping } as unknown as ElasticsearchService);
  const controller = new HealthController(service);
  const response = () => ({ status: jest.fn() });

  beforeEach(() => ping.mockReset());

  it('reports ok with the package version when Elasticsearch answers', async () => {
    ping.mockResolvedValue(true);
    const res = response();
    const report = await controller.check(res as any);
    expect(report).toMatchObject({ status: 'ok', version: backendVersion, elasticsearch: { status: 'up' } });
    expect(Date.parse(report.timestamp)).not.toBeNaN();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('answers 503 with the reason when Elasticsearch is unreachable', async () => {
    ping.mockRejectedValue(new Error('connect ECONNREFUSED 127.0.0.1:9200'));
    const res = response();
    const report = await controller.check(res as any);
    expect(report).toMatchObject({ status: 'unavailable', elasticsearch: { status: 'down', error: 'connect ECONNREFUSED 127.0.0.1:9200' } });
    expect(res.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
  });

  it('finds the nearest package.json, from deeper folders too', () => {
    expect(packageVersion()).toBe(backendVersion);
    expect(packageVersion(path.join(__dirname, 'not', 'a', 'real', 'folder'))).toBe(backendVersion);
  });

  it('is the only health route', () => {
    const declared: string[] = [];
    const walk = (dir: string) => {
      for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        if (fs.statSync(full).isDirectory()) walk(full);
        else if (name.endsWith('.controller.ts') && !/ \d\./.test(name) && /@Get\('\/?health'\)/.test(fs.readFileSync(full, 'utf8'))) declared.push(path.relative(path.join(__dirname, '..'), full));
      }
    };
    walk(path.join(__dirname, '..'));
    expect(declared).toEqual([path.join('health', 'health.controller.ts')]);
  });
});
