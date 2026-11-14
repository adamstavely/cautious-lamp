import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  Inject,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
  UnauthorizedException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { Readable } from 'stream';
import { DocumentStore, REVIEW_STORE, TEAM_STORE, VersionConflictError } from './document-store';
import {
  CreateCommentDto,
  CreateFromUrlDto,
  CreateUploadDto,
  SharingDto,
  UpdateCommentDto,
  VersionDto,
} from './review.dto';
import { ReviewFilesService, isSafeId, newId } from './review-files.service';
import { ReviewAccess, allowedActions, canDecide, isExpired, reviewAccess, sharingAllows } from './review-access';
import {
  ALLOWED_FILE_TYPES,
  ActingUser,
  Comment,
  DAY_MS,
  DEFAULT_EXPIRY_DAYS,
  MAX_FILE_BYTES,
  Reactions,
  Reply,
  Review,
  ReviewAction,
  ReviewDoc,
  ReviewSummary,
  ReviewVersion,
  StoredVersion,
  Team,
  WorkflowState,
  actorLabel,
} from './review.types';
import { WorkflowAction, applyWorkflowAction } from './workflow';

const BCRYPT_ROUNDS = 10;
const UPLOAD_TOKEN_TTL_MS = 60 * 60 * 1000;
const MAX_WRITE_ATTEMPTS = 5;

/** A multipart upload multer has staged on disk */
export interface StagedFile {
  path: string;
  mimetype: string;
  size: number;
  originalname: string;
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Public version fields only */
function toVersion(version: StoredVersion): ReviewVersion {
  const { storageId: _storageId, ...rest } = version;
  return rest;
}

export function toReview(doc: ReviewDoc, actions: ReviewAction[] = []): Review {
  const { passwordHash, uploadToken: _token, versions, ...rest } = doc;
  return {
    ...rest,
    hasPassword: !!passwordHash,
    versions: (versions ?? []).map(toVersion),
    comments: rest.comments ?? [],
    workflowHistory: rest.workflowHistory ?? [],
    allowedActions: actions,
  };
}

export function toSummary(doc: ReviewDoc, actions: ReviewAction[] = []): ReviewSummary {
  const { comments: _c, workflowHistory: history, ...summary } = toReview(doc, actions);
  // Uploads and extensions don't change the workflow, so look past them
  const last = [...(history ?? [])]
    .reverse()
    .find((entry) => !['version_uploaded', 'extended', 'reactivated'].includes(entry.action));
  return { ...summary, changesRequested: last?.action === 'rejected' };
}

@Injectable()
export class ReviewsService {
  constructor(
    @Inject(REVIEW_STORE) private readonly store: DocumentStore<ReviewDoc>,
    @Inject(TEAM_STORE) private readonly teams: DocumentStore<Team>,
    private readonly files: ReviewFilesService,
  ) {}

  // ---------------------------------------------------------------- reading

  /**
   * Reviews the caller could open: their own, their teams', and others' that
   * sharing lets them see and that have no password. Expired reviews (with
   * `showExpired`) only to those who could see them anyway (owner, team, admin).
   */
  async list(query: { workflowState?: WorkflowState; q?: string; showExpired?: boolean }, user: ActingUser) {
    const [docs, teams] = await Promise.all([
      this.store.list({
        excludes: ['comments'],
        ...(query.workflowState ? { where: { workflowState: query.workflowState } } : {}),
        ...(query.showExpired ? {} : { after: { expiresAt: new Date().toISOString() } }),
      }),
      this.teams.list(),
    ]);
    const teamsById = new Map(teams.map((team) => [team.id, team]));
    const q = query.q?.trim().toLowerCase();
    const reviews: ReviewSummary[] = [];
    for (const raw of docs) {
      const doc = normalize(raw);
      if (q && ![doc.filename, doc.designer, doc.designerEmail].some((field) => field?.toLowerCase().includes(q))) continue;
      const access = reviewAccess(doc, user, (doc.teamId && teamsById.get(doc.teamId)) || null);
      if (!access.privileged && (isExpired(doc) || !sharingAllows(doc, user) || doc.passwordHash)) continue;
      reviews.push(toSummary(this.redact(doc, access), allowedActions(doc, access, user)));
    }
    return { reviews, total: reviews.length };
  }

