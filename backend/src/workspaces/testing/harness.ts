import { INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ApplicationsController } from '../../applications/applications.controller';
import { ApplicationsService } from '../../applications/applications.service';
import { APPLICATION_STORE, ApplicationDoc } from '../../applications/application.types';
import { AuthGuard } from '../../auth/auth.guard';
import { AuthService, DEFAULT_SERVICE_PERMISSIONS } from '../../auth/auth.service';
import { UsersService } from '../../auth/users.service';
import { SecurityAuditService } from '../../common/security/security-audit.service';
import { Permission } from '../../rbac/rbac.service';
import { SessionReplayService } from '../../session-replay/session-replay.service';
import { VisualRegressionService } from '../../visual-regression/visual-regression.service';
import { WORKSPACE_COMPONENT_SOURCE, WorkspaceComponent, WorkspaceComponentSource } from '../component-source';
import { WorkspaceAccessService } from '../workspace-access.service';
import { WorkspaceResourcesService } from '../workspace-resources.service';
import { WORKSPACE_RESOURCE_STORE, WORKSPACE_STORE, WorkspaceDoc, WorkspaceResourceDoc } from '../workspace.types';
import { WorkspacesController } from '../workspaces.controller';
import { WorkspacesService } from '../workspaces.service';
import { InMemoryQueryableStore } from './in-memory-queryable-store';

/** People the tests sign in as. The token for each is `tok-<key>`. */
export const PEOPLE = {
  owner: { id: 'usr_owner', email: 'owner@example.com', name: 'Olive Owner', permissions: [] as string[] },
  admin: { id: 'usr_admin', email: 'admin@example.com', name: 'Ada Admin', permissions: [] as string[] },
  editor: { id: 'usr_editor', email: 'editor@example.com', name: 'Eddie Editor', permissions: [] as string[] },
  viewer: { id: 'usr_viewer', email: 'viewer@example.com', name: 'Vera Viewer', permissions: [] as string[] },
  outsider: { id: 'usr_outsider', email: 'outsider@example.com', name: 'Otto Outsider', permissions: [] as string[] },
  other: { id: 'usr_other', email: 'other@example.com', name: 'Oscar Other', permissions: [] as string[] },
  superuser: { id: 'usr_super', email: 'super@example.com', name: 'Sue Super', permissions: [Permission.ADMIN_USERS] as string[] },
  governance: { id: 'usr_gov', email: 'gov@example.com', name: 'Gus Governance', permissions: [Permission.ADMIN_GOVERNANCE] as string[] },
};
export type PersonKey = keyof typeof PEOPLE;
export const API_KEY = 'svc-key';

/** Stands in for AuthService: `tok-<person>` is that person, API_KEY is a default API key */
const auth = {
  async resolve(credential?: string) {
    if (credential === API_KEY) {
      return {
        type: 'service' as const,
        id: 'svc',
        name: 'Service',
        email: null,
        roles: [],
        permissions: new Set<string>(DEFAULT_SERVICE_PERMISSIONS),
        mustChangePassword: false as const,
      };
    }
    const key = credential?.startsWith('tok-') ? (credential.slice(4) as PersonKey) : undefined;
    const person = key && PEOPLE[key];
    if (!person) return null;
    return {
      type: 'user' as const,
      id: person.id,
      email: person.email,
      name: person.name,
      roles: [],
      permissions: new Set(person.permissions),
      mustChangePassword: false,
    };
  },
};

/** Stands in for UsersService (lookups only); `disabled@example.com` is a disabled user */
const users = {
  async findByEmail(email: string) {
    if (email === 'disabled@example.com') return { id: 'usr_disabled', email, name: 'Dis Abled', status: 'disabled' };
    const person = Object.values(PEOPLE).find((p) => p.email === email.toLowerCase());
    return person ? { id: person.id, email: person.email, name: person.name, status: 'active' } : null;
  },
  async findById(id: string) {
    const person = Object.values(PEOPLE).find((p) => p.id === id);
    return person ? { id: person.id, email: person.email, name: person.name, status: 'active' } : null;
  },
};

