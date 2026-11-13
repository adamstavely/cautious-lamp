import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AuthGuard } from '../../auth/auth.guard';
import { AuthService, DEFAULT_SERVICE_PERMISSIONS } from '../../auth/auth.service';
import { SecurityAuditService } from '../../common/security/security-audit.service';
import { ALL_PERMISSIONS } from '../../rbac/rbac.service';
import { ApplicationDirectory, DesignSystemSource, GovernanceApplication } from '../sources';
import { DesignComponent, DesignToken } from '../governance.types';

export const API_KEY = 'test-key';
export const ADMIN_KEY = 'admin-key';

/** Stands in for AuthService: API_KEY gets the default API key permissions, ADMIN_KEY all of them */
export const fakeAuth = {
  async resolve(credential?: string) {
    const service = (id: string, permissions: readonly string[]) => ({
      type: 'service' as const,
      id,
      name: id,
      email: null,
      roles: [],
      permissions: new Set(permissions),
      mustChangePassword: false as const,
    });
    if (credential === API_KEY) return service('test-key', DEFAULT_SERVICE_PERMISSIONS);
    if (credential === ADMIN_KEY) return service('admin-key', ALL_PERMISSIONS);
    return null;
  },
};

export const authProviders = [
  { provide: AuthService, useValue: fakeAuth },
  { provide: SecurityAuditService, useValue: { logPermissionDenied: async () => undefined } },
  { provide: APP_GUARD, useClass: AuthGuard },
];

export class FakeApplications implements ApplicationDirectory {
  readonly apps = new Map<string, GovernanceApplication>();
  readonly scans: Array<{ id: string; at: Date }> = [];

  constructor(apps: GovernanceApplication[] = []) {
    apps.forEach((app) => this.apps.set(app.id, app));
  }

  async get(id: string) {
    return this.apps.get(id) ?? null;
  }

  async list() {
    return [...this.apps.values()];
  }

  async recordScan(id: string, at: Date) {
    this.scans.push({ id, at });
  }
}

export class FakeDesignSystem implements DesignSystemSource {
  constructor(
    public componentList: DesignComponent[] = [],
    public tokenList: DesignToken[] = [],
  ) {}

  async components() {
    return this.componentList;
  }

  async tokens() {
    return this.tokenList;
  }
}

/** Starts a Nest app on a random port and returns a JSON caller for it */
export async function startApp(metadata: Parameters<typeof Test.createTestingModule>[0]) {
  const moduleRef = await Test.createTestingModule(metadata).compile();
  const app: INestApplication = moduleRef.createNestApplication({ logger: false });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(0, '127.0.0.1');
  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  const call = async (method: string, route: string, body?: unknown, key: string | null = API_KEY) => {
    const res = await fetch(`${base}/api/v1${route}`, {
      method,
      headers: { ...(key ? { Authorization: `Bearer ${key}` } : {}), 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = text;
    }
    return { status: res.status, body: json };
  };
  return { app, moduleRef, base, call };
}