  async adminList(showExpired: boolean): Promise<ReviewSummary[]> {
    const docs = await this.store.list({ excludes: ['comments'] });
    return docs.filter((doc) => showExpired || !isExpired(doc)).map((doc) => toSummary(doc));
  }

  async getReview(id: string, user: ActingUser, password?: string): Promise<Review> {
    const doc = await this.load(id);
    const access = await this.accessFor(doc, user);
    await this.assertCanView(doc, user, access, password);
    return this.present(doc, access, user);
  }

  /** `{ url }`: a signed file URL (upload versions) or the external link (url reviews) */
  async getVersionUrl(id: string, versionId: string, user: ActingUser, password: string | undefined, baseUrl: string) {
    const doc = await this.load(id);
    await this.assertCanView(doc, user, await this.accessFor(doc, user), password);
    const version = doc.versions.find((v) => v.id === versionId);
    if (!version) throw new NotFoundException('Version not found');
    if (version.url) return { url: version.url };
    if (!version.storageId) throw new NotFoundException('Version has no file');
    return { url: `${baseUrl}${this.files.signedPath(doc.id, version.storageId)}` };
  }

  /** Resolves a signed file URL to the file on disk */
  async resolveSignedFile(fileId: string, expires: string, sig: string) {
    const parsed = ReviewFilesService.parseFileId(fileId);
    if (!parsed || !this.files.verify(fileId, expires, sig)) {
      throw new ForbiddenException('Invalid or expired file link');
    }
    const stored = await this.store.get(parsed.reviewId);
    const version = stored?.doc.versions.find((v) => v.storageId === parsed.storageId);
    if (!version) throw new NotFoundException('File not found');
    const filePath = this.files.filePath(parsed.reviewId, parsed.storageId);
    await this.files.assertExists(filePath);
    return { filePath, contentType: version.contentType ?? 'application/octet-stream', filename: version.filename };
  }

  async getComments(id: string, user: ActingUser, password: string | undefined, versionId?: string): Promise<Comment[]> {
    const doc = await this.load(id);
    await this.assertCanView(doc, user, await this.accessFor(doc, user), password);
    const comments = doc.comments ?? [];
    return versionId ? comments.filter((c) => c.version === versionId) : comments;
  }

  // --------------------------------------------------------------- creating

  async createUpload(dto: CreateUploadDto, user: ActingUser, baseUrl: string) {
    const token = randomBytes(32).toString('base64url');
    const doc = await this.newReview(dto, user, {
      filename: dto.filename,
      sourceType: 'upload',
      action: 'uploaded',
    });
    doc.uploadToken = { hash: sha256(token), expiresAt: new Date(Date.now() + UPLOAD_TOKEN_TTL_MS).toISOString() };
    await this.store.create(doc);
    return { reviewId: doc.id, uploadUrl: `${baseUrl}/api/v1/upload/${doc.id}/${token}` };
  }

