import { BadRequestException, ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { EncryptionService } from '../common/security/encryption.service';
import { DeliveryService } from '../delivery/delivery.service';
import { ChannelAvailability, DeliveryAttempt, DeliveryMessage, DeliveryOwner, DeliveryTarget } from '../delivery/delivery.types';
import { VersionConflictError } from '../reviews/document-store';
import { QueryableStore } from '../workspaces/queryable-store';
import { isSafeId } from '../workspaces/workspace-access.service';
import {
  NotificationChannelView,
  NotificationEntry,
  NotificationType,
  ProjectDoc,
  TestRunDoc,
  VR_PROJECT_STORE,
} from './visual-regression.types';

export const PROJECT_NOTIFICATION_TYPES: readonly NotificationType[] = ['email', 'slack', 'teams', 'webhook'];
export const MAX_RECIPIENTS = 20;
const MAX_WRITE_ATTEMPTS = 5;

/** What the project's notification settings page shows */
export interface ProjectNotificationOverview {
  channels: NotificationChannelView[];
  /** What the server can deliver to (email needs SMTP) */
  availability: Record<NotificationType, ChannelAvailability>;
  /** The project's deliveries from the last 30 days, newest first */
  attempts: DeliveryAttempt[];
}

export interface ProjectNotificationInput {
  type: NotificationType;
  enabled?: boolean;
  recipients?: string[];
  url?: string;
  secret?: string;
}

function toView(type: NotificationType, entry: NotificationEntry | undefined): NotificationChannelView {
  if (!entry) return { type, enabled: false, configured: false };
  const configured = type === 'email' ? !!entry.recipients?.length : !!entry.url;
  return {
    type,
    enabled: entry.enabled && configured,
    configured,
    ...(type === 'email' ? { recipients: entry.recipients ?? [] } : {}),
    ...(type === 'webhook' ? { hasSecret: !!entry.secret } : {}),
    ...(entry.savedAt ? { savedAt: entry.savedAt } : {}),
  };
}

function owner(projectId: string): DeliveryOwner {
  return { kind: 'vr-project', id: projectId };
}

/** The message for a finished run: a failed build, changed screenshots, or a pass */
export function buildMessage(project: Pick<ProjectDoc, 'id' | 'name'>, run: TestRunDoc): DeliveryMessage {
  const summary = run.resultsSummary;
  const failedBuild = run.status === 'failed';
  const changed = summary?.failed ?? 0;
  const outcome = failedBuild ? 'failed' : changed ? `found ${changed} changed screenshot${changed === 1 ? '' : 's'}` : 'passed';
  const where = [run.branch ? `Branch ${run.branch}` : '', run.commitSha ? `commit ${run.commitSha.slice(0, 7)}` : ''].filter(Boolean).join(', ');
  const counts = summary
    ? `${summary.total} screenshots: ${summary.passed} unchanged, ${summary.failed} changed, ${summary.new} new, ${summary.removed} removed.`
    : failedBuild
      ? 'Argos reported an error for this build.'
      : '';
  return {
    event: failedBuild ? 'visual-regression.build.failed' : 'visual-regression.build.completed',
    title: `Visual regression: ${project.name} ${outcome}`,
    text: [where ? `${where}.` : '', counts].filter(Boolean).join(' ') || `Run ${run.id} finished.`,
    link: `/tools/visual-regression/${project.id}/runs/${run.id}`,
    data: {
      projectId: project.id,
      runId: run.id,
      argosBuildId: run.argosBuildId,
      argosBuildNumber: run.argosBuildNumber,
      argosStatus: run.argosStatus,
      argosUrl: run.argosUrl,
      status: run.status,
      branch: run.branch,
      commitSha: run.commitSha,
      summary: summary ?? null,
    },
  };
}

/**
 * A visual regression project's notifications: where build results go
 * (email recipients, Slack, Teams, a signed webhook), sending them when a
 * run finishes, and test sends. URLs and secrets are encrypted at rest and
 * never returned; every delivery is recorded by DeliveryService.
 */
@Injectable()
export class VisualRegressionNotifier {
  private readonly logger = new Logger(VisualRegressionNotifier.name);

  constructor(
    @Inject(VR_PROJECT_STORE) private readonly projects: QueryableStore<ProjectDoc>,
    private readonly delivery: DeliveryService,
    private readonly encryption: EncryptionService,
  ) {}

  async overview(projectId: string): Promise<ProjectNotificationOverview> {
    const project = await this.requireProject(projectId);
    return {
      channels: PROJECT_NOTIFICATION_TYPES.map((type) => toView(type, this.entryOf(project, type))),
      availability: this.delivery.availability(),
      attempts: await this.delivery.recent(owner(projectId)),
    };
  }

  /**
   * Saves one channel. A URL or recipients left out keep their saved value,
   * so `{ type, enabled }` just turns a channel on or off. A webhook without
   * a secret gets a generated one, returned once here.
   */
  async configure(projectId: string, input: ProjectNotificationInput): Promise<NotificationChannelView & { secret?: string }> {
    if (!PROJECT_NOTIFICATION_TYPES.includes(input.type)) throw new BadRequestException('type must be one of email, slack, teams, webhook');
    const url = input.url !== undefined ? await this.delivery.checkUrl(input.url) : undefined;
    const recipients = input.recipients !== undefined ? [...new Set(input.recipients.map((r) => r.trim().toLowerCase()))] : undefined;
    if (recipients && recipients.length > MAX_RECIPIENTS) throw new BadRequestException(`At most ${MAX_RECIPIENTS} recipients`);
    let generated: string | undefined;

    const doc = await this.mutate(projectId, (project) => {
      const current = this.entryOf(project, input.type);
      const entry: NotificationEntry = {
        type: input.type,
        enabled: input.enabled ?? current?.enabled ?? true,
        savedAt: new Date().toISOString(),
      };
      if (input.type === 'email') {
        entry.recipients = recipients ?? current?.recipients ?? [];
        if (!entry.recipients.length) throw new BadRequestException('Add at least one recipient');
      } else {
        entry.url = url !== undefined ? this.encryption.encrypt(url) : current?.url;
        if (!entry.url) throw new BadRequestException('Add the URL to send to');
      }
      if (input.type === 'webhook') {
        if (input.secret) entry.secret = this.encryption.encrypt(input.secret);
        else if (current?.secret && url === undefined) entry.secret = current.secret;
        else {
          // A new URL gets a new secret, so the old receiver's secret can't sign for the new one
          generated = `whsec_${randomBytes(32).toString('hex')}`;
          entry.secret = this.encryption.encrypt(generated);
        }
      }
      project.notifications = [...(project.notifications ?? []).filter((n) => n.type !== input.type), entry];
    });
    const view = toView(input.type, this.entryOf(doc, input.type));
    return generated ? { ...view, secret: generated } : view;
  }

  async remove(projectId: string, type: NotificationType): Promise<void> {
    await this.mutate(projectId, (project) => {
      project.notifications = (project.notifications ?? []).filter((n) => n.type !== type);
    });
  }

  /** Sends a test message to one channel now, enabled or not, and returns the recorded attempt */
  async sendTest(projectId: string, type: NotificationType): Promise<DeliveryAttempt> {
    const project = await this.requireProject(projectId);
    const entry = this.entryOf(project, type);
    const target = entry ? this.targetOf(entry) : null;
    if (!target) throw new BadRequestException(type === 'email' ? 'Add recipients first' : 'Save a URL first');
    return this.delivery.send(
      owner(projectId),
      target,
      {
        event: 'test',
        title: `Test notification for ${project.name}`,
        text: 'This is a test from visual regression. Build results for this project will arrive here.',
        link: `/tools/visual-regression/${project.id}`,
      },
      { test: true },
    );
  }

  /**
   * Called once when a run reaches completed or failed. Reads the project's
   * current settings and starts a delivery per enabled channel the server can
   * send to; never throws, outcomes are recorded.
   */
  async runFinished(projectId: string, run: TestRunDoc): Promise<void> {
    try {
      const project = await this.findProject(projectId);
      if (!project) return;
      const available = this.delivery.availability();
      const message = buildMessage(project, run);
      for (const entry of project.notifications ?? []) {
        if (!entry.enabled || !available[entry.type]?.available) continue;
        const target = this.targetOf(entry);
        if (target) this.delivery.sendInBackground(owner(projectId), target, message);
      }
    } catch (error) {
      this.logger.warn(`Build notifications for project ${projectId} not sent: ${(error as Error)?.message}`);
    }
  }

  private entryOf(project: ProjectDoc, type: NotificationType): NotificationEntry | undefined {
    return (project.notifications ?? []).find((n) => n.type === type);
  }

  private targetOf(entry: NotificationEntry): DeliveryTarget | null {
    if (entry.type === 'email') return entry.recipients?.length ? { channel: 'email', to: entry.recipients } : null;
    if (!entry.url) return null;
    const url = this.encryption.decrypt(entry.url);
    if (entry.type === 'webhook') return { channel: 'webhook', url, secret: entry.secret ? this.encryption.decrypt(entry.secret) : '' };
    return { channel: entry.type, url };
  }

  private async findProject(id: string): Promise<ProjectDoc | null> {
    if (!isSafeId(id)) return null;
    return (await this.projects.get(id))?.doc ?? null;
  }

  private async requireProject(id: string): Promise<ProjectDoc> {
    const project = await this.findProject(id);
    if (!project) throw new NotFoundException(`Project with ID ${id} not found`);
    return project;
  }

  private async mutate(id: string, fn: (doc: ProjectDoc) => void): Promise<ProjectDoc> {
    if (!isSafeId(id)) throw new NotFoundException(`Project with ID ${id} not found`);
    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
      const stored = await this.projects.get(id);
      if (!stored) throw new NotFoundException(`Project with ID ${id} not found`);
      const doc = stored.doc;
      fn(doc);
      doc.updatedAt = new Date().toISOString();
      try {
        await this.projects.replace(doc, stored.version);
        return doc;
      } catch (error) {
        if (!(error instanceof VersionConflictError)) throw error;
      }
    }
    throw new ConflictException('Project is being changed, please try again');
  }
}
