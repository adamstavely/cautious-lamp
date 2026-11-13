import { INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { existsSync, readdirSync } from 'fs';
import * as path from 'path';
import { KeyManagementService } from '../common/security/key-management.service';
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

const keys = {
  assertValidApiKey(header?: string) {
    if (header !== `Bearer ${API_KEY}`) throw new UnauthorizedException('Invalid or missing API key');
  },
  assertAdminKey(header?: string) {
    if (header !== `Bearer ${ADMIN_KEY}`) throw new UnauthorizedException('Admin API key required');
  },
};

/** End-to-end over HTTP, with in-memory storage in place of Elasticsearch */
describe('Reviews HTTP API', () => {
  let h: ReturnType<typeof createHarness>;
  let app: INestApplication;
  let base: string;

  const headers = (extra: Record<string, string> = {}) => ({
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'x-user-email': 'sarah@example.com',
    'x-user-name': 'Sarah Johnson',
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
        { provide: KeyManagementService, useValue: keys },
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

  it('requires an API key, and the admin key for admin routes', async () => {
    expect((await fetch(`${base}/api/v1/reviews`)).status).toBe(401);
    expect((await call('GET', '/reviews')).status).toBe(200);
    expect((await call('GET', '/admin/reviews')).status).toBe(401);
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
      headers: { Authorization: `Bearer ${API_KEY}` },
      body: form,
    });
    expect(res.status).toBe(201);
    expect(await res.json()).toMatchObject({ id: 'v2', label: 'Round 2', filename: 'round2.png', contentType: 'image/png' });

    const bad = new FormData();
    bad.append('label', 'Nope');
    bad.append('file', new Blob(['<html>'], { type: 'text/html' }), 'x.html');
    const rejected = await fetch(`${base}/api/v1/review/${reviewId}/versions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}` },
      body: bad,
    });
    expect(rejected.status).toBe(415);

    const noLabel = new FormData();
    noLabel.append('file', new Blob([SAMPLE_FILES.png], { type: 'image/png' }), 'x.png');
    const invalid = await fetch(`${base}/api/v1/review/${reviewId}/versions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}` },
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
      headers: { Authorization: `Bearer ${API_KEY}` },
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
    const denied = await call('GET', `/review/${reviewId}`);
    expect(denied.status).toBe(401);
    expect(await denied.json()).toMatchObject({ passwordRequired: true });
    expect((await call('GET', `/review/${reviewId}?password=hunter2`)).status).toBe(401);
    expect((await call('GET', `/review/${reviewId}`, undefined, { 'x-review-password': 'hunter2' })).status).toBe(200);
  });

  it('accepts URL-encoded non-ASCII passwords and names in headers', async () => {
    const password = 'pässwörd ✓ 100%';
    const created = await call('POST', '/review/create-from-url', { url: 'https://example.com/a.png', password });
    const { reviewId } = await created.json();
    const headers = {
      'x-review-password': encodeURIComponent(password),
      'x-user-email': 'jose@example.com',
      'x-user-name': encodeURIComponent('José Núñez'),
    };
    expect((await call('GET', `/review/${reviewId}`, undefined, headers)).status).toBe(200);
    expect((await call('GET', `/review/${reviewId}`, undefined, { 'x-review-password': 'pässwörd' })).status).toBe(401);
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
    expect((await call('POST', `/review/${reviewId}/workflow/approve`, { stage: 'client_review' })).status).toBe(409);
    expect((await call('POST', `/review/${reviewId}/workflow/approve`, { stage: 'nope' })).status).toBe(400);
    expect((await call('POST', `/review/${reviewId}/workflow/move-to-client-review`)).status).toBe(200);
    expect((await call('GET', `/review/${reviewId}`, undefined, { 'x-user-email': 'other@example.com' })).status).toBe(403);
    expect((await call('GET', `/review/${reviewId}`, undefined, { 'x-user-email': 'client@example.com' })).status).toBe(200);
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

    const team = await (await call('POST', '/teams', { name: 'Alpha' })).json();
    expect(team).toMatchObject({ name: 'Alpha', description: '', members: [] });
    const withMember = await (
      await call('POST', `/teams/${team.id}/members`, { email: 'Mike@Example.com', name: 'Mike', role: 'Designer' })
    ).json();
    expect(withMember.members).toEqual([{ email: 'mike@example.com', name: 'Mike', role: 'Designer' }]);
    expect((await call('POST', `/teams/${team.id}/members`, { email: 'mike@example.com', name: 'M', role: 'x' })).status).toBe(409);
    const promoted = await (await call('PATCH', `/teams/${team.id}/members/mike@example.com`, { role: 'Art Director' })).json();
    expect(promoted.members[0].role).toBe('Art Director');
    expect((await (await call('DELETE', `/teams/${team.id}/members/mike@example.com`)).json()).members).toEqual([]);
    expect((await call('DELETE', `/teams/${team.id}`)).status).toBe(204);
    expect((await call('GET', `/teams/${team.id}`)).status).toBe(404);
  });
});
