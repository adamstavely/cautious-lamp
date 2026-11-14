import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AuthGuard } from '../../auth/auth.guard';
import { AuthService, DEFAULT_SERVICE_PERMISSIONS } from '../../auth/auth.service';
import { SecurityAuditService } from '../../common/security/security-audit.service';
import type { ScanKind } from '../../applications/applications.service';
import { ComponentAccessService } from '../../design-system/component-access.service';
import { DesignSystemService } from '../../design-system/design-system.service';
import { ALL_PERMISSIONS, Permission } from '../../rbac/rbac.service';
import { InMemoryQueryableStore } from '../../workspaces/testing/in-memory-queryable-store';
import { WorkspaceAccessService } from '../../workspaces/workspace-access.service';
import { WORKSPACE_STORE, WorkspaceDoc } from '../../workspaces/workspace.types';
import { READ_SCOPE } from '../evidence-access';
import { ApplicationDirectory, DesignSystemSource, GovernanceApplication } from '../sources';
import { DesignComponent, DesignToken } from '../governance.types';

export const API_KEY = 'test-key';
export const ADMIN_KEY = 'admin-key';

/**
 * Signed-in people for workspace-scoped tests: the credential `user-<name>`
 * is the user `usr_<name>` with component:view. `user-gov` also has
 * admin:governance, `user-super` admin:users.
 */
export const userKey = (name: string) => `user-${name}`;

/** Stands in for AuthService: API_KEY gets the default API key permissions, ADMIN_KEY all of them, user-<name> a person */
export const fakeAuth = {
  async resolve(credential?: string) {
    if (credential?.startsWith('user-')) {
      const name = credential.slice(5);
      const extra = name === 'gov' ? [Permission.ADMIN_GOVERNANCE] : name === 'super' ? [Permission.ADMIN_USERS] : [];
      return {
        type: 'user' as const,
        id: `usr_${name}`,
        email: `${name}@example.com`,
        name,
        roles: [],
        permissions: new Set<string>([Permission.COMPONENT_VIEW, ...extra]),
        mustChangePassword: false,
      };
    }
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
  readonly scans: Array<{ id: string; at: Date; kind: ScanKind }> = [];

  constructor(apps: GovernanceApplication[] = []) {
    apps.forEach((app) => this.apps.set(app.id, app));
  }

  async get(id: string) {
    return this.apps.get(id) ?? null;
  }

  async list() {
    return [...this.apps.values()];
  }

  async recordScan(id: string, at: Date, kind: ScanKind) {
    this.scans.push({ id, at, kind });
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

/** A workspace whose only member (its owner) is `usr_<member>` */
export function workspace(id: string, member: string): WorkspaceDoc {
  const userId = `usr_${member}`;
  return { id, name: id, members: [{ userId, email: `${member}@example.com`, name: member, role: 'owner' }], memberIds: [userId] } as unknown as WorkspaceDoc;
}

/**
 * The real read scope (ComponentAccessService over WorkspaceAccessService)
 * bound to READ_SCOPE, with the given workspaces stored in memory.
 */
export function readScopeProviders(workspaces: WorkspaceDoc[] = []) {
  const store = new InMemoryQueryableStore<WorkspaceDoc>();
  workspaces.forEach((ws) => store.forceWrite(ws));
  return [
    DesignSystemService,
    ComponentAccessService,
    WorkspaceAccessService,
    { provide: WORKSPACE_STORE, useValue: store },
    { provide: READ_SCOPE, useExisting: ComponentAccessService },
  ];
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