  /** The one-time-token PUT: streams the body to disk and adds it as the first version */
  async receiveUpload(
    id: string,
    token: string,
    contentTypeHeader: string | undefined,
    contentLength: string | undefined,
    body: Readable,
  ): Promise<{ success: true; versionId: string }> {
    const contentType = (contentTypeHeader ?? '').split(';')[0].trim().toLowerCase();
    if (!ALLOWED_FILE_TYPES[contentType]) {
      throw new UnsupportedMediaTypeException('Only PDF, PNG, JPEG, GIF, WebP and SVG files are accepted');
    }
    if (contentLength && Number(contentLength) > MAX_FILE_BYTES) {
      throw new PayloadTooLargeException('Files can be up to 50MB');
    }
    if (!isSafeId(id)) throw new NotFoundException('Review not found');

    // Check the token before writing anything, then again atomically when consuming it
    const doc = await this.load(id);
    this.assertUploadToken(doc, token);

    const { storageId, size } = await this.files.writeStream(id, body, contentType);
    try {
      const { result } = await this.mutate(id, (current) => {
        this.assertUploadToken(current, token);
        current.uploadToken = null;
        const version = this.buildVersion(current, {
          label: 'Version 1',
          filename: current.filename,
          contentType,
          size,
          storageId,
          uploadedBy: current.designer,
        });
        current.versions.push(version);
        return version.id;
      });
      return { success: true, versionId: result };
    } catch (error) {
      await this.files.removeFile(id, storageId);
      throw error;
    }
  }

  async createFromUrl(dto: CreateFromUrlDto, user: ActingUser) {
    const url = parseHttpUrl(dto.url);
    const filename = dto.filename || filenameFromUrl(url);
    const doc = await this.newReview(dto, user, { filename, sourceType: 'url', action: 'created_from_url' });
    doc.url = url.toString();
    doc.versions.push(
      this.buildVersion(doc, {
        label: 'External Link',
        filename,
        contentType: null,
        size: null,
        url: doc.url,
        type: 'url',
        uploadedBy: doc.designer,
      }),
    );
    await this.store.create(doc);
    return { reviewId: doc.id, review: await this.presentFor(doc, user) };
  }

  async addVersion(id: string, file: StagedFile | undefined, dto: VersionDto, user: ActingUser): Promise<ReviewVersion> {
    if (!file) throw new BadRequestException('A file is required');
    let storageId: string | undefined;
    try {
      const doc = await this.load(id);
      this.assertActive(doc);
      this.assertContributor(await this.accessFor(doc, user));
      ({ storageId } = await this.files.adopt(id, file.path, file.mimetype));
      const { result } = await this.mutate(id, (current) => {
        this.assertActive(current);
        const version = this.buildVersion(current, {
          label: dto.label,
          notes: dto.notes,
          type: dto.type,
          filename: sanitizeFilename(file.originalname) || current.filename,
          contentType: file.mimetype,
          size: file.size,
          storageId,
          uploadedBy: actorLabel(user, current.designer),
        });
        current.versions.push(version);
        current.workflowHistory.push({
          stage: current.workflowState,
          action: 'version_uploaded',
          user: actorLabel(user, current.designer),
          versionLabel: dto.label,
          timestamp: version.uploadedAt,
        });
        return toVersion(version);
      });
      return result;
    } catch (error) {
      if (storageId) await this.files.removeFile(id, storageId);
      else await this.files.discardStaged(file.path);
      throw error;
    }
  }

  async discardStaged(file: StagedFile): Promise<void> {
    await this.files.discardStaged(file.path);
  }

  // ------------------------------------------------------------ management

  async complete(id: string, user: ActingUser): Promise<Review> {
    await this.authorize(id, user, (access) => this.assertContributor(access));
    const { doc } = await this.mutate(id, (current) => {
      this.assertActive(current);
      const now = new Date().toISOString();
      current.completed = true;
      current.expiresAt = now;
      current.workflowHistory.push({
        stage: current.workflowState,
        action: 'completed',
        user: actorLabel(user, 'Designer'),
        timestamp: now,
      });
    });
    return this.presentFor(doc, user);
  }

  /** Owner or review admin only */
  async updateSharing(id: string, dto: SharingDto, user: ActingUser): Promise<Review> {
    await this.authorize(id, user, (access) => this.assertManager(access));
    const { doc } = await this.mutate(id, (current) => {
      this.assertActive(current);
      current.sharingMode = dto.sharingMode;
      current.approvedEmails = dto.approvedEmails ?? [];
    });
    return this.presentFor(doc, user);
  }

