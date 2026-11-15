import axios, { AxiosInstance } from 'axios';
import { openReplayPublicApiRoot } from './openreplay-url';

/** A project as OpenReplay's public API returns it */
export interface OpenReplayProject {
  projectId: number;
  projectKey: string;
  name: string;
  platform?: string;
}

/** A session as `POST /:projectKey/users/:userId/sessions` lists it */
export interface OpenReplaySession {
  sessionId: string;
  startTs: number;
  endTs?: number;
  eventsCount?: number;
}

/** An event as `POST /:projectKey/sessions/:sessionId/events` lists it */
export interface OpenReplayEvent {
  event_id: string;
  $event_name?: string;
  created_at: number;
  distinct_id?: string;
  session_id?: string;
  properties?: Record<string, unknown>;
  $properties?: Record<string, unknown>;
  $auto_captured?: boolean;
}

/** One page of a list, with OpenReplay's total */
export interface OpenReplayPage<T> {
  total: number;
  items: T[];
}

/** The time window and page every list endpoint takes */
export interface OpenReplayWindow {
  /** Epoch ms */
  startTimestamp: number;
  /** Epoch ms, after startTimestamp */
  endTimestamp: number;
  /** From 1 */
  page: number;
  /** 1-200 */
  limit: number;
  sortOrder?: 'asc' | 'desc';
}

/** OpenReplay answered with an error (`status`), or could not be reached (no status) */
export class OpenReplayError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
  }
}

function describe(error: any, what: string): OpenReplayError {
  const status: number | undefined = error?.response?.status;
  if (status === 401 || status === 403) return new OpenReplayError('OpenReplay rejected the API key', status);
  if (status) return new OpenReplayError(`OpenReplay could not ${what} (HTTP ${status})`, status);
  return new OpenReplayError(`OpenReplay could not be reached: ${error?.message ?? 'no answer'}`);
}

/** The public API wraps results in `data`; older instances answer bare */
function unwrap<T>(body: any): T {
  return body && typeof body === 'object' && 'data' in body ? body.data : body;
}

/**
 * OpenReplay's public REST API (docs.openreplay.com/en/api), authenticated
 * with the organization API key. Projects are addressed by their project key;
 * the numeric project id only appears in dashboard links (openreplay-url.ts).
 */
export class OpenReplayApiClient {
  private readonly client: AxiosInstance;

  constructor(baseUrl: string, apiKey: string) {
    this.client = axios.create({
      baseURL: openReplayPublicApiRoot(baseUrl),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
      // The base URL is checked against SSRF (openreplay-url.ts); a redirect must not lead elsewhere
      maxRedirects: 0,
    });
  }

  /** Throws an OpenReplayError when OpenReplay can't be reached or refuses the key */
  async checkConnection(): Promise<void> {
    try {
      await this.client.get('/projects');
    } catch (error) {
      throw describe(error, 'list projects');
    }
  }

  /** True when OpenReplay answers and accepts the key */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.checkConnection();
      return true;
    } catch {
      return false;
    }
  }

  /** The project with this key, or null when OpenReplay has none */
  async getProject(projectKey: string): Promise<OpenReplayProject | null> {
    try {
      const response = await this.client.get(`/projects/${encodeURIComponent(projectKey)}`);
      return unwrap<OpenReplayProject>(response.data) ?? null;
    } catch (error: any) {
      if (error?.response?.status === 404) return null;
      throw describe(error, 'fetch the project');
    }
  }

  /** One user's sessions in a time window (the only session listing the public API has) */
  async listUserSessions(projectKey: string, userId: string, window: OpenReplayWindow): Promise<OpenReplayPage<OpenReplaySession>> {
    try {
      const response = await this.client.post(
        `/${encodeURIComponent(projectKey)}/users/${encodeURIComponent(userId)}/sessions`,
        window,
      );
      const data = unwrap<{ total?: number; sessions?: OpenReplaySession[] }>(response.data) ?? {};
      const sessions = Array.isArray(data.sessions) ? data.sessions : [];
      return { total: typeof data.total === 'number' ? data.total : sessions.length, items: sessions };
    } catch (error) {
      throw describe(error, 'list sessions');
    }
  }

  /** The events recorded in one session */
  async listSessionEvents(projectKey: string, sessionId: string, window: OpenReplayWindow): Promise<OpenReplayPage<OpenReplayEvent>> {
    try {
      const response = await this.client.post(
        `/${encodeURIComponent(projectKey)}/sessions/${encodeURIComponent(sessionId)}/events`,
        window,
      );
      const data = unwrap<{ total?: number; events?: OpenReplayEvent[] }>(response.data) ?? {};
      const events = Array.isArray(data.events) ? data.events : [];
      return { total: typeof data.total === 'number' ? data.total : events.length, items: events };
    } catch (error) {
      throw describe(error, 'list session events');
    }
  }
}
