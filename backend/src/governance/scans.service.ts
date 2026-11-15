import { BadRequestException, Inject, Injectable, Logger, NotFoundException, OnModuleDestroy, Optional, PayloadTooLargeException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AuthPrincipal } from '../auth/principal';
import { ComponentReadScope, canReadComponent } from '../design-system/component-access.service';
import { DocumentStore, DuplicateDocumentError } from '../reviews/document-store';
import { READ_SCOPE, ReadScopeResolver, SYSTEM_SCOPE, canReadApplicationEvidence, canReadComponentEvidence, componentAudiences } from './evidence-access';
import { SCAN_STORE } from './governance-stores';
import { GovernanceRule, LIMITS, RuleDefinition, ScanActor, ScanInput, ScanRecord, ScanScope } from './governance.types';
import { RegexRunner } from './regex-safety';
import { RunResult, runRules } from './rule-interpreter';
import { normalizeRuleDefinition } from './rule-validation';
import { RulesService } from './rules.service';
import { fetchPublicPage } from './safe-fetch';
import {
  APPLICATION_DIRECTORY,
  ApplicationDirectory,
  COMPONENT_USAGE_RECORDER,
  ComponentUsageRecorder,
  DESIGN_SYSTEM_SOURCE,
  DesignSystemSource,
} from './sources';

export interface CodebaseInput {
  html?: string;
  css?: string;
  javascript?: string;
  file?: string;
}

export interface ScanRequest {
  scope: ScanScope;
  applicationId?: string;
  /** design-system scope only: these components rather than every readable one */
  componentIds?: string[];
  codebase?: CodebaseInput;
  url?: string;
  ruleIds?: string[];
  categories?: string[];
}

export interface ScanOptions {
  /**
   * An internal caller (the scheduler) scanning on the system's behalf: a
   * design-system scan covers every component, not just those the principal
   * can read. Never set from a request.
   */
  system?: boolean;
  /**
   * A fixed id for the stored scan, so a retried scheduled occurrence stores
   * one scan however many times it runs. If a scan with this id is already
   * stored, it is returned and nothing runs.
   */
  id?: string;
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

/**
 * Runs scans, stores every result, and serves scan history. A design-system
 * scan only covers the components the caller can read, and every stored scan
 * records who may read it (evidence-access.ts), which history and detail reads enforce.
 */
@Injectable()
export class ScansService implements OnModuleDestroy {
  readonly runner = new RegexRunner();
  private readonly logger = new Logger(ScansService.name);

  constructor(
    private readonly rules: RulesService,
    @Inject(SCAN_STORE) private readonly store: DocumentStore<ScanRecord>,
    @Inject(APPLICATION_DIRECTORY) private readonly applications: ApplicationDirectory,
    @Inject(DESIGN_SYSTEM_SOURCE) private readonly designSystem: DesignSystemSource,
    @Inject(READ_SCOPE) private readonly readScope: ReadScopeResolver,
    @Optional() @Inject(COMPONENT_USAGE_RECORDER) private readonly usage?: ComponentUsageRecorder,
  ) {}

  async onModuleDestroy(): Promise<void> {
    await this.runner.close();
  }

