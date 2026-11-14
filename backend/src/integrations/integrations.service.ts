import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import { chromium } from 'playwright';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { PhotosensitivityService } from '../photosensitivity/photosensitivity.service';
import { SessionReplayService } from '../session-replay/session-replay.service';
import { VisualRegressionService } from '../visual-regression/visual-regression.service';
import { IntegrationStatus, ProjectIntegrationSummary } from './integration.types';

export interface IntegrationsReport {
  checkedAt: string;
  /** Whether Argos and OpenReplay were contacted (`?check=true`); otherwise only setup is reported */
  connectionsChecked: boolean;
  integrations: {
    elasticsearch: IntegrationStatus;
    iris: IntegrationStatus;
    chromium: IntegrationStatus;
    argos: IntegrationStatus;
    openreplay: IntegrationStatus;
    altText: IntegrationStatus;
  };
}

/**
 * What the backend's external tools and services are set up to do
 * (docs/INTEGRATIONS.md). Argos and OpenReplay are only contacted when asked.
 */
@Injectable()
export class IntegrationsService {
  constructor(
    private readonly esIndex: EsIndexService,
    private readonly photosensitivity: PhotosensitivityService,
    private readonly visualRegression: VisualRegressionService,
    private readonly sessionReplay: SessionReplayService,
  ) {}

  async report(check: boolean): Promise<IntegrationsReport> {
    const [elasticsearch, iris, chromium, argos, openreplay] = await Promise.all([
      this.elasticsearch(),
      this.iris(),
      this.chromium(),
      this.argos(check),
      this.openreplay(check),
    ]);
    return {
      checkedAt: new Date().toISOString(),
      connectionsChecked: check,
      integrations: { elasticsearch, iris, chromium, argos, openreplay, altText: this.altText() },
    };
  }

  private async elasticsearch(): Promise<IntegrationStatus> {
    try {
      await this.esIndex.assertAvailable();
      return { state: 'ok', summary: 'Elasticsearch is answering' };
    } catch {
      return {
        state: 'unreachable',
        summary: "Elasticsearch isn't answering, so most data can't be read or saved",
        action: 'Start Elasticsearch (docker compose up elasticsearch) and check ELASTICSEARCH_NODE',
      };
    }
  }

  private async iris(): Promise<IntegrationStatus> {
    const { executable, config, problem } = await this.photosensitivity.status();
    if (problem) {
      return {
        state: 'not_configured',
        summary: "IRIS isn't installed, so videos can't be analysed for photosensitivity",
        action: problem,
      };
    }
    return { state: 'ok', summary: 'IRIS is installed', details: { executable, config } };
  }

  private async chromium(): Promise<IntegrationStatus> {
    let executable: string | null = null;
    try {
      executable = chromium.executablePath();
      await fs.access(executable);
      return { state: 'ok', summary: 'Chromium is installed', details: { executable } };
    } catch {
      return {
        state: 'not_configured',
        summary: "Chromium isn't installed, so URL accessibility scans and design extraction can't run",
        action: 'Run `npx playwright install chromium` in backend/, or use the backend Docker image',
        details: executable ? { expectedAt: executable } : undefined,
      };
    }
  }

  private async argos(check: boolean): Promise<IntegrationStatus> {
    const [summary, webhookReady] = await Promise.all([
      this.visualRegression.integrationSummary(check),
      this.visualRegression.webhookReadyCount(),
    ]);
    return projectStatus('Argos', 'visual regression', summary, { webhookReady }, {
      none: 'Create a visual regression project with an Argos project id and token',
      unreachable: 'Check those projects\' Argos URL and token in their settings',
    });
  }

  private async openreplay(check: boolean): Promise<IntegrationStatus> {
    return projectStatus('OpenReplay', 'session replay', await this.sessionReplay.integrationSummary(check), {}, {
      none: "Add an OpenReplay API key in a session replay project's settings",
      unreachable: 'Check those projects\' OpenReplay URL and API key in their settings',
    });
  }

  private altText(): IntegrationStatus {
    if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) {
      return { state: 'ok', summary: 'Alt text generation has a Claude API key' };
    }
    return {
      state: 'not_configured',
      summary: "Alt text generation has no Claude API key",
      action: 'Set ANTHROPIC_API_KEY on the backend',
    };
  }
}

function projectStatus(
  service: string,
  feature: string,
  summary: ProjectIntegrationSummary,
  extra: Record<string, unknown>,
  actions: { none: string; unreachable: string },
): IntegrationStatus {
  const details = { ...summary, ...extra };
  if (summary.withCredentials === 0) {
    return {
      state: 'not_configured',
      summary:
        summary.projects === 0
          ? `No ${feature} projects yet`
          : `None of the ${summary.projects} ${feature} project(s) has ${service} credentials`,
      action: actions.none,
      details,
    };
  }
  const connected = `${summary.withCredentials} of ${summary.projects} ${feature} project(s) connected to ${service}`;
  if (summary.unreachable?.length) {
    return {
      state: 'unreachable',
      summary: `${connected}; ${summary.unreachable.length} didn't answer`,
      action: actions.unreachable,
      details,
    };
  }
  return { state: 'ok', summary: connected, details };
}
