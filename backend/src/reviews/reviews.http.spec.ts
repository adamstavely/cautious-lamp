import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { existsSync, readdirSync } from 'fs';
import * as path from 'path';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService, DEFAULT_SERVICE_PERMISSIONS } from '../auth/auth.service';
import { SecurityAuditService } from '../common/security/security-audit.service';
import { ALL_PERMISSIONS, Permission } from '../rbac/rbac.service';
import { AdminReviewsController } from './admin-reviews.controller';
import { REVIEW_STORE, TEAM_STORE } from './document-store';
import { ReviewFilesController } from './review-files.controller';
import { ReviewFilesService } from './review-files.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { SAMPLE_FILES, createHarness } from './testing/harness';

const API_KEY = 'test-key';
const ADMIN_KEY = 'admin-key';

const DESIGNER_PERMISSIONS = [Permission.REVIEW_VIEW, Permission.REVIEW_CREATE];
const DECIDER_PERMISSIONS = [...DESIGNER_PERMISSIONS, Permission.REVIEW_APPROVE, Permission.REVIEW_REJECT];
/** Signed-in users, by bearer token: [email, name, roles, permissions] */
const USERS: Record<string, [string, string, string[], string[]]> = {
  'sarah-token': ['sarah@example.com', 'Sarah Johnson', ['designer'], DESIGNER_PERMISSIONS],
  'other-token': ['other@example.com', 'Olly Other', ['designer'], DESIGNER_PERMISSIONS],
  'client-token': ['client@example.com', 'Carla Client', ['client'], DECIDER_PERMISSIONS],
  'ad-token': ['ad@example.com', 'Art Director', ['art_director'], DECIDER_PERMISSIONS],
  'manager-token': ['manager@example.com', 'Review Manager', ['review_manager'], [...DECIDER_PERMISSIONS, Permission.REVIEW_ADMIN]],
};
const as = (token: keyof typeof USERS | typeof API_KEY | typeof ADMIN_KEY) => ({ Authorization: `Bearer ${token}` });