  async scan(request: ScanRequest, principal: AuthPrincipal, options: ScanOptions = {}): Promise<ScanResponse> {
    if (options.id) {
      const existing = await this.store.get(options.id);
      if (existing) return this.toResponse(existing.doc);
    }
    // An application scan without explicit rules runs the rules the application picked
    const application = request.scope === 'design-system' || !request.applicationId ? null : await this.applications.get(request.applicationId);
    const picked = !request.ruleIds?.length && application?.governanceRules?.length ? application.governanceRules : null;
    const rules = await this.selectRules(picked ?? request.ruleIds, request.categories, picked !== null);
    const tokens = await this.designSystem.tokens();
    const record: ScanRecord = {
      id: options.id ?? `scan-${randomUUID()}`,
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
      // Only what the caller could read anyway: private workspace components stay out of an outsider's results
      const scope = options.system ? SYSTEM_SCOPE : await this.readScope.scopeFor(principal);
      let components = (await this.designSystem.components()).filter((component) => canReadComponent(scope, component));
      if (request.componentIds?.length) {
        // A component the caller can't read is reported missing, like one that doesn't exist
        const wanted = new Set(request.componentIds);
        const missing = [...wanted].filter((id) => !components.some((component) => component.id === id));
        if (missing.length) throw new NotFoundException(`Components not found: ${missing.join(', ')}`);
        components = components.filter((component) => wanted.has(component.id));
      }
      if (components.length === 0) throw new BadRequestException('The design system has no components to scan');
      record.access = { componentAudiences: componentAudiences(components) };
      inputs = components.map(componentToInput);
    } else {
      if (request.componentIds?.length) throw new BadRequestException('componentIds is for the design-system scope');
      if (!request.applicationId) throw new BadRequestException('applicationId is required for an application scan');
      if (!application) throw new NotFoundException(`Application ${request.applicationId} not found`);
      record.applicationId = application.id;
      record.applicationName = application.name;
      record.access = { workspaceId: application.workspaceId ?? null };
      // Nothing sent: scan the application's own URL, as the scheduler does
      const hasCode = !!(request.codebase?.html?.trim() || request.codebase?.css?.trim() || request.codebase?.javascript?.trim());
      const withDefault = !hasCode && !request.url && application.applicationUrl ? { ...request, url: application.applicationUrl } : request;
      inputs = [await this.applicationInput(withDefault, record)];
    }

    const result = await runRules(rules, inputs, { runner: this.runner, tokens }, { application: record.applicationName });
    Object.assign(record, result);
    try {
      await this.store.create(record);
    } catch (error) {
      // Another run of the same scheduled occurrence stored it first: keep that one
      if (!(options.id && error instanceof DuplicateDocumentError)) throw error;
      const stored = await this.store.get(options.id);
      if (stored) return this.toResponse(stored.doc);
      throw error;
    }
    if (record.applicationId) {
      await this.applications.recordScan(record.applicationId, new Date(record.createdAt), 'governance');
      await this.recordUsage(record, inputs);
    }
    return this.toResponse(record);
  }

  /**
   * Records which design-system components the scanned code uses (analytics).
   * The scan is already stored, so a failure here is logged rather than
   * failing it; analytics then lacks this scan until the application is scanned again.
   */
  private async recordUsage(record: ScanRecord, inputs: ScanInput[]): Promise<void> {
    if (!this.usage || !record.applicationId) return;
    const target = record.source === 'url' ? `url:${record.url ?? ''}` : `codebase:${inputs[0]?.file ?? ''}`;
    try {
      await this.usage.recordApplicationScan({
        scanId: record.id,
        applicationId: record.applicationId,
        applicationName: record.applicationName ?? record.applicationId,
        target,
        scannedAt: record.createdAt,
        inputs,
      });
    } catch (error) {
      this.logger.warn(`Component usage from scan ${record.id} was not recorded: ${(error as Error).message}`);
    }
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

  /**
   * Runs the enabled rules in `categories` over submitted code without storing
   * a scan (contribution checks), leaving out `excludeRuleIds`. Returns the
   * rules that ran with the result; no rules when none are enabled in those categories.
   */
  async evaluate(input: ScanInput, categories: string[], excludeRuleIds: string[] = []): Promise<{ rules: GovernanceRule[]; run: RunResult | null }> {
    this.assertCodebaseSize(input);
    const rules = (await this.rules.list()).filter((rule) => rule.enabled && categories.includes(rule.category) && !excludeRuleIds.includes(rule.id));
    if (rules.length === 0) return { rules, run: null };
    const tokens = await this.designSystem.tokens();
    return { rules, run: await runRules(rules, [input], { runner: this.runner, tokens }) };
  }

  /** Scan history the principal may read (`total` counts only those) */
  async list(filter: { applicationId?: string; scope?: ScanScope; limit?: number }, principal: AuthPrincipal) {
    let scans = await this.store.list({ excludes: ['checks', 'ruleResults'] });
    const scope = await this.readScope.scopeFor(principal);
    scans = scans.filter((scan) => this.canRead(scan, principal, scope));
    if (filter.applicationId) scans = scans.filter((scan) => scan.applicationId === filter.applicationId);
    if (filter.scope) scans = scans.filter((scan) => scan.scope === filter.scope);
    scans.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { scans: scans.slice(0, filter.limit ?? 50), total: scans.length };
  }

  /** A scan the principal may not read is a 404, like a missing one, so ids can't be probed */
  async get(id: string, principal: AuthPrincipal): Promise<ScanResponse> {
    const found = await this.store.get(id);
    if (!found || !this.canRead(found.doc, principal, await this.readScope.scopeFor(principal))) throw new NotFoundException(`Scan ${id} not found`);
    return this.toResponse(found.doc);
  }

  private canRead(scan: ScanRecord, principal: AuthPrincipal, scope: ComponentReadScope): boolean {
    return scan.scope === 'application' ? canReadApplicationEvidence(principal, scope, scan.access) : canReadComponentEvidence(scope, scan.access);
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
    throw new BadRequestException('Nothing to scan: send codebase { html, css, javascript } or a public url, or set the application URL');
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
