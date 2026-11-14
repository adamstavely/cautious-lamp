import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  NotFoundException,
  PayloadTooLargeException,
  UnauthorizedException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { existsSync, readdirSync } from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import { VersionConflictError } from './document-store';
import {
  anonymous,
  artDirector,
  client,
  createHarness,
  creativeDirector,
  designer,
  reviewAdmin,
  reviewer,
  SAMPLE_FILES,
} from './testing/harness';

type Harness = ReturnType<typeof createHarness>;

function tokenFrom(uploadUrl: string): string {
  return uploadUrl.split('/').pop() as string;
}

async function createUploaded(h: Harness, extra: Record<string, unknown> = {}) {
  const { reviewId, uploadUrl } = await h.service.createUpload({ filename: 'Homepage.pdf', ...extra }, designer, 'http://api');
  await h.service.receiveUpload(reviewId, tokenFrom(uploadUrl), 'application/pdf', undefined, Readable.from([SAMPLE_FILES.pdf]));
  return reviewId;
}

async function createUrlReview(h: Harness, extra: Record<string, unknown> = {}) {
  const { reviewId } = await h.service.createFromUrl({ url: 'https://example.com/designs/home.png', ...extra }, designer);
  return reviewId;
}

function expireReview(h: Harness, id: string) {
  const entry = h.store.docs.get(id)!;
  h.store.forceWrite({ ...entry.doc, expiresAt: new Date(Date.now() - 1000).toISOString() });
}

