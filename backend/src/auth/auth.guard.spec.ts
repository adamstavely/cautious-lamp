import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminKeyGuard, ApiKeyGuard } from '../common/security/api-key.guard';
import { SecurityAuditService } from '../common/security/security-audit.service';
import { Permission, Role } from '../rbac/rbac.service';
import { AuthGuard } from './auth.guard';
import { AuthedRequest, Public, RequirePermission } from './principal';
import { ADMIN_KEY, API_KEY, AuthHarness, createAuthHarness } from './testing/harness';

class TestController {
  @Public()
  health() {}

  open() {}

  @RequirePermission(Permission.ADMIN_USERS)
  admin() {}

  @RequirePermission(Permission.TOKEN_VIEW, Permission.TOKEN_EDIT)
  tokens() {}
}

@RequirePermission(Permission.ADMIN_RBAC)
class AdminController {
  @RequirePermission(Permission.ADMIN_AUDIT)
  both() {}
}

function contextFor(handler: keyof TestController | 'both', authorization?: string) {
  const req = { headers: authorization ? { authorization } : {}, method: 'GET', url: '/x' } as unknown as AuthedRequest;
  const cls = handler === 'both' ? AdminController : TestController;
  const context = {
    getType: () => 'http',
    getHandler: () => cls.prototype[handler],
    getClass: () => cls,
    switchToHttp: () => ({ getRequest: () => req }),
  } as unknown as ExecutionContext;
  return { req, context };
}

describe('AuthGuard', () => {
  let h: AuthHarness;
  let guard: AuthGuard;

  beforeEach(async () => {
    h = await createAuthHarness();
    guard = new AuthGuard(new Reflector(), h.auth, h.audit as unknown as SecurityAuditService);
  });

  afterEach(() => h.restoreEnv());

  async function run(handler: keyof TestController | 'both', authorization?: string) {
    const { req, context } = contextFor(handler, authorization);
    await guard.canActivate(context);
    return req;
  }

  it('lets public routes through without a credential', async () => {
    const req = await run('health');
    expect(req.principal).toBeUndefined();
  });

  it('401s without a credential, or with a bad one', async () => {
    await expect(run('open')).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(run('open', 'Bearer nonsense')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts a user token and sets the principal', async () => {
    const { user, accessToken } = await h.createUser('ivy@example.com', [Role.DESIGNER]);
    const req = await run('open', `Bearer ${accessToken}`);
    expect(req.principal).toMatchObject({ type: 'user', id: user.id, email: 'ivy@example.com' });
    await expect(run('admin', `Bearer ${accessToken}`)).rejects.toBeInstanceOf(ForbiddenException);
    expect(h.audit.logPermissionDenied).toHaveBeenCalled();
  });

  it('accepts the admin key for everything', async () => {
    const req = await run('admin', `Bearer ${ADMIN_KEY}`);
    expect(req.principal).toMatchObject({ type: 'service', id: 'admin-key' });
    await run('both', `Bearer ${ADMIN_KEY}`);
  });

  it('gives an unscoped API key the default service permissions', async () => {
    await run('open', `Bearer ${API_KEY}`);
    await expect(run('admin', `Bearer ${API_KEY}`)).rejects.toBeInstanceOf(ForbiddenException);
    // token:view is a default, token:edit is not
    await expect(run('tokens', `Bearer ${API_KEY}`)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('limits a scoped API key to its scopes', async () => {
    const { key } = await h.keys.createKey('tokens-bot', { scopes: [Permission.TOKEN_VIEW, Permission.TOKEN_EDIT] });
    await run('tokens', `Bearer ${key}`);
    await expect(run('admin', `Bearer ${key}`)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('merges class and route permissions', async () => {
    const { key } = await h.keys.createKey('rbac-only', { scopes: [Permission.ADMIN_RBAC] });
    await expect(run('both', `Bearer ${key}`)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('leaves WebSocket handlers to the gateway', async () => {
    const context = { getType: () => 'ws' } as unknown as ExecutionContext;
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  describe('ApiKeyGuard and AdminKeyGuard', () => {
    it('accept any authenticated principal, and admin:users holders', async () => {
      const { accessToken } = await h.createUser('jo@example.com', [Role.SYSTEM_OWNER]);
      const req = await run('open', `Bearer ${accessToken}`);
      const context = { switchToHttp: () => ({ getRequest: () => req }) } as unknown as ExecutionContext;
      expect(new ApiKeyGuard().canActivate(context)).toBe(true);
      expect(new AdminKeyGuard().canActivate(context)).toBe(true); // system_owner has admin:users

      const designer = await h.createUser('kim@example.com', [Role.DESIGNER]);
      const designerReq = await run('open', `Bearer ${designer.accessToken}`);
      const designerContext = { switchToHttp: () => ({ getRequest: () => designerReq }) } as unknown as ExecutionContext;
      expect(() => new AdminKeyGuard().canActivate(designerContext)).toThrow(ForbiddenException);

      const none = { switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }) } as unknown as ExecutionContext;
      expect(() => new ApiKeyGuard().canActivate(none)).toThrow(UnauthorizedException);
    });
  });
});