  /**
   * Sets or (with an empty string) clears the password: owner or review admin
   * only. `admin` (the admin route) skips the expiry and owner checks.
   */
  async setPassword(id: string, password: string, user: ActingUser, admin = false): Promise<{ hasPassword: boolean }> {
    if (Buffer.byteLength(password ?? '', 'utf8') > 72) {
      throw new BadRequestException('Password must be at most 72 bytes');
    }
    if (!admin) await this.authorize(id, user, (access) => this.assertManager(access));
    const hash = password ? await bcrypt.hash(password, BCRYPT_ROUNDS) : null;
    const { doc } = await this.mutate(id, (current) => {
      if (!admin) this.assertActive(current);
      current.passwordHash = hash;
      current.workflowHistory.push({
        stage: current.workflowState,
        action: hash ? 'password_set' : 'password_removed',
        user: admin ? 'Admin' : actorLabel(user),
        timestamp: new Date().toISOString(),
      });
    });
    return { hasPassword: !!doc.passwordHash };
  }

  async extend(id: string, days: number, user: ActingUser, admin = false): Promise<Review> {
    if (!admin) await this.authorize(id, user, (access) => this.assertContributor(access));
    const { doc } = await this.mutate(id, (current) => {
      if (!admin) this.assertActive(current);
      const from = Math.max(Date.now(), new Date(current.expiresAt).getTime());
      current.expiresAt = new Date(from + days * DAY_MS).toISOString();
      current.extended = true;
      current.workflowHistory.push({
        stage: current.workflowState,
        action: 'extended',
        user: admin ? 'Admin' : actorLabel(user),
        timestamp: new Date().toISOString(),
        days,
      });
    });
    return admin ? toReview(doc) : this.presentFor(doc, user);
  }

  async reactivate(id: string): Promise<Review> {
    const { doc } = await this.mutate(id, (current) => {
      const now = Date.now();
      current.completed = false;
      current.expiresAt = new Date(now + DEFAULT_EXPIRY_DAYS * DAY_MS).toISOString();
      current.workflowHistory.push({
        stage: current.workflowState,
        action: 'reactivated',
        user: 'Admin',
        timestamp: new Date(now).toISOString(),
      });
    });
    return toReview(doc);
  }

  async delete(id: string): Promise<void> {
    if (!isSafeId(id) || !(await this.store.delete(id))) throw new NotFoundException('Review not found');
    await this.files.removeReviewFiles(id);
  }

  async batchDelete(ids: string[]): Promise<{ deleted: number }> {
    let deleted = 0;
    for (const id of new Set(ids)) {
      if (!isSafeId(id)) continue;
      if (await this.store.delete(id)) {
        deleted++;
        await this.files.removeReviewFiles(id);
      }
    }
    return { deleted };
  }

  // -------------------------------------------------------------- workflow

  /**
   * Approve and reject need the current stage's role (see review-access.ts);
   * moves and resubmits need a contributor. `stage` must still be the current
   * state when the change is written, so a role checked against it stays valid.
   */
  async workflow(id: string, action: WorkflowAction, user: ActingUser, password?: string): Promise<Review> {
    await this.authorize(id, user, (access, doc) => {
      if (action.type === 'approve' || action.type === 'reject') {
        if (!canDecide(access, user, action.stage, action.type)) {
          throw new ForbiddenException(`You can't ${action.type} a review at ${action.stage}`);
        }
      } else {
        this.assertContributor(access);
      }
    }, password);
    const { doc } = await this.mutate(id, (current) => {
      this.assertActive(current);
      applyWorkflowAction(current, action, actorLabel(user, 'Current User'));
    });
    return this.presentFor(doc, user);
  }

  // -------------------------------------------------------------- comments

