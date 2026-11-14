import { ApiKeyDoc, KeyManagementService } from '../../common/security/key-management.service';
import { SecurityAuditService } from '../../common/security/security-audit.service';
import { RbacService, Role } from '../../rbac/rbac.service';
import { InMemoryRbacStore } from '../../rbac/testing/in-memory-rbac-store';
import { InMemoryStore } from '../../reviews/testing/in-memory-store';
import { AuthPrincipal } from '../principal';
import { AuthService } from '../auth.service';
import { TokenService } from '../token.service';
import { UserDoc } from '../user.types';
import { UsersService } from '../users.service';

export const API_KEY = 'test-api-key';
export const ADMIN_KEY = 'test-admin-key';
export const ADMIN_EMAIL = 'admin@example.com';
export const ADMIN_PASSWORD = 'correct horse battery';

/** SecurityAuditService stand-in that records calls */
export function createAuditStub() {
  return {
    logAuthFailure: jest.fn(async () => undefined),
    logAuthSuccess: jest.fn(async () => undefined),
    logAccountEvent: jest.fn(async () => undefined),
    logPermissionDenied: jest.fn(async () => undefined),
    logSecurityEvent: jest.fn(async () => undefined),
  };
}

const ENV_KEYS = ['API_KEYS', 'ADMIN_API_KEY', 'BOOTSTRAP_ADMIN_EMAIL', 'BOOTSTRAP_ADMIN_PASSWORD', 'BOOTSTRAP_ADMIN_NAME', 'AUTH_JWT_SECRET'];

/** Auth services over in-memory stores, with a bootstrap admin unless `bootstrap: false` */
export async function createAuthHarness(options: { bootstrap?: boolean } = {}) {
  const saved = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
  process.env.API_KEYS = API_KEY;
  process.env.ADMIN_API_KEY = ADMIN_KEY;
  delete process.env.AUTH_JWT_SECRET;
  if (options.bootstrap === false) {
    delete process.env.BOOTSTRAP_ADMIN_EMAIL;
    delete process.env.BOOTSTRAP_ADMIN_PASSWORD;
  } else {
    process.env.BOOTSTRAP_ADMIN_EMAIL = ADMIN_EMAIL;
    process.env.BOOTSTRAP_ADMIN_PASSWORD = ADMIN_PASSWORD;
  }

  const userStore = new InMemoryStore<UserDoc>();
  const rbacStore = new InMemoryRbacStore();
  const audit = createAuditStub();
  const rbac = new RbacService(rbacStore);
  const users = new UsersService(userStore, rbac, audit as unknown as SecurityAuditService);
  const tokens = new TokenService();
  const keyStore = new InMemoryStore<ApiKeyDoc>();
  const keys = new KeyManagementService(keyStore);
  const auth = new AuthService(users, tokens, keys, audit as unknown as SecurityAuditService);
  await rbac.onModuleInit();
  await users.onModuleInit();

  /** The principal for a credential, or throws if it isn't valid */
  async function principalFor(credential: string): Promise<AuthPrincipal> {
    const principal = await auth.resolve(credential);
    if (!principal) throw new Error('credential rejected');
    return principal;
  }

  /** Creates an active user with the given roles and returns a signed-in token */
  async function createUser(email: string, roles: Role[] = [], password = 'a long enough password') {
    const admin = await principalFor(ADMIN_KEY);
    const user = await users.create({ email, name: email.split('@')[0], password, roles }, admin);
    const { accessToken } = await auth.login(email, password);
    return { user, password, accessToken };
  }

  return {
    userStore,
    rbacStore,
    audit,
    rbac,
    users,
    tokens,
    keyStore,
    keys,
    auth,
    principalFor,
    createUser,
    restoreEnv() {
      for (const [key, value] of Object.entries(saved)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    },
  };
}

export type AuthHarness = Awaited<ReturnType<typeof createAuthHarness>>;
