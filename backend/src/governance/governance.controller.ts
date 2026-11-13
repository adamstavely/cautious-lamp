import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { AuthPrincipal, Principal, RequirePermission, hasPermission } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';
import {
  ImportRulesDto,
  ListScansQueryDto,
  PatchRuleDto,
  RuleDefinitionDto,
  ScanApplicationDto,
  ScanDto,
  TestRuleDto,
  UpdateRuleDto,
  strictBody,
} from './governance.dto';
import { RULE_CATEGORIES, RuleCategory, RuleDefinition } from './governance.types';
import { RulesService } from './rules.service';
import { ScanRequest, ScansService } from './scans.service';

const toDefinition = (dto: RuleDefinitionDto): RuleDefinition => ({
  name: dto.name,
  description: dto.description ?? '',
  category: dto.category,
  severity: dto.severity,
  enabled: dto.enabled !== false,
  type: dto.type,
  target: dto.target,
  pattern: dto.pattern,
  flags: dto.flags,
  selector: dto.selector,
  attribute: dto.attribute,
  min: dto.min,
  max: dto.max,
  properties: dto.properties,
  allowedValues: dto.allowedValues,
  builtin: dto.builtin,
  message: dto.message,
});

/**
 * Compliance rules and scans (docs/GOVERNANCE.md). Reads need any signed-in
 * caller; changing rules, application scans and rule tests need
 * admin:governance. No route accepts or runs code.
 */
@Controller('api/v1')
export class GovernanceController {
  constructor(
    private readonly rules: RulesService,
    private readonly scans: ScansService,
  ) {}

  // ---------------------------------------------------------------- rules

  @Get('governance/rules')
  listRules(@Query('category') category?: string) {
    const valid = (RULE_CATEGORIES as readonly string[]).includes(category ?? '') ? (category as RuleCategory) : undefined;
    return this.rules.list({ category: valid }).then((rules) => ({ rules, total: rules.length }));
  }

  @Get('governance/rules/export')
  exportRules() {
    return this.rules.export();
  }

  @Get('governance/rules/:id')
  getRule(@Param('id') id: string) {
    return this.rules.get(id);
  }

  @Post('governance/rules')
  @RequirePermission(Permission.ADMIN_GOVERNANCE)
  createRule(@Body(strictBody()) body: RuleDefinitionDto, @Principal() principal: AuthPrincipal) {
    return this.rules.create(toDefinition(body), principal);
  }

  @Post('governance/rules/import')
  @RequirePermission(Permission.ADMIN_GOVERNANCE)
  importRules(@Body(strictBody()) body: ImportRulesDto, @Principal() principal: AuthPrincipal) {
    const rules = body.rules.map((rule) => ({ ...toDefinition(rule), id: rule.id }));
    return this.rules.import(rules, body.mode ?? 'merge', principal);
  }

  @Post('governance/rules/test')
  @HttpCode(200)
  @RequirePermission(Permission.ADMIN_GOVERNANCE)
  testRule(@Body(strictBody()) body: TestRuleDto) {
    return this.scans.testRule(toDefinition(body.rule), body.sample);
  }

  @Put('governance/rules/:id')
  @RequirePermission(Permission.ADMIN_GOVERNANCE)
  updateRule(@Param('id') id: string, @Body(strictBody()) body: UpdateRuleDto, @Principal() principal: AuthPrincipal) {
    return this.rules.update(id, toDefinition(body), principal, body.version);
  }

  @Patch('governance/rules/:id')
  @RequirePermission(Permission.ADMIN_GOVERNANCE)
  patchRule(@Param('id') id: string, @Body(strictBody()) body: PatchRuleDto, @Principal() principal: AuthPrincipal) {
    return this.rules.patch(id, { enabled: body.enabled, severity: body.severity }, principal, body.version);
  }

  @Delete('governance/rules/:id')
  @HttpCode(204)
  @RequirePermission(Permission.ADMIN_GOVERNANCE)
  async deleteRule(@Param('id') id: string) {
    await this.rules.delete(id);
  }

  // ---------------------------------------------------------------- scans

  @Post('governance/scans')
  @RequirePermission(Permission.COMPONENT_VIEW)
  scan(@Body(strictBody()) body: ScanDto, @Principal() principal: AuthPrincipal) {
    return this.scans.scan(this.toScanRequest(body, principal), principal);
  }

  @Get('governance/scans')
  listScans(@Query(strictBody()) query: ListScansQueryDto) {
    return this.scans.list(query);
  }

  @Get('governance/scans/:id')
  getScan(@Param('id') id: string) {
    return this.scans.get(id);
  }

  /** Older path used by the CLI and MCP server; same body and result as POST governance/scans */
  @Post('compliance/scan')
  @HttpCode(200)
  @RequirePermission(Permission.COMPONENT_VIEW)
  legacyScan(@Body(strictBody()) body: ScanDto, @Principal() principal: AuthPrincipal) {
    return this.scans.scan(this.toScanRequest(body, principal), principal);
  }

  /** Older path used by the CLI */
  @Post('compliance/scan-application')
  @HttpCode(200)
  @RequirePermission(Permission.ADMIN_GOVERNANCE)
  legacyScanApplication(@Body(strictBody()) body: ScanApplicationDto, @Principal() principal: AuthPrincipal) {
    return this.scans.scan({ ...body, scope: 'application' }, principal);
  }

  /** Rules for the ESLint plugin and MCP server (`?format=json|eslint|prettier`) */
  @Get('rules/export')
  async exportRulesForLinter(@Query('format') format: string = 'json') {
    const rules = await this.rules.list();
    const exportedAt = new Date().toISOString();
    if (format === 'eslint') {
      return {
        rules: rules
          .filter((rule) => rule.enabled)
          .map((rule) => ({
            id: rule.id,
            name: rule.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            category: rule.category,
            severity: rule.severity,
            enabled: rule.enabled,
            description: rule.description || rule.name,
          })),
        meta: { version: '2.0.0', exportedAt },
      };
    }
    if (format === 'prettier') {
      return {
        config: { tabWidth: 2, useTabs: false },
        rules: rules.filter((rule) => rule.type === 'token-usage').map((rule) => ({ name: rule.name, category: rule.category })),
        meta: { version: '2.0.0', exportedAt },
      };
    }
    return {
      rules: rules.map((rule) => ({
        id: rule.id,
        name: rule.name,
        category: rule.category,
        enabled: rule.enabled,
        severity: rule.severity,
        type: rule.type,
        target: rule.target,
        description: rule.description || rule.name,
      })),
      version: '2.0.0',
      exportedAt,
    };
  }

  private toScanRequest(body: ScanDto, principal: AuthPrincipal): ScanRequest {
    const scope = body.scope === 'design-system' ? 'design-system' : 'application';
    // Application scans fetch URLs and update applications: governance admins only
    if (scope === 'application' && !hasPermission(principal, Permission.ADMIN_GOVERNANCE)) {
      throw new ForbiddenException(`Requires ${Permission.ADMIN_GOVERNANCE}`);
    }
    return { scope, applicationId: body.applicationId, codebase: body.codebase, url: body.url, ruleIds: body.ruleIds, categories: body.categories };
  }
}