  async addComment(id: string, dto: CreateCommentDto, user: ActingUser, password?: string): Promise<Comment> {
    await this.authorize(id, user, () => undefined, password);
    const { result } = await this.mutate(id, (current) => {
      this.assertActive(current);
      const comment: Comment = {
        id: newId('cmt'),
        text: dto.text,
        author: actorLabel(user),
        authorEmail: user.email,
        version: dto.version ?? current.versions[current.versions.length - 1]?.id ?? null,
        type: dto.type ?? 'general',
        resolved: dto.resolved ?? false,
        ...(dto.annotationId !== undefined ? { annotationId: dto.annotationId } : {}),
        ...(dto.annotationData !== undefined ? { annotationData: dto.annotationData } : {}),
        replies: [],
        reactions: {},
        timestamp: new Date().toISOString(),
      };
      current.comments.push(comment);
      return comment;
    });
    return result;
  }

  /** The comment's author, the owner, team members or a review admin */
  async updateComment(id: string, commentId: string, dto: UpdateCommentDto, user: ActingUser, password?: string): Promise<Comment> {
    const access = await this.authorize(id, user, () => undefined, password);
    const { result } = await this.mutate(id, (current) => {
      this.assertActive(current);
      const comment = findComment(current, commentId);
      assertCommentEditor(comment, user, access);
      if (dto.text !== undefined) comment.text = dto.text;
      if (dto.resolved !== undefined) comment.resolved = dto.resolved;
      if (dto.annotationData !== undefined) comment.annotationData = dto.annotationData;
      return comment;
    });
    return result;
  }

  async deleteComment(id: string, commentId: string, user: ActingUser, password?: string): Promise<void> {
    const access = await this.authorize(id, user, () => undefined, password);
    await this.mutate(id, (current) => {
      this.assertActive(current);
      assertCommentEditor(findComment(current, commentId), user, access);
      current.comments = current.comments.filter((c) => c.id !== commentId);
    });
  }

  async addReply(id: string, commentId: string, text: string, user: ActingUser, password?: string): Promise<Reply> {
    await this.authorize(id, user, () => undefined, password);
    const { result } = await this.mutate(id, (current) => {
      this.assertActive(current);
      const comment = findComment(current, commentId);
      const reply: Reply = {
        id: newId('rpl'),
        text,
        author: actorLabel(user),
        authorEmail: user.email,
        timestamp: new Date().toISOString(),
        reactions: {},
      };
      comment.replies = comment.replies ?? [];
      comment.replies.push(reply);
      return reply;
    });
    return result;
  }

  /** Toggles the acting user's emoji on a comment, or on one of its replies */
  async toggleReaction(
    id: string,
    commentId: string,
    emoji: string,
    user: ActingUser,
    replyId?: string,
    password?: string,
  ): Promise<Comment> {
    const reactor = user.email ?? user.name;
    if (!reactor) throw new BadRequestException('Sign in, or send x-user-name with an API key, to react');
    await this.authorize(id, user, () => undefined, password);
    const { result } = await this.mutate(id, (current) => {
      this.assertActive(current);
      const comment = findComment(current, commentId);
      let target: { reactions: Reactions } = comment;
      if (replyId !== undefined) {
        const reply = (comment.replies ?? []).find((r) => r.id === replyId);
        if (!reply) throw new NotFoundException('Reply not found');
        target = reply;
      }
      target.reactions = toggle(target.reactions ?? {}, emoji, reactor);
      return comment;
    });
    return result;
  }

  // --------------------------------------------------------------- helpers

  /**
   * Read-modify-write with optimistic concurrency: re-reads and re-applies
   * `fn` when someone else wrote the review in between, so nothing is lost.
   */
  async mutate<R>(id: string, fn: (doc: ReviewDoc) => R): Promise<{ doc: ReviewDoc; result: R }> {
    if (!isSafeId(id)) throw new NotFoundException('Review not found');
    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
      const stored = await this.store.get(id);
      if (!stored) throw new NotFoundException('Review not found');
      const doc = normalize(stored.doc);
      const result = fn(doc);
      doc.updatedAt = new Date().toISOString();
      try {
        await this.store.replace(doc, stored.version);
        return { doc, result };
      } catch (error) {
        if (error instanceof VersionConflictError) continue;
        throw error;
      }
    }
    throw new ConflictException('The review was changed by someone else at the same time, please try again');
  }