describe('ReviewsService', () => {
  let h: Harness;

  beforeEach(() => {
    h = createHarness();
  });

  afterEach(() => h.cleanup());

  describe('creating', () => {
    it('creates a url review with a 30 day expiry and http(s) only', async () => {
      const { review } = await h.service.createFromUrl({ url: 'https://example.com/a/Design%20v2.png' }, designer);
      expect(review).toMatchObject({
        filename: 'Design v2.png',
        sourceType: 'url',
        url: 'https://example.com/a/Design%20v2.png',
        designer: 'Sarah Johnson',
        designerEmail: 'sarah@example.com',
        workflowState: 'draft',
        sharingMode: 'anyone',
        hasPassword: false,
        extended: false,
        completed: false,
      });
      expect(review.versions).toEqual([
        expect.objectContaining({ id: 'v1', label: 'External Link', url: review.url, type: 'url' }),
      ]);
      const days = (new Date(review.expiresAt).getTime() - new Date(review.createdAt).getTime()) / 86400000;
      expect(days).toBe(30);

      for (const url of ['javascript:alert(1)', 'file:///etc/passwd', 'ftp://x.com/a', 'not a url']) {
        await expect(h.service.createFromUrl({ url }, designer)).rejects.toBeInstanceOf(BadRequestException);
      }
    });

    it('starts bypass reviews in art director review', async () => {
      const id = await createUrlReview(h, { bypassClientReview: true });
      const review = await h.service.getReview(id, designer);
      expect(review.workflowState).toBe('art_director_review');
      expect(review.workflowHistory.map((e) => e.action)).toEqual(['created_from_url', 'bypassed_client_review']);
    });

    it('rejects an unknown team', async () => {
      await expect(createUrlReview(h, { teamId: 'team_missing' })).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('passwords', () => {
    it('stores a bcrypt hash and never returns it', async () => {
      const id = await createUrlReview(h, { password: 'hunter2' });
      const stored = h.store.docs.get(id)!.doc;
      expect(stored.passwordHash).toMatch(/^\$2[aby]\$10\$/);
      expect(stored.passwordHash).not.toContain('hunter2');

      const review = await h.service.getReview(id, designer, 'hunter2');
      expect(review.hasPassword).toBe(true);
      const json = JSON.stringify(review);
      expect(json).not.toContain('passwordHash');
      expect(json).not.toContain('hunter2');
      expect(json).not.toContain(stored.passwordHash!);

      const listed = JSON.stringify(await h.service.list({}, designer));
      expect(listed).not.toContain('passwordHash');
      expect(JSON.stringify(await h.service.adminList(true))).not.toContain('passwordHash');
    });

    it('returns 401 with passwordRequired without the right password', async () => {
      const id = await createUrlReview(h, { password: 'hunter2' });
      for (const attempt of [undefined, 'wrong']) {
        const error = await h.service.getReview(id, reviewer, attempt).catch((e) => e);
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.getResponse()).toMatchObject({ passwordRequired: true });
      }
      await expect(h.service.getComments(id, reviewer, 'wrong')).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(h.service.getVersionUrl(id, 'v1', reviewer, undefined, '')).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(h.service.addComment(id, { text: 'x' }, reviewer, 'wrong')).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(h.service.getReview(id, reviewer, 'hunter2')).resolves.toMatchObject({ id });
      // The designer (and their team, and review admins) don't need it
      await expect(h.service.getReview(id, designer)).resolves.toMatchObject({ id });
      await expect(h.service.getReview(id, reviewAdmin)).resolves.toMatchObject({ id });
    });

    it('sets, changes and clears a password, returning only hasPassword', async () => {
      const id = await createUrlReview(h);
      expect(await h.service.setPassword(id, 'first', designer)).toEqual({ hasPassword: true });
      await expect(h.service.getReview(id, reviewer)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(await h.service.setPassword(id, 'second', designer, true)).toEqual({ hasPassword: true });
      await expect(h.service.getReview(id, reviewer, 'first')).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(h.service.getReview(id, reviewer, 'second')).resolves.toMatchObject({ hasPassword: true });
      expect(await h.service.setPassword(id, '', designer)).toEqual({ hasPassword: false });
      await expect(h.service.getReview(id, reviewer)).resolves.toMatchObject({ hasPassword: false });
      const actions = (await h.service.getReview(id, designer)).workflowHistory.map((e) => e.action);
      expect(actions).toEqual(['created_from_url', 'password_set', 'password_set', 'password_removed']);
    });

    it('rejects passwords bcrypt would truncate', async () => {
      const id = await createUrlReview(h);
      await expect(h.service.setPassword(id, 'é'.repeat(40), designer)).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('workflow', () => {
    it('runs the whole happy path and records the acting user', async () => {
      const id = await createUrlReview(h);
      await h.service.workflow(id, { type: 'move-to-client-review' }, designer);
      await h.service.workflow(id, { type: 'approve', stage: 'client_review' }, client);
      await h.service.workflow(id, { type: 'move-to-art-director-review' }, designer);
      const afterAd = await h.service.workflow(id, { type: 'approve', stage: 'art_director_review' }, artDirector);
      expect(afterAd.workflowState).toBe('creative_director_review');
      const done = await h.service.workflow(id, { type: 'approve', stage: 'creative_director_review' }, creativeDirector);
      expect(done.workflowState).toBe('approved');
      expect(done.workflowHistory.map((e) => [e.stage, e.action, e.user])).toEqual([
        ['draft', 'created_from_url', 'Sarah Johnson'],
        ['client_review', 'moved_to_review', 'Sarah Johnson'],
        ['client_approved', 'approved', 'Client'],
        ['art_director_review', 'moved_to_review', 'Sarah Johnson'],
        ['art_director_approved', 'approved', 'AD'],
        ['creative_director_review', 'moved_to_review', 'System'],
        ['approved', 'approved', 'CD'],
      ]);
    });

    it('returns 409 for invalid transitions and leaves the review unchanged', async () => {
      const id = await createUrlReview(h);
      const invalid = [
        { type: 'approve', stage: 'draft' },
        { type: 'approve', stage: 'client_review' },
        { type: 'reject', stage: 'draft' },
        { type: 'move-to-art-director-review' },
      ] as const;
      for (const action of invalid) {
        await expect(h.service.workflow(id, action as any, reviewAdmin)).rejects.toBeInstanceOf(ConflictException);
      }
      expect((await h.service.getReview(id, designer)).workflowHistory).toHaveLength(1);
    });

    it('rejects back to draft with a reason, then resubmits', async () => {
      const id = await createUrlReview(h);
      await h.service.workflow(id, { type: 'move-to-client-review' }, designer);
      const rejected = await h.service.workflow(id, { type: 'reject', stage: 'client_review', reason: 'Too blue' }, client);
      expect(rejected.workflowState).toBe('draft');
      expect(rejected.workflowHistory.at(-1)).toMatchObject({ stage: 'draft', action: 'rejected', user: 'Client', reason: 'Too blue' });
      const resubmitted = await h.service.workflow(id, { type: 'resubmit', targetStage: 'client_review' }, designer);
      expect(resubmitted.workflowState).toBe('client_review');
      await expect(
        h.service.workflow(id, { type: 'resubmit', targetStage: 'client_review' }, designer),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('comments', () => {
    it('adds comments, replies and toggles reactions per user', async () => {
      const id = await createUrlReview(h);
      const comment = await h.service.addComment(
        id,
        { text: 'Logo too small', version: 'v1', type: 'annotation', annotationId: 'a1', annotationData: { x: 1, y: 2 } },
        reviewer,
      );
      expect(comment).toMatchObject({
        text: 'Logo too small',
        author: 'Client',
        authorEmail: 'client@example.com',
        version: 'v1',
        type: 'annotation',
        resolved: false,
        annotationId: 'a1',
        annotationData: { x: 1, y: 2 },
        replies: [],
        reactions: {},
      });

      const reply = await h.service.addReply(id, comment.id, 'Will fix', designer);
      expect(reply).toMatchObject({ text: 'Will fix', author: 'Sarah Johnson', authorEmail: 'sarah@example.com', reactions: {} });

      let updated = await h.service.toggleReaction(id, comment.id, '👍', reviewer);
      updated = await h.service.toggleReaction(id, comment.id, '👍', designer);
      expect(updated.reactions).toEqual({ '👍': ['client@example.com', 'sarah@example.com'] });
      updated = await h.service.toggleReaction(id, comment.id, '👍', reviewer);
      expect(updated.reactions).toEqual({ '👍': ['sarah@example.com'] });
      updated = await h.service.toggleReaction(id, comment.id, '👍', designer);
      expect(updated.reactions).toEqual({});

      updated = await h.service.toggleReaction(id, comment.id, '🎉', reviewer, reply.id);
      expect(updated.replies[0].reactions).toEqual({ '🎉': ['client@example.com'] });
      await expect(h.service.toggleReaction(id, comment.id, '🎉', reviewer, 'rpl_nope')).rejects.toBeInstanceOf(NotFoundException);
      await expect(h.service.toggleReaction(id, comment.id, '🎉', anonymous)).rejects.toBeInstanceOf(BadRequestException);

      const patched = await h.service.updateComment(id, comment.id, { resolved: true }, designer);
      expect(patched.resolved).toBe(true);

      const all = await h.service.getComments(id, designer, undefined);
      expect(all).toHaveLength(1);
      expect(await h.service.getComments(id, designer, undefined, 'v2')).toEqual([]);

      await h.service.deleteComment(id, comment.id, designer);
      expect(await h.service.getComments(id, designer, undefined)).toEqual([]);
      await expect(h.service.deleteComment(id, comment.id, designer)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('defaults the version to the latest one', async () => {
      const id = await createUrlReview(h);
      const comment = await h.service.addComment(id, { text: 'Hi' }, reviewer);
      expect(comment).toMatchObject({ version: 'v1', type: 'general' });
    });
  });

  describe('concurrency', () => {
    it('retries on a version conflict so concurrent comments are not lost', async () => {
      const id = await createUrlReview(h);
      let interfered = false;
      h.store.beforeReplace = (doc) => {
        if (interfered) return;
        interfered = true;
        // Another writer adds a comment between our read and our write
        const current = h.store.docs.get(doc.id)!.doc;
        h.store.forceWrite({
          ...current,
          comments: [...current.comments, { id: 'cmt_other', text: 'Other', replies: [], reactions: {} } as any],
        });
      };
      const replace = jest.spyOn(h.store, 'replace');

      await h.service.addComment(id, { text: 'Mine', version: 'v1' }, reviewer);

      expect(replace).toHaveBeenCalledTimes(2);
      const texts = (await h.service.getComments(id, designer, undefined)).map((c) => c.text);
      expect(texts).toEqual(['Other', 'Mine']);
    });

    it('gives up with 409 after repeated conflicts', async () => {
      const id = await createUrlReview(h);
      jest.spyOn(h.store, 'replace').mockRejectedValue(new VersionConflictError(id));
      await expect(h.service.addComment(id, { text: 'x' }, reviewer)).rejects.toBeInstanceOf(ConflictException);
    });

    it('keeps both of two parallel comments', async () => {
      const id = await createUrlReview(h);
      await Promise.all([
        h.service.addComment(id, { text: 'A' }, reviewer),
        h.service.addComment(id, { text: 'B' }, designer),
      ]);
      expect((await h.service.getComments(id, designer, undefined)).map((c) => c.text).sort()).toEqual(['A', 'B']);
    });
  });

  describe('uploads', () => {
    it('accepts the file once and rejects the token after', async () => {
      const { reviewId, uploadUrl } = await h.service.createUpload({ filename: 'Home.pdf' }, designer, 'http://api');
      expect(uploadUrl).toMatch(new RegExp(`^http://api/api/v1/upload/${reviewId}/[A-Za-z0-9_-]{43}$`));
      const token = tokenFrom(uploadUrl);
      expect(JSON.stringify(h.store.docs.get(reviewId)!.doc)).not.toContain(token);

      const result = await h.service.receiveUpload(reviewId, token, 'application/pdf', '100', Readable.from([SAMPLE_FILES.pdf]));
      expect(result).toEqual({ success: true, versionId: 'v1' });
      const review = await h.service.getReview(reviewId, designer);
      expect(review.versions).toEqual([
        expect.objectContaining({ id: 'v1', label: 'Version 1', contentType: 'application/pdf', size: SAMPLE_FILES.pdf.length }),
      ]);
      expect(JSON.stringify(review)).not.toContain('storageId');
      expect(JSON.stringify(review)).not.toContain('uploadToken');

      await expect(
        h.service.receiveUpload(reviewId, token, 'application/pdf', undefined, Readable.from([SAMPLE_FILES.pdf])),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(readdirSync(path.join(h.dir, reviewId))).toHaveLength(1);
    });

    it('rejects a wrong token, bad type, oversize and mismatched content without keeping files', async () => {
      const { reviewId, uploadUrl } = await h.service.createUpload({ filename: 'Home.pdf' }, designer, '');
      const token = tokenFrom(uploadUrl);
      await expect(
        h.service.receiveUpload(reviewId, 'x'.repeat(43), 'application/pdf', undefined, Readable.from([SAMPLE_FILES.pdf])),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        h.service.receiveUpload(reviewId, token, 'text/html', undefined, Readable.from(['<html>'])),
      ).rejects.toBeInstanceOf(UnsupportedMediaTypeException);
      await expect(
        h.service.receiveUpload(reviewId, token, 'application/pdf', String(51 * 1024 * 1024), Readable.from([SAMPLE_FILES.pdf])),
      ).rejects.toBeInstanceOf(PayloadTooLargeException);
      await expect(
        h.service.receiveUpload(reviewId, token, 'image/png', undefined, Readable.from([SAMPLE_FILES.pdf])),
      ).rejects.toBeInstanceOf(BadRequestException);
      // A body larger than 50MB without a Content-Length is cut off while streaming
      const big = Readable.from(
        (function* () {
          for (let i = 0; i < 51; i++) yield Buffer.alloc(1024 * 1024, i === 0 ? 0x25 : 0);
        })(),
      );
      await expect(h.service.receiveUpload(reviewId, token, 'application/pdf', undefined, big)).rejects.toBeInstanceOf(
        PayloadTooLargeException,
      );
      const dir = path.join(h.dir, reviewId);
      expect(existsSync(dir) ? readdirSync(dir) : []).toEqual([]);
      // The token is still usable after the failures
      await expect(
        h.service.receiveUpload(reviewId, token, 'application/pdf', undefined, Readable.from([SAMPLE_FILES.pdf])),
      ).resolves.toEqual({ success: true, versionId: 'v1' });
    });

    it('adds versions from staged multipart files', async () => {
      const id = await createUploaded(h);
      const staged = path.join(h.files.incomingDir, 'upload_abc');
      require('fs').mkdirSync(h.files.incomingDir, { recursive: true });
      require('fs').writeFileSync(staged, SAMPLE_FILES.png);
      const version = await h.service.addVersion(
        id,
        { path: staged, mimetype: 'image/png', size: SAMPLE_FILES.png.length, originalname: '../../evil.png' },
        { label: 'Round 2', notes: 'Bigger logo', type: 'revision' },
        designer,
      );
      expect(version).toMatchObject({ id: 'v2', label: 'Round 2', notes: 'Bigger logo', type: 'revision', filename: '....evil.png' });
      expect(existsSync(staged)).toBe(false);
      const stored = h.store.docs.get(id)!.doc.versions[1].storageId!;
      expect(stored).toMatch(/^f_[0-9a-f]{24}$/);
      expect(existsSync(path.join(h.dir, id, stored))).toBe(true);
      const review = await h.service.getReview(id, designer);
      expect(review.workflowHistory.at(-1)).toMatchObject({ action: 'version_uploaded', versionLabel: 'Round 2' });
    });
  });

  describe('signed file URLs', () => {
    it('signs version URLs that resolve to the stored file', async () => {
      const id = await createUploaded(h);
      const { url } = await h.service.getVersionUrl(id, 'v1', designer, undefined, 'http://api');
      const parsed = new URL(url);
      expect(parsed.origin + parsed.pathname).toMatch(new RegExp(`^http://api/api/v1/review-files/${id}\\.f_[0-9a-f]{24}$`));
      const fileId = parsed.pathname.split('/').pop()!;
      const file = await h.service.resolveSignedFile(fileId, parsed.searchParams.get('expires')!, parsed.searchParams.get('sig')!);
      expect(file).toMatchObject({ contentType: 'application/pdf', filename: 'Homepage.pdf' });

      await expect(h.service.resolveSignedFile(fileId, parsed.searchParams.get('expires')!, 'bad')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('returns the external link for url reviews', async () => {
      const id = await createUrlReview(h);
      expect(await h.service.getVersionUrl(id, 'v1', designer, undefined, '')).toEqual({
        url: 'https://example.com/designs/home.png',
      });
    });
  });

  describe('sharing', () => {
    it('returns 403 to users not on the approved list', async () => {
      const id = await createUrlReview(h, { sharingMode: 'approved_emails', approvedEmails: ['client@example.com'] });
      await expect(h.service.getReview(id, { email: 'stranger@example.com', name: 'X' })).rejects.toBeInstanceOf(ForbiddenException);
      await expect(h.service.getReview(id, anonymous)).rejects.toBeInstanceOf(ForbiddenException);
      await expect(h.service.getComments(id, anonymous, undefined)).rejects.toBeInstanceOf(ForbiddenException);
      await expect(h.service.getReview(id, reviewer)).resolves.toMatchObject({ id });
      await expect(h.service.getReview(id, { email: 'CLIENT@example.com', name: null })).resolves.toMatchObject({ id });
      await expect(h.service.getReview(id, designer)).resolves.toMatchObject({ id });

      await h.service.updateSharing(id, { sharingMode: 'anyone', approvedEmails: [] }, designer);
      await expect(h.service.getReview(id, anonymous)).resolves.toMatchObject({ sharingMode: 'anyone' });
    });

    it('checks sharing before the password', async () => {
      const id = await createUrlReview(h, { sharingMode: 'approved_emails', approvedEmails: [], password: 'pw' });
      await expect(h.service.getReview(id, anonymous, 'pw')).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('expiry', () => {
    it('returns 410 on non-admin routes and hides expired reviews from lists', async () => {
      const id = await createUrlReview(h);
      const live = await createUrlReview(h);
      expireReview(h, id);

      await expect(h.service.getReview(id, designer)).rejects.toBeInstanceOf(GoneException);
      await expect(h.service.getComments(id, designer, undefined)).rejects.toBeInstanceOf(GoneException);
      await expect(h.service.addComment(id, { text: 'x' }, designer)).rejects.toBeInstanceOf(GoneException);
      await expect(h.service.workflow(id, { type: 'move-to-client-review' }, designer)).rejects.toBeInstanceOf(GoneException);
      await expect(h.service.extend(id, 7, designer)).rejects.toBeInstanceOf(GoneException);

      expect((await h.service.list({}, designer)).reviews.map((r) => r.id)).toEqual([live]);
      expect((await h.service.list({ showExpired: true }, designer)).total).toBe(2);
      expect((await h.service.adminList(false)).map((r) => r.id)).toEqual([live]);

      // Admin routes still work and can bring it back
      const extended = await h.service.extend(id, 3, designer, true);
      expect(extended.extended).toBe(true);
      expireReview(h, id);
      const reactivated = await h.service.reactivate(id);
      expect(new Date(reactivated.expiresAt).getTime()).toBeGreaterThan(Date.now() + 29 * 86400000);
      await expect(h.service.getReview(id, designer)).resolves.toMatchObject({ id });
    });

    it('completing a review expires it', async () => {
      const id = await createUrlReview(h);
      const completed = await h.service.complete(id, designer);
      expect(completed.completed).toBe(true);
      expect(completed.workflowHistory.at(-1)).toMatchObject({ action: 'completed', user: 'Sarah Johnson' });
      await expect(h.service.getReview(id, designer)).rejects.toBeInstanceOf(GoneException);
    });

    it('extends from the current expiry', async () => {
      const id = await createUrlReview(h);
      const before = new Date(h.store.docs.get(id)!.doc.expiresAt).getTime();
      const review = await h.service.extend(id, 10, designer);
      expect(new Date(review.expiresAt).getTime() - before).toBe(10 * 86400000);
      expect(review.workflowHistory.at(-1)).toMatchObject({ action: 'extended', days: 10 });
    });
  });

  describe('listing', () => {
    it('filters by state and query and omits comments and history', async () => {
      const a = await createUrlReview(h, { filename: 'Checkout flow' });
      await createUrlReview(h, { filename: 'Landing page' });
      await h.service.workflow(a, { type: 'move-to-client-review' }, designer);
      const byState = await h.service.list({ workflowState: 'client_review' }, designer);
      expect(byState.reviews.map((r) => r.id)).toEqual([a]);
      expect(byState.reviews[0]).not.toHaveProperty('comments');
      expect(byState.reviews[0]).not.toHaveProperty('workflowHistory');
      expect((await h.service.list({ q: 'landing' }, designer)).total).toBe(1);
      expect((await h.service.list({ q: 'sarah' }, designer)).total).toBe(2);
    });
  });

  describe('admin deletes', () => {
    it('batch delete removes reviews and their files', async () => {
      const a = await createUploaded(h);
      const b = await createUploaded(h);
      const keep = await createUploaded(h);
      expect(existsSync(path.join(h.dir, a))).toBe(true);

      expect(await h.service.batchDelete([a, b, 'rev_missing', '../etc'])).toEqual({ deleted: 2 });
      expect(existsSync(path.join(h.dir, a))).toBe(false);
      expect(existsSync(path.join(h.dir, b))).toBe(false);
      expect(existsSync(path.join(h.dir, keep))).toBe(true);
      expect([...h.store.docs.keys()]).toEqual([keep]);
    });

    it('single delete removes files and 404s when missing', async () => {
      const id = await createUploaded(h);
      await h.service.delete(id);
      expect(existsSync(path.join(h.dir, id))).toBe(false);
      await expect(h.service.delete(id)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  it('treats ids that could be paths as not found', async () => {
    await expect(h.service.getReview('../../etc/passwd', designer)).rejects.toBeInstanceOf(NotFoundException);
    await expect(h.service.delete('..')).rejects.toBeInstanceOf(NotFoundException);
  });
});