/** Stands in for AuthService: the two keys resolve like API_KEYS and ADMIN_API_KEY do, and USERS like signed-in users */
const auth = {
  async resolve(credential?: string) {
    const user = credential ? USERS[credential] : undefined;
    if (user) {
      const [email, name, roles, permissions] = user;
      return { type: 'user' as const, id: email, email, name, roles, permissions: new Set(permissions), mustChangePassword: false };
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
const audit = { logPermissionDenied: async () => undefined };

/** End-to-end over HTTP, with in-memory storage in place of Elasticsearch */
describe('Reviews HTTP API', () => {
  let h: ReturnType<typeof createHarness>;
  let app: INestApplication;
  let base: string;

  // Sarah, signed in, unless a test says otherwise
  const headers = (extra: Record<string, string> = {}) => ({
    ...as('sarah-token'),
    'Content-Type': 'application/json',
    ...extra,
  });
  const call = (method: string, route: string, body?: unknown, extra: Record<string, string> = {}) =>
    fetch(`${base}/api/v1${route}`, {
      method,
      headers: headers(extra),
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  beforeAll(async () => {
    h = createHarness();
    const moduleRef = await Test.createTestingModule({
      controllers: [ReviewsController, ReviewFilesController, AdminReviewsController, TeamsController],
      providers: [
        ReviewsService,
        TeamsService,
        { provide: ReviewFilesService, useValue: h.files },
        { provide: REVIEW_STORE, useValue: h.store },
        { provide: TEAM_STORE, useValue: h.teamStore },
        { provide: AuthService, useValue: auth },
        { provide: SecurityAuditService, useValue: audit },
        { provide: APP_GUARD, useClass: AuthGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication({ rawBody: true, logger: false });
    app.useGlobalPipes(new ValidationPipe());
    await app.listen(0, '127.0.0.1');
    base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  });

  afterAll(async () => {
    await app.close();
    h.cleanup();
  });

  async function createUploadedReview(file = SAMPLE_FILES.pdf, type = 'application/pdf') {
    const created = await call('POST', '/upload', { filename: 'Home.pdf' });
    expect(created.status).toBe(201);
    const { reviewId, uploadUrl } = await created.json();
    const put = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': type }, body: file });
    expect(put.status).toBe(200);
    return { reviewId, uploadUrl, put: await put.json() };
  }

  it('requires an API key, and admin:users (the admin key) for admin routes', async () => {
    expect((await fetch(`${base}/api/v1/reviews`)).status).toBe(401);
    expect((await call('GET', '/reviews')).status).toBe(200);
    expect((await call('GET', '/admin/reviews')).status).toBe(403);
    expect((await call('GET', '/admin/reviews', undefined, { Authorization: `Bearer ${ADMIN_KEY}` })).status).toBe(200);
  });

  it('rejects unknown body fields', async () => {
    const res = await call('POST', '/review/create-from-url', { url: 'https://example.com/a.png', password_plain: 'x' });
    expect(res.status).toBe(400);
  });

  it('uploads through the one-time PUT without an API key, once', async () => {
    const { reviewId, uploadUrl, put } = await createUploadedReview();
    expect(put).toEqual({ success: true, versionId: 'v1' });
    const again = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'application/pdf' }, body: SAMPLE_FILES.pdf });
    expect(again.status).toBe(403);
    const review = await (await call('GET', `/review/${reviewId}`)).json();
    expect(review.versions[0]).toMatchObject({ id: 'v1', contentType: 'application/pdf' });
  });

  it('rejects disallowed types and bodies over 50MB on the PUT', async () => {
    const { uploadUrl } = await (await call('POST', '/upload', { filename: 'x.pdf' })).json();
    const html = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'text/html' }, body: '<html>' });
    expect(html.status).toBe(415);
    const big = Buffer.alloc(50 * 1024 * 1024 + 1);
    big.write('%PDF-');
    const tooBig = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'application/pdf' }, body: big });
    expect(tooBig.status).toBe(413);
  });

  it('accepts a 50MB file on the PUT', async () => {
    const { uploadUrl, reviewId } = await (await call('POST', '/upload', { filename: 'big.pdf' })).json();
    const body = Buffer.alloc(50 * 1024 * 1024);
    body.write('%PDF-1.4');
    const res = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'application/pdf' }, body });
    expect(res.status).toBe(200);
    const review = await (await call('GET', `/review/${reviewId}`)).json();
    expect(review.versions[0].size).toBe(50 * 1024 * 1024);
  }, 30000);

  it('serves files from signed URLs with safe headers', async () => {
    const { reviewId } = await createUploadedReview(SAMPLE_FILES.svg, 'image/svg+xml');
    const { url } = await (await call('GET', `/review/${reviewId}/version/v1`)).json();
    const file = await fetch(url);
    expect(file.status).toBe(200);
    expect(file.headers.get('content-type')).toBe('image/svg+xml');
    expect(file.headers.get('x-content-type-options')).toBe('nosniff');
    expect(file.headers.get('content-security-policy')).toBe("default-src 'none'; style-src 'unsafe-inline'; sandbox");
    expect(file.headers.get('content-disposition')).toMatch(/^inline; filename="Home\.pdf"/);
    expect(Buffer.from(await file.arrayBuffer())).toEqual(SAMPLE_FILES.svg);

    const tampered = url.replace(/sig=[^&]+/, 'sig=AAAA');
    expect((await fetch(tampered)).status).toBe(403);
  });

  it('adds versions over multipart and rejects other types before storing them', async () => {
    const { reviewId } = await createUploadedReview();
    const form = new FormData();
    form.append('label', 'Round 2');
    form.append('notes', 'Bigger logo');
    form.append('file', new Blob([SAMPLE_FILES.png], { type: 'image/png' }), 'round2.png');
    const res = await fetch(`${base}/api/v1/review/${reviewId}/versions`, {
      method: 'POST',
      headers: as('sarah-token'),
      body: form,
    });
    expect(res.status).toBe(201);
    expect(await res.json()).toMatchObject({ id: 'v2', label: 'Round 2', filename: 'round2.png', contentType: 'image/png' });

    const bad = new FormData();
    bad.append('label', 'Nope');
    bad.append('file', new Blob(['<html>'], { type: 'text/html' }), 'x.html');
    const rejected = await fetch(`${base}/api/v1/review/${reviewId}/versions`, {
      method: 'POST',
      headers: as('sarah-token'),
      body: bad,
    });
    expect(rejected.status).toBe(415);

    const noLabel = new FormData();
    noLabel.append('file', new Blob([SAMPLE_FILES.png], { type: 'image/png' }), 'x.png');
    const invalid = await fetch(`${base}/api/v1/review/${reviewId}/versions`, {
      method: 'POST',
      headers: as('sarah-token'),
      body: noLabel,
    });
    expect(invalid.status).toBe(400);
    const incoming = h.files.incomingDir;
    expect(existsSync(incoming) ? readdirSync(incoming) : []).toEqual([]);

    const huge = new FormData();
    huge.append('label', 'Huge');
    const hugeBytes = Buffer.alloc(50 * 1024 * 1024 + 1);
    hugeBytes.write('%PDF-');
    huge.append('file', new Blob([hugeBytes], { type: 'application/pdf' }), 'huge.pdf');
    const tooBig = await fetch(`${base}/api/v1/review/${reviewId}/versions`, {
      method: 'POST',
      headers: as('sarah-token'),
      body: huge,
    });
    expect(tooBig.status).toBe(413);
    expect(existsSync(incoming) ? readdirSync(incoming) : []).toEqual([]);

    const unauthorized = await fetch(`${base}/api/v1/review/${reviewId}/versions`, { method: 'POST', body: form });
    expect(unauthorized.status).toBe(401);
    expect(readdirSync(path.join(h.dir, reviewId))).toHaveLength(2);
  });

  it('enforces passwords via the header and returns 401 passwordRequired', async () => {
    const created = await call('POST', '/review/create-from-url', { url: 'https://example.com/a.png', password: 'hunter2' });
    const { reviewId, review } = await created.json();
    expect(review.hasPassword).toBe(true);
    expect(review).not.toHaveProperty('passwordHash');
    const other = as('other-token');
    const denied = await call('GET', `/review/${reviewId}`, undefined, other);
    expect(denied.status).toBe(401);
    expect(await denied.json()).toMatchObject({ passwordRequired: true });
    expect((await call('GET', `/review/${reviewId}?password=hunter2`, undefined, other)).status).toBe(401);
    expect((await call('GET', `/review/${reviewId}`, undefined, { ...other, 'x-review-password': 'hunter2' })).status).toBe(200);
    // Writes need it too
    expect((await call('POST', `/review/${reviewId}/comments`, { text: 'x' }, other)).status).toBe(401);
    // The designer doesn't
    expect((await call('GET', `/review/${reviewId}`)).status).toBe(200);
  });

  it('accepts URL-encoded non-ASCII passwords and names in headers', async () => {
    const password = 'pässwörd ✓ 100%';
    const created = await call('POST', '/review/create-from-url', { url: 'https://example.com/a.png', password });
    const { reviewId } = await created.json();
    // An API key's x-user-name labels what it writes
    const headers = {
      ...as(API_KEY),
      'x-review-password': encodeURIComponent(password),
      'x-user-email': 'jose@example.com',
      'x-user-name': encodeURIComponent('José Núñez'),
    };
    expect((await call('GET', `/review/${reviewId}`, undefined, headers)).status).toBe(200);
    expect((await call('GET', `/review/${reviewId}`, undefined, { ...as(API_KEY), 'x-review-password': 'pässwörd' })).status).toBe(401);
    const comment = await call('POST', `/review/${reviewId}/comments`, { text: 'Hola' }, headers);
    expect(await comment.json()).toMatchObject({ author: 'José Núñez' });
  });

  it('returns 409 for invalid workflow transitions and 403 for unapproved emails', async () => {
    const { reviewId } = await (
      await call('POST', '/review/create-from-url', {
        url: 'https://example.com/a.png',
        sharingMode: 'approved_emails',
        approvedEmails: ['Client@Example.com'],
      })
    ).json();
    const manager = as('manager-token');
    expect((await call('POST', `/review/${reviewId}/workflow/approve`, { stage: 'client_review' }, manager)).status).toBe(409);
    expect((await call('POST', `/review/${reviewId}/workflow/approve`, { stage: 'nope' })).status).toBe(400);
    expect((await call('POST', `/review/${reviewId}/workflow/move-to-client-review`)).status).toBe(200);
    expect((await call('GET', `/review/${reviewId}`, undefined, as('other-token'))).status).toBe(403);
    expect((await call('GET', `/review/${reviewId}`, undefined, as('client-token'))).status).toBe(200);
  });

  it('runs comments, admin and team routes', async () => {
    const { reviewId } = await (await call('POST', '/review/create-from-url', { url: 'https://example.com/a.png' })).json();
    const comment = await (await call('POST', `/review/${reviewId}/comments`, { text: 'Hi', version: 'v1', type: 'general' })).json();
    const reacted = await (await call('POST', `/review/${reviewId}/comments/${comment.id}/reactions`, { emoji: '👍' })).json();
    expect(reacted.reactions).toEqual({ '👍': ['sarah@example.com'] });
    expect((await call('DELETE', `/review/${reviewId}/comments/${comment.id}`)).status).toBe(204);

    const admin = { Authorization: `Bearer ${ADMIN_KEY}` };
    expect((await call('POST', `/admin/reviews/${reviewId}/extend?days=400`, undefined, admin)).status).toBe(400);
    expect((await call('POST', `/admin/reviews/${reviewId}/extend?days=5`, undefined, admin)).status).toBe(200);
    expect(await (await call('POST', `/admin/reviews/${reviewId}/reset-password`, { password: 'pw' }, admin)).json()).toEqual({
      hasPassword: true,
    });
    expect((await call('DELETE', `/admin/reviews/${reviewId}`, undefined, admin)).status).toBe(204);
    expect((await call('GET', `/review/${reviewId}`)).status).toBe(404);

    // Team membership grants review access, so only review admins change teams
    expect((await call('POST', '/teams', { name: 'Nope' })).status).toBe(403);
    const manager = as('manager-token');
    const team = await (await call('POST', '/teams', { name: 'Alpha' }, manager)).json();
    expect(team).toMatchObject({ name: 'Alpha', description: '', members: [] });
    const withMember = await (
      await call('POST', `/teams/${team.id}/members`, { email: 'Mike@Example.com', name: 'Mike', role: 'Designer' }, manager)
    ).json();
    expect(withMember.members).toEqual([{ email: 'mike@example.com', name: 'Mike', role: 'Designer' }]);
    expect((await call('POST', `/teams/${team.id}/members`, { email: 'mike@example.com', name: 'M', role: 'x' }, manager)).status).toBe(409);
    const promoted = await (await call('PATCH', `/teams/${team.id}/members/mike@example.com`, { role: 'Art Director' }, manager)).json();
    expect(promoted.members[0].role).toBe('Art Director');
    expect((await (await call('DELETE', `/teams/${team.id}/members/mike@example.com`, undefined, manager)).json()).members).toEqual([]);
    expect((await call('DELETE', `/teams/${team.id}`)).status).toBe(403);
    expect((await call('DELETE', `/teams/${team.id}`, undefined, manager)).status).toBe(204);
    expect((await call('GET', `/teams/${team.id}`)).status).toBe(404);
  });

  // ------------------------------------------------------------ access control

  const createAs = async (token: Parameters<typeof as>[0], body: Record<string, unknown> = {}) => {
    const res = await call('POST', '/review/create-from-url', { url: 'https://example.com/private.png', ...body }, as(token));
    expect(res.status).toBe(201);
    return (await res.json()).reviewId as string;
  };
  const get = async (id: string, token: Parameters<typeof as>[0], extra: Record<string, string> = {}) =>
    call('GET', `/review/${id}`, undefined, { ...as(token), ...extra });

  it('lets only the designer or a review admin change sharing or the password, without leaking the review', async () => {
    const id = await createAs('sarah-token');
    await call('POST', `/review/${id}/comments`, { text: 'Secret note' });

    // Other can read an "anyone" review, but not lock everyone else out of it or take it over
    expect((await get(id, 'other-token')).status).toBe(200);
    for (const [route, body] of [
      ['sharing', { sharingMode: 'approved_emails', approvedEmails: ['other@example.com'] }],
      ['password', { password: 'mine-now' }],
    ] as const) {
      for (const token of ['other-token', 'client-token', API_KEY] as const) {
        const res = await call('POST', `/review/${id}/${route}`, body, as(token));
        expect(res.status).toBe(403);
        expect(JSON.stringify(await res.json())).not.toContain('Secret note');
      }
    }
    const stored = h.store.docs.get(id)!.doc;
    expect(stored).toMatchObject({ sharingMode: 'anyone', passwordHash: null });

    // A caller who can't read the review can't change it either
    const restricted = await createAs('sarah-token', { sharingMode: 'approved_emails', approvedEmails: ['client@example.com'] });
    expect((await call('POST', `/review/${restricted}/password`, { password: '' }, as('other-token'))).status).toBe(403);
    expect((await call('POST', `/review/${restricted}/comments`, { text: 'hi' }, as('other-token'))).status).toBe(403);

    // The designer and a review admin can
    const shared = await call('POST', `/review/${id}/sharing`, { sharingMode: 'approved_emails', approvedEmails: ['client@example.com'] });
    expect(shared.status).toBe(200);
    expect(await shared.json()).toMatchObject({ sharingMode: 'approved_emails', approvedEmails: ['client@example.com'] });
    expect((await call('POST', `/review/${id}/password`, { password: 'pw' }, as('manager-token'))).status).toBe(200);
    expect((await call('POST', `/review/${id}/password`, { password: '' })).status).toBe(200);
  });

  it('lists only what the caller could open, and hides approved emails from viewers', async () => {
    const open = await createAs('sarah-token', { filename: 'list-open' });
    const restricted = await createAs('sarah-token', {
      filename: 'list-restricted',
      sharingMode: 'approved_emails',
      approvedEmails: ['client@example.com'],
    });
    const locked = await createAs('sarah-token', { filename: 'list-locked', password: 'pw' });
    const expired = await createAs('sarah-token', { filename: 'list-expired' });
    const entry = h.store.docs.get(expired)!;
    h.store.forceWrite({ ...entry.doc, expiresAt: new Date(Date.now() - 1000).toISOString() });

    const listed = async (token: Parameters<typeof as>[0], extra: Record<string, string> = {}, query = '') => {
      const res = await call('GET', `/reviews?q=list-${query}`, undefined, { ...as(token), ...extra });
      expect(res.status).toBe(200);
      return (await res.json()).reviews as Array<{ id: string; approvedEmails: string[]; allowedActions: string[] }>;
    };
    const ids = (reviews: Array<{ id: string }>) => reviews.map((r) => r.id).sort();

    expect(ids(await listed('sarah-token'))).toEqual([open, restricted, locked].sort());
    expect(ids(await listed('sarah-token', {}, '&showExpired=true'))).toEqual([open, restricted, locked, expired].sort());
    expect(ids(await listed('manager-token', {}, '&showExpired=true'))).toEqual([open, restricted, locked, expired].sort());
    // Others: no password-protected, restricted or (even with showExpired) expired reviews
    expect(ids(await listed('other-token', {}, '&showExpired=true'))).toEqual([open]);
    const forClient = await listed('client-token');
    expect(ids(forClient)).toEqual([open, restricted].sort());
    expect(forClient.find((r) => r.id === restricted)!.approvedEmails).toEqual([]);
    expect((await listed('sarah-token')).find((r) => r.id === restricted)!.approvedEmails).toEqual(['client@example.com']);
    // An API key naming an approved reviewer is still nobody
    expect(ids(await listed(API_KEY, { 'x-user-email': 'client@example.com' }))).toEqual([open]);
  });

  it("doesn't let an API key act as a reviewer through x-user-email", async () => {
    const id = await createAs('sarah-token', { sharingMode: 'approved_emails', approvedEmails: ['client@example.com'] });
    const impersonating = { 'x-user-email': 'client@example.com', 'x-user-name': 'Carla Client' };
    expect((await get(id, API_KEY, impersonating)).status).toBe(403);
    expect((await call('GET', `/review/${id}/comments`, undefined, { ...as(API_KEY), ...impersonating })).status).toBe(403);
    expect((await call('POST', `/review/${id}/comments`, { text: 'x' }, { ...as(API_KEY), ...impersonating })).status).toBe(403);
    expect((await get(id, API_KEY, { 'x-user-email': 'sarah@example.com' })).status).toBe(403);
    // The signed-in client and a key with review:admin can
    expect((await get(id, 'client-token')).status).toBe(200);
    expect((await get(id, ADMIN_KEY)).status).toBe(200);

    // A review an API key creates has no owner; the header only labels it
    const created = await (
      await call('POST', '/review/create-from-url', { url: 'https://example.com/k.png' }, { ...as(API_KEY), ...impersonating })
    ).json();
    expect(created.review).toMatchObject({ designer: 'Carla Client', designerEmail: null });
    expect((await call('POST', `/review/${created.reviewId}/password`, { password: 'x' }, as('client-token'))).status).toBe(403);
  });

  it('enforces workflow roles and reports them as allowedActions', async () => {
    const id = await createAs('sarah-token');
    const actions = async (token: Parameters<typeof as>[0]) => (await (await get(id, token)).json()).allowedActions as string[];
    const step = (token: Parameters<typeof as>[0], route: string, body?: unknown) =>
      call('POST', `/review/${id}/workflow/${route}`, body, as(token));

    expect(await actions('sarah-token')).toEqual(
      expect.arrayContaining(['move-to-client-review', 'resubmit', 'manage-sharing', 'manage-password']),
    );
    expect(await actions('other-token')).toEqual([]);
    expect((await step('other-token', 'move-to-client-review')).status).toBe(403);
    expect((await step('client-token', 'move-to-client-review')).status).toBe(403);
    expect((await step('sarah-token', 'move-to-client-review')).status).toBe(200);

    // client_review: only the client role (or a review admin)
    expect(await actions('client-token')).toEqual(['approve', 'reject']);
    expect(await actions('sarah-token')).not.toContain('approve');
    expect(await actions('ad-token')).toEqual([]);
    for (const token of ['sarah-token', 'other-token', 'ad-token', API_KEY] as const) {
      expect((await step(token, 'approve', { stage: 'client_review' })).status).toBe(403);
    }
    expect((await step('client-token', 'approve', { stage: 'client_review' })).status).toBe(200);

    expect((await step('client-token', 'move-to-art-director-review')).status).toBe(403);
    expect((await step('sarah-token', 'move-to-art-director-review')).status).toBe(200);

    // art_director_review: the art director; the client can't
    expect(await actions('ad-token')).toEqual(['approve', 'reject']);
    expect((await step('client-token', 'reject', { stage: 'art_director_review' })).status).toBe(403);
    const afterAd = await step('ad-token', 'approve', { stage: 'art_director_review' });
    expect(afterAd.status).toBe(200);
    expect((await afterAd.json()).allowedActions).toEqual([]);

    // creative_director_review: nobody here has the role, so a review admin decides
    expect((await step('ad-token', 'approve', { stage: 'creative_director_review' })).status).toBe(403);
    expect(await actions('manager-token')).toEqual(expect.arrayContaining(['approve', 'reject', 'manage-sharing']));
    const done = await step('manager-token', 'approve', { stage: 'creative_director_review' });
    expect(await done.json()).toMatchObject({ workflowState: 'approved' });
  });

  it("gives the review's team access, and team roles count for their stage", async () => {
    const manager = as('manager-token');
    const team = await (await call('POST', '/teams', { name: 'Access team' }, manager)).json();
    await call('POST', `/teams/${team.id}/members`, { email: 'other@example.com', name: 'Olly', role: 'Designer' }, manager);
    await call('POST', `/teams/${team.id}/members`, { email: 'ad@example.com', name: 'AD', role: 'Client' }, manager);
    const id = await createAs('sarah-token', { teamId: team.id, sharingMode: 'approved_emails', approvedEmails: [], password: 'pw' });

    // A team member needs neither the approved list nor the password, and can drive the workflow
    expect((await get(id, 'other-token')).status).toBe(200);
    expect((await call('POST', `/review/${id}/workflow/move-to-client-review`, undefined, as('other-token'))).status).toBe(200);
    // ...but can't change sharing or the password
    expect((await call('POST', `/review/${id}/password`, { password: '' }, as('other-token'))).status).toBe(403);
    // Someone whose team role is Client approves the client stage
    expect((await call('POST', `/review/${id}/workflow/approve`, { stage: 'client_review' }, as('ad-token'))).status).toBe(200);
  });
});
