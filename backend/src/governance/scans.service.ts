import { BadRequestException, Inject, Injectable, NotFoundException, OnModuleDestroy, PayloadTooLargeException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AuthPrincipal } from '../auth/principal';
import { DocumentStore } from '../reviews/document-store';
import { SCAN_STORE } from './governance-stores';
import { GovernanceRule, LIMITS, RuleDefinition, ScanActor, ScanInput, ScanRecord, ScanScope } from './governance.types';
import { RegexRunner } from './regex-safety';
import { runRules } from './rule-interpreter';
import { normalizeRuleDefinition } from './rule-validation';
import { RulesService } from './rules.service';
import { fetchPublicPage } from './safe-fetch';
import { APPLICATION_DIRECTORY, ApplicationDirectory, DESIGN_SYSTEM_SOURCE, DesignSystemSource } from './sources';

export interface CodebaseInput {
  html?: string;
  css?: string;
  javascript?: string;
  file?: string;
}

export interface ScanRequest {
  scope: ScanScope;
  applicationId?: string;
  codebase?: CodebaseInput;
  url?: string;
  ruleIds?: string[];
  categories?: string[];
}

/** A stored scan plus the flat counts older clients (CLI, MCP server) read */
export type ScanResponse = ScanRecord & { passed: number; warnings: number; failed: number; info: number };

const blocks = (source: string, tag: 'style' | 'script'): string => {
  const re = tag === 'style' ? /<style\b[^>]*>([\s\S]*?)<\/style>/gi : /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  return Array.from(source.matchAll(re), (m) => m[1]).join('\n');
};

/** Splits a Vue SFC (or plain markup) into the three scan targets */
export function componentToInput(component: { name: string; code?: { vue?: string; react?: string; html?: string } }): ScanInput {
  const vue = component.code?.vue ?? '';
  const template = /<template\b[^>]*>([\s\S]*)<\/template>/i.exec(vue)?.[1] ?? '';
  return {
    component: component.name,
    html: component.code?.html || template,
    css: blocks(vue, 'style'),
    javascript: [blocks(vue, 'script'), component.code?.react ?? ''].filter(Boolean).join('\n'),
  };
}

function actor(principal: AuthPrincipal): ScanActor {
  return principal.type === 'user'
    ? { type: 'user', id: principal.id, name: principal.name || principal.email }
    : { type: 'service', id: principal.id, name: principal.name };
}

/** Runs scans, stores every result, and serves scan history */
@Injectable()
export class ScansService implements OnModuleDestroy {
  readonly runner = new RegexRunner();

  constructor(
    private readonly rules: RulesService,
    @Inject(SCAN_STORE) private readonly store: DocumentStore<ScanRecord>,
    @Inject(APPLICATION_DIRECTORY) private readonly applications: ApplicationDirectory,
    @Inject(DESIGN_SYSTEM_SOURCE) private readonly designSystem: DesignSystemSource,
  ) {}

  async onModuleDestroy(): Promise<void> {
    await this.runner.close();
  }

  async scan(request: ScanRequest, principal: AuthPrincipal): Promise<ScanResponse> {
    // An application scan without explicit rules runs the rules the application picked
    const application = request.scope === 'design-system' || !request.applicationId ? null : await this.applications.get(request.applicationId);
    const picked = !request.ruleIds?.length && application?.governanceRules?.length ? application.governanceRules : null;
    const rules = await this.selectRules(picked ?? request.ruleIds, request.categories, picked !== null);
    const tokens = await this.designSystem.tokens();
    const record: ScanRecord = {
      id: `scan-${randomUUID()}`,
      scope: request.scope,
      source: 'design-system',
      createdAt: new Date().toISOString(),
      createdBy: actor(principal),
      rules: rules.map((rule) => ({ id: rule.id, name: rule.name, version: rule.version })),
      ruleResults: [],
      summary: { passed: 0, warnings: 0, errors: 0, info: 0, total: 0 },
      checks: [],
      truncated: false,
    };

    let inputs: ScanInput[];
    if (request.scope === 'design-system') {
      if (request.codebase || request.url) throw new BadRequestException('The design-system scope scans the design system itself; codebase and url are not used');
      const components = await this.designSystem.components();
      if (components.length === 0) throw new BadRequestException('The design system has no components to scan');
      inputs = components.map(componentToInput);
    } else {
      if (!request.applicationId) throw new BadRequestException('applicationId is required for an application scan');
      if (!application) throw new NotFoundException(`Application ${request.applicationId} not found`);
      record.applicationId = application.id;
      record.applicationName = application.name;
      inputs = [await this.applicationInput(request, record)];
    }

    const result = await runRules(rules, inputs, { runner: this.runner, tokens }, { application: record.applicationName });
    Object.assign(record, result);
    await this.store.create(record);
    if (record.applicationId) await this.applications.recordScan(record.applicationId, new Date(record.createdAt));
    return this.toResponse(record);
  }