  private async load(id: string): Promise<ReviewDoc> {
    if (!isSafeId(id)) throw new NotFoundException('Review not found');
    const stored = await this.store.get(id);
    if (!stored) throw new NotFoundException('Review not found');
    return normalize(stored.doc);
  }

  /** 410 once a review has expired or been completed; `reason` tells the two apart */
  private assertActive(doc: ReviewDoc): void {
    if (!isExpired(doc)) return;
    throw new GoneException(
      doc.completed
        ? { statusCode: 410, message: 'This review has been completed', reason: 'completed' }
        : { statusCode: 410, message: 'This review link has expired', reason: 'expired' },
    );
  }

  /** The caller's access to `doc` (review-access.ts), loading its team if it has one */
  private async accessFor(doc: ReviewDoc, user: ActingUser): Promise<ReviewAccess> {
    const team = doc.teamId && isSafeId(doc.teamId) ? (await this.teams.get(doc.teamId))?.doc ?? null : null;
    return reviewAccess(doc, user, team);
  }

  /**
   * Before a change: the caller must be able to view the review (with its
   * password, unless privileged), then pass `check`. Returns the access.
   */
  private async authorize(
    id: string,
    user: ActingUser,
    check: (access: ReviewAccess, doc: ReviewDoc) => void,
    password?: string,
  ): Promise<ReviewAccess> {
    const doc = await this.load(id);
    const access = await this.accessFor(doc, user);
    await this.assertCanView(doc, user, access, password);
    check(access, doc);
    return access;
  }

  private assertManager(access: ReviewAccess): void {
    if (!access.canManage) throw new ForbiddenException('Only the designer or a review admin can change this');
  }

  private assertContributor(access: ReviewAccess): void {
    if (!access.canContribute) throw new ForbiddenException("Only the designer's team or a review admin can do this");
  }

  /** The review as this caller may see it: approved emails only for those who manage sharing */
  private redact(doc: ReviewDoc, access: ReviewAccess): ReviewDoc {
    return access.canManage ? doc : { ...doc, approvedEmails: [] };
  }

  private present(doc: ReviewDoc, access: ReviewAccess, user: ActingUser): Review {
    return toReview(this.redact(doc, access), allowedActions(doc, access, user));
  }

  private async presentFor(doc: ReviewDoc, user: ActingUser): Promise<Review> {
    return this.present(doc, await this.accessFor(doc, user), user);
  }

  /**
   * Expiry, then sharing, then password (so a restricted review can't be used
   * to test passwords). The owner, team members and review admins skip sharing and password.
   */
  private async assertCanView(doc: ReviewDoc, user: ActingUser, access: ReviewAccess, password?: string): Promise<void> {
    this.assertActive(doc);
    if (access.privileged) return;
    if (!sharingAllows(doc, user)) throw new ForbiddenException('You do not have access to this review');
    if (doc.passwordHash) {
      const ok = !!password && (await bcrypt.compare(password, doc.passwordHash));
      if (!ok) {
        throw new UnauthorizedException({ statusCode: 401, message: 'Password required', passwordRequired: true });
      }
    }
  }

  private assertUploadToken(doc: ReviewDoc, token: string): void {
    const pending = doc.uploadToken;
    const valid =
      !!pending &&
      typeof token === 'string' &&
      new Date(pending.expiresAt).getTime() > Date.now() &&
      timingSafeEqual(Buffer.from(pending.hash), Buffer.from(sha256(token)));
    if (!valid) throw new ForbiddenException('Invalid or already used upload link');
    this.assertActive(doc);
  }

