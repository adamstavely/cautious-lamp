import { Controller, Delete, Get, NotFoundException, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as fs from 'fs';
import * as path from 'path';
import { Public, RequirePermission } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';
import { ApiVersioningController } from './api-versioning.controller';
import { ApiVersioningModule } from './api-versioning.module';
import { ApiVersioningService } from './api-versioning.service';

@Controller('api/v1/things')
class ThingsController {
  @Public()
  @Get()
  list() {
    return [];
  }

  @RequirePermission(Permission.COMPONENT_CREATE)
  @Post(':id')
  create() {
    return {};
  }

  @Delete(':id')
  remove() {
    return {};
  }
}

@Controller('legacy')
class LegacyController {
  @Get('items')
  items() {
    return [];
  }
}

const release = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8')).version;

describe('API versions', () => {
  let service: ApiVersioningService;
  let controller: ApiVersioningController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ApiVersioningModule],
      controllers: [ThingsController, LegacyController],
    }).compile();
    service = moduleRef.get(ApiVersioningService);
    controller = moduleRef.get(ApiVersioningController);
  });

  it('lists v1 as the only version, from the running server', () => {
    const v1 = { version: 'v1', status: 'current', basePath: '/api/v1', release, routeCount: 3 };
    expect(controller.getAllVersions()).toEqual([v1]);
    expect(controller.getCurrentVersion()).toEqual(v1);
    expect(controller.getVersion('1')).toEqual(v1);
    expect(() => controller.getVersion('v2')).toThrow(NotFoundException);
    expect(controller.checkVersionSupported('v1')).toEqual({ version: 'v1', supported: true });
    expect(controller.checkVersionSupported('v2')).toEqual({ version: 'v2', supported: false });
    // Nothing implies a newer version or a deprecation
    expect(JSON.stringify(controller.getAllVersions())).not.toMatch(/migration|sunset|deprecat|v2/i);
  });

  it('lists the routes the server registers, with who may call them', () => {
    const routes = service.getRoutes();
    expect(routes).toEqual(expect.arrayContaining([
      { method: 'GET', path: '/api/v1/things', versioned: true, public: true, permissions: [] },
      { method: 'POST', path: '/api/v1/things/:id', versioned: true, public: false, permissions: [Permission.COMPONENT_CREATE] },
      { method: 'DELETE', path: '/api/v1/things/:id', versioned: true, public: false, permissions: [] },
      { method: 'GET', path: '/legacy/items', versioned: false, public: false, permissions: [] },
      { method: 'GET', path: '/api/versions/current/routes', versioned: false, public: false, permissions: [] },
    ]));
    expect(routes.filter((route) => route.versioned)).toHaveLength(3);
  });
});