  /** Runs one unsaved rule against sample code (the rule editor's "Test" button). Nothing is stored. */
  async testRule(definition: RuleDefinition, sample: CodebaseInput) {
    const normalized = normalizeRuleDefinition(definition);
    this.assertCodebaseSize(sample);
    const rule: GovernanceRule = {
      ...normalized,
      enabled: true,
      id: 'test',
      builtIn: false,
      version: 0,
      createdAt: '',
      updatedAt: '',
      createdBy: '',
      updatedBy: '',
    };
    const input: ScanInput = { html: sample.html ?? '', css: sample.css ?? '', javascript: sample.javascript ?? '', file: sample.file };
    const tokens = await this.designSystem.tokens();
    const run = await runRules([rule], [input], { runner: this.runner, tokens });
    const result = run.ruleResults[0];
    return { outcome: result.outcome, reason: result.reason, checks: run.checks, summary: run.summary };
  }

  async list(filter: { applicationId?: string; scope?: ScanScope; limit?: number }) {
    let scans = await this.store.list({ excludes: ['checks', 'ruleResults'] });
    if (filter.applicationId) scans = scans.filter((scan) => scan.applicationId === filter.applicationId);
    if (filter.scope) scans = scans.filter((scan) => scan.scope === filter.scope);
    scans.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { scans: scans.slice(0, filter.limit ?? 50), total: scans.length };
  }

  async get(id: string): Promise<ScanResponse> {
    const found = await this.store.get(id);
    if (!found) throw new NotFoundException(`Scan ${id} not found`);
    return this.toResponse(found.doc);
  }

  /** `fromApplication`: ids saved on an application, where rules deleted or disabled since are skipped rather than refused */
  private async selectRules(ruleIds?: string[], categories?: string[], fromApplication = false): Promise<GovernanceRule[]> {
    const all = await this.rules.list();
    let selected: GovernanceRule[];
    if (fromApplication && ruleIds?.length) {
      const wanted = new Set(ruleIds);
      selected = all.filter((rule) => rule.enabled && wanted.has(rule.id));
    } else if (ruleIds?.length) {
      const byId = new Map(all.map((rule) => [rule.id, rule]));
      const unknown = ruleIds.filter((id) => !byId.has(id));
      if (unknown.length) throw new BadRequestException(`Unknown rule ids: ${unknown.join(', ')}`);
      selected = [...new Set(ruleIds)].map((id) => byId.get(id)!);
    } else {
      selected = all.filter((rule) => rule.enabled);
    }
    if (categories?.length) selected = selected.filter((rule) => categories.includes(rule.category));
    if (selected.length === 0) throw new BadRequestException('No rules to run: none are enabled or match the filter');
    return selected;
  }

  private assertCodebaseSize(codebase: CodebaseInput): void {
    const total = (codebase.html?.length ?? 0) + (codebase.css?.length ?? 0) + (codebase.javascript?.length ?? 0);
    if (total > LIMITS.codebaseTotal) throw new PayloadTooLargeException(`Codebase is larger than ${LIMITS.codebaseTotal / 1024} KB`);
  }

  /**
   * What an application scan looks at: either the code the caller sent, or
   * the HTML of a public URL the server fetches (its inline <style> and
   * <script> blocks become the CSS and JavaScript; scripts are only read,
   * never run). Neither is a 400: there is nothing honest to report.
   */
  private async applicationInput(request: ScanRequest, record: ScanRecord): Promise<ScanInput> {
    const codebase = request.codebase;
    const hasCode = !!codebase && !!(codebase.html?.trim() || codebase.css?.trim() || codebase.javascript?.trim());
    if (hasCode && request.url) throw new BadRequestException('Send either codebase or url, not both');
    if (hasCode) {
      this.assertCodebaseSize(codebase!);
      record.source = 'codebase';
      const html = codebase!.html ?? '';
      return {
        html,
        css: codebase!.css?.trim() ? codebase!.css : blocks(html, 'style'),
        javascript: codebase!.javascript?.trim() ? codebase!.javascript : blocks(html, 'script'),
        file: codebase!.file,
      };
    }
    if (request.url) {
      const page = await fetchPublicPage(request.url, { maxBytes: LIMITS.fetchedBytes });
      record.source = 'url';
      record.url = page.url;
      return { html: page.body, css: blocks(page.body, 'style'), javascript: blocks(page.body, 'script'), file: page.url };
    }
    throw new BadRequestException('Nothing to scan: send codebase { html, css, javascript } or a public url');
  }

  private toResponse(record: ScanRecord): ScanResponse {
    return {
      ...record,
      passed: record.summary.passed,
      warnings: record.summary.warnings,
      failed: record.summary.errors,
      info: record.summary.info,
    };
  }
}