  private async newReview(
    dto: CreateUploadDto | CreateFromUrlDto,
    user: ActingUser,
    init: { filename: string; sourceType: 'upload' | 'url'; action: string },
  ): Promise<ReviewDoc> {
    const teamId = dto.teamId || null;
    if (teamId && (!isSafeId(teamId) || !(await this.teams.get(teamId)))) {
      throw new BadRequestException('Team not found');
    }
    const password = dto.password || '';
    if (Buffer.byteLength(password, 'utf8') > 72) throw new BadRequestException('Password must be at most 72 bytes');
    const now = new Date();
    const timestamp = now.toISOString();
    const designer = actorLabel(user, 'Designer');
    const bypass = dto.bypassClientReview ?? false;
    const doc: ReviewDoc = {
      id: newId('rev'),
      filename: init.filename,
      sourceType: init.sourceType,
      passwordHash: password ? await bcrypt.hash(password, BCRYPT_ROUNDS) : null,
      designer,
      designerEmail: user.email,
      teamId,
      completed: false,
      workflowState: bypass ? 'art_director_review' : 'draft',
      workflowHistory: [{ stage: 'draft', action: init.action, user: designer, timestamp }],
      bypassClientReview: bypass,
      sharingMode: dto.sharingMode ?? 'anyone',
      approvedEmails: dto.approvedEmails ?? [],
      versions: [],
      comments: [],
      createdAt: timestamp,
      updatedAt: timestamp,
      expiresAt: new Date(now.getTime() + DEFAULT_EXPIRY_DAYS * DAY_MS).toISOString(),
      extended: false,
      uploadToken: null,
    };
    if (bypass) {
      doc.workflowHistory.push({
        stage: 'art_director_review',
        action: 'bypassed_client_review',
        user: designer,
        timestamp,
      });
    }
    return doc;
  }

  private buildVersion(
    doc: ReviewDoc,
    fields: Partial<StoredVersion> & Pick<StoredVersion, 'label' | 'filename' | 'contentType' | 'size' | 'uploadedBy'>,
  ): StoredVersion {
    return {
      id: `v${doc.versions.length + 1}`,
      notes: '',
      type: 'file',
      uploadedAt: new Date().toISOString(),
      ...stripUndefined(fields),
    } as StoredVersion;
  }
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

/** Fills in arrays older or partial documents may lack */
function normalize(doc: ReviewDoc): ReviewDoc {
  doc.versions = doc.versions ?? [];
  doc.comments = doc.comments ?? [];
  doc.workflowHistory = doc.workflowHistory ?? [];
  doc.approvedEmails = doc.approvedEmails ?? [];
  return doc;
}

function assertCommentEditor(comment: Comment, user: ActingUser, access: ReviewAccess): void {
  const author = !!user.email && user.email === comment.authorEmail?.toLowerCase();
  if (!author && !access.privileged) throw new ForbiddenException('Only the author or the review team can change this comment');
}

function findComment(doc: ReviewDoc, commentId: string): Comment {
  const comment = doc.comments.find((c) => c.id === commentId);
  if (!comment) throw new NotFoundException('Comment not found');
  return comment;
}

function toggle(reactions: Reactions, emoji: string, reactor: string): Reactions {
  const users = reactions[emoji] ?? [];
  const next = users.includes(reactor) ? users.filter((u) => u !== reactor) : [...users, reactor];
  const result = { ...reactions };
  if (next.length) result[emoji] = next;
  else delete result[emoji];
  return result;
}

/** http(s) only; the server never fetches it */
export function parseHttpUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new BadRequestException('url must be a valid http(s) URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new BadRequestException('url must be a valid http(s) URL');
  }
  if (url.username || url.password) throw new BadRequestException('url must not contain credentials');
  return url;
}

function filenameFromUrl(url: URL): string {
  const last = url.pathname.split('/').filter(Boolean).pop();
  let name = last;
  try {
    name = last ? decodeURIComponent(last) : undefined;
  } catch {
    // keep the raw segment
  }
  return sanitizeFilename(name ?? '') || url.hostname || 'External Design Link';
}

function sanitizeFilename(name: string): string {
  return (name ?? '').replace(/[\x00-\x1f\x7f/\\]/g, '').trim().slice(0, 255);
}
