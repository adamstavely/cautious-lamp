import axios, { AxiosError, AxiosInstance } from 'axios';

/**
 * Argos REST API v2 (https://argos-ci.com/docs/api-reference; the schema is
 * published in @argos-ci/api-client). Projects are addressed as
 * `{owner}/{project}` (account slug and project name). Requests carry a
 * project token or a personal access token as a bearer token: either can read
 * a project, its builds and their diffs, but reviews need a personal access token.
 */
export const ARGOS_API_URL = 'https://api.argos-ci.com/v2';

export interface ArgosProject {
  id: string;
  name: string;
  account: { id: string; slug: string };
  defaultBaseBranch: string;
}

/** Build statuses: review states, conclusions and progress states */
export type ArgosBuildStatus =
  | 'accepted'
  | 'rejected'
  | 'no-changes'
  | 'changes-detected'
  | 'expired'
  | 'pending'
  | 'progress'
  | 'error'
  | 'aborted';

export interface ArgosBuild {
  id: string;
  number: number;
  head: { sha: string; branch: string };
  base: { sha: string; branch: string } | null;
  status: ArgosBuildStatus;
  conclusion: 'no-changes' | 'changes-detected' | null;
  stats: {
    added: number;
    removed: number;
    unchanged: number;
    changed: number;
    ignored: number;
    failure: number;
    retryFailure: number;
    total: number;
  } | null;
  metadata: {
    testReport?: {
      status: 'passed' | 'failed' | 'timedout' | 'interrupted';
      stats?: { startTime?: string; duration?: number };
    };
  } | null;
  url: string;
}

interface ArgosSnapshot {
  id: string;
  name: string;
  url: string;
  width: number | null;
  height: number | null;
}

/** One screenshot of a build compared with its baseline */
export interface ArgosSnapshotDiff {
  id: string;
  name: string;
  status: 'pending' | 'removed' | 'failure' | 'added' | 'changed' | 'unchanged' | 'retryFailure' | 'ignored';
  score: number | null;
  /** The diff image */
  url: string | null;
  base: ArgosSnapshot | null;
  head: ArgosSnapshot | null;
}

interface Page<T> {
  pageInfo: { total: number; page: number; perPage: number };
  results: T[];
}

/** Why the token or project can't be used */
export type ArgosVerificationFailure = 'unauthorized' | 'project_not_found' | 'invalid_project_id' | 'unreachable' | 'error';

export type ArgosVerificationFailed = { ok: false; reason: ArgosVerificationFailure; status?: number; message: string };

export type ArgosVerification = { ok: true; project: ArgosProject } | ArgosVerificationFailed;

/** A failed Argos call, with the HTTP status when Argos answered */
export class ArgosApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'ArgosApiError';
  }
}

/** Splits `owner/project`; null when it isn't in that form */
export function parseArgosProjectId(argosProjectId: string): { owner: string; project: string } | null {
  const match = /^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/.exec((argosProjectId ?? '').trim());
  return match ? { owner: match[1], project: match[2] } : null;
}

/** Most diffs fetched for one build (100 per page, Argos's maximum) */
const MAX_DIFF_PAGES = 20;

export class ArgosApiClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.token = token;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      timeout: 30000,
    });
  }

  /**
   * Checks the token against the project itself: 401/403 mean Argos refused
   * the token, 404 that the project doesn't exist (or the token can't see it).
   */
  async verify(argosProjectId: string): Promise<ArgosVerification> {
    if (!parseArgosProjectId(argosProjectId)) {
      return { ok: false, reason: 'invalid_project_id', message: 'The Argos project must be written as owner/project, for example acme/web.' };
    }
    try {
      return { ok: true, project: await this.getProject(argosProjectId) };
    } catch (error) {
      const status = error instanceof ArgosApiError ? error.status : undefined;
      if (status === 401 || status === 403) {
        return { ok: false, reason: 'unauthorized', status, message: 'Argos refused the token. Check that it is a valid project token or personal access token.' };
      }
      if (status === 404) {
        return { ok: false, reason: 'project_not_found', status, message: `Argos has no project ${argosProjectId} that this token can see.` };
      }
      if (status === undefined) {
        return { ok: false, reason: 'unreachable', message: `Argos could not be reached at ${this.baseUrl}.` };
      }
      return { ok: false, reason: 'error', status, message: `Argos answered with HTTP ${status}.` };
    }
  }

  /** Whether the token can read the project */
  async verifyConnection(argosProjectId: string): Promise<boolean> {
    return (await this.verify(argosProjectId)).ok;
  }

  async getProject(argosProjectId: string): Promise<ArgosProject> {
    return this.request('get', this.projectPath(argosProjectId));
  }

  /** The project's builds, most recent first */
  async listBuilds(argosProjectId: string, options: { page?: number; perPage?: number } = {}): Promise<Page<ArgosBuild>> {
    return this.request('get', `${this.projectPath(argosProjectId)}/builds`, {
      params: { page: String(options.page ?? 1), perPage: String(options.perPage ?? 30) },
    });
  }

  async getBuild(argosProjectId: string, buildNumber: number): Promise<ArgosBuild> {
    return this.request('get', `${this.projectPath(argosProjectId)}/builds/${encodeURIComponent(String(buildNumber))}`);
  }

  /** Every screenshot diff of a build */
  async listBuildDiffs(argosProjectId: string, buildNumber: number): Promise<ArgosSnapshotDiff[]> {
    const path = `${this.projectPath(argosProjectId)}/builds/${encodeURIComponent(String(buildNumber))}/diffs`;
    const all: ArgosSnapshotDiff[] = [];
    for (let page = 1; page <= MAX_DIFF_PAGES; page++) {
      const body = await this.request<Page<ArgosSnapshotDiff>>('get', path, { params: { page: String(page), perPage: '100' } });
      all.push(...body.results);
      if (body.results.length === 0 || all.length >= body.pageInfo.total) break;
    }
    return all;
  }

  /**
   * Records a review of some of a build's screenshots (by diff id). Argos
   * needs a personal access token for reviews; a project token gets 401/403.
   */
  async reviewSnapshots(
    argosProjectId: string,
    buildNumber: number,
    snapshots: Array<{ id: string; conclusion: 'APPROVE' | 'REQUEST_CHANGES' }>,
    comment: string,
  ): Promise<void> {
    await this.request('post', `${this.projectPath(argosProjectId)}/builds/${encodeURIComponent(String(buildNumber))}/reviews`, {
      data: { event: 'COMMENT', body: comment, snapshots },
    });
  }

  /** Absolute image URL (Argos returns absolute URLs; relative ones are resolved against the API) */
  getImageUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${this.baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
  }

  private projectPath(argosProjectId: string): string {
    const parsed = parseArgosProjectId(argosProjectId);
    if (!parsed) throw new ArgosApiError(`Invalid Argos project "${argosProjectId}": expected owner/project`);
    return `/projects/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.project)}`;
  }

  private async request<T>(method: 'get' | 'post', url: string, options: { params?: Record<string, string>; data?: unknown } = {}): Promise<T> {
    try {
      const response = await this.client.request<T>({ method, url, params: options.params, data: options.data });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      const status = axiosError.response?.status;
      const detail = axiosError.response?.data?.error || axiosError.message;
      throw new ArgosApiError(status ? `Argos answered ${status}: ${detail}` : `Argos could not be reached: ${detail}`, status);
    }
  }
}