/** In-memory components and usage, standing in for DesignSystemService and AnalyticsService */
export function createComponentSource() {
  const components: WorkspaceComponent[] = [];
  const usage = new Map<string, Array<{ applicationId: string; usageCount: number }>>();
  const source: WorkspaceComponentSource = {
    listComponents: () => components,
    getComponent: (id) => components.find((c) => c.id === id),
    usage: (id) => usage.get(id) ?? [],
    setSharing: (id, sharing) => {
      const c = components.find((x) => x.id === id);
      if (!c) return undefined;
      c.isGlobal = sharing.isGlobal;
      c.sharedWith = sharing.isGlobal ? undefined : sharing.sharedWith;
      return c;
    },
  };
  return { components, usage, source };
}

/** Records project calls; `failVrCreate` makes the next createProject throw like Argos rejecting a token */
export function createVisualRegressionFake() {
  const projects = new Map<string, unknown>();
  let seq = 0;
  const fake = {
    failVrCreate: false,
    created: [] as unknown[],
    deleted: [] as string[],
    async createProject(_teamId: string, dto: Record<string, unknown>) {
      if (fake.failVrCreate) {
        fake.failVrCreate = false;
        const { BadRequestException } = await import('@nestjs/common');
        throw new BadRequestException('Unable to connect to Argos instance. Please check your base URL and token.');
      }
      const project = { id: `vr-${++seq}`, ...dto, argosBaseUrl: dto.argosBaseUrl ?? 'https://app.argos-ci.com' };
      projects.set(project.id, project);
      fake.created.push(dto);
      return project;
    },
    async updateProject(id: string, dto: unknown) {
      if (!projects.has(id)) throw new NotFoundException('nope');
      return { id, ...(dto as object) };
    },
    async deleteProject(id: string) {
      if (!projects.delete(id)) throw new NotFoundException('nope');
      fake.deleted.push(id);
    },
  };
  return fake;
}

/** The workspaces and applications controllers over HTTP, with the real AuthGuard and in-memory storage */
export async function createWorkspacesApp() {
  const workspaceStore = new InMemoryQueryableStore<WorkspaceDoc>();
  const resourceStore = new InMemoryQueryableStore<WorkspaceResourceDoc>();
  const applicationStore = new InMemoryQueryableStore<ApplicationDoc>();
  const components = createComponentSource();
  const vr = createVisualRegressionFake();
  // The real session-replay service, so OpenReplay URL checks run for real (no API key: no network calls)
  const sessionReplay = new SessionReplayService();

  const moduleRef = await Test.createTestingModule({
    controllers: [WorkspacesController, ApplicationsController],
    providers: [
      WorkspacesService,
      WorkspaceResourcesService,
      WorkspaceAccessService,
      ApplicationsService,
      { provide: WORKSPACE_STORE, useValue: workspaceStore },
      { provide: WORKSPACE_RESOURCE_STORE, useValue: resourceStore },
      { provide: APPLICATION_STORE, useValue: applicationStore },
      { provide: WORKSPACE_COMPONENT_SOURCE, useValue: components.source },
      { provide: VisualRegressionService, useValue: vr },
      { provide: SessionReplayService, useValue: sessionReplay },
      { provide: UsersService, useValue: users },
      { provide: AuthService, useValue: auth },
      { provide: SecurityAuditService, useValue: { logPermissionDenied: async () => undefined } },
      { provide: APP_GUARD, useClass: AuthGuard },
    ],
  }).compile();
  const app: INestApplication = moduleRef.createNestApplication({ logger: false });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(0, '127.0.0.1');
  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');

  /** Calls the API as a person (or with a raw credential, or none) */
  const call = async (as: PersonKey | { credential?: string }, method: string, route: string, body?: unknown) => {
    const credential = typeof as === 'string' ? `tok-${as}` : as.credential;
    const res = await fetch(`${base}/api/v1${route}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(credential ? { Authorization: `Bearer ${credential}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let json: any;
    try {
      json = text ? JSON.parse(text) : undefined;
    } catch {
      json = text;
    }
    return { status: res.status, body: json };
  };

  return { app, call, workspaceStore, resourceStore, applicationStore, components, vr, sessionReplay };
}
