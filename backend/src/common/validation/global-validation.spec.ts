import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { PATH_METADATA, ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { RouteParamtypes } from '@nestjs/common/enums/route-paramtypes.enum';
import { getMetadataStorage } from 'class-validator';
import * as fs from 'fs';
import * as path from 'path';
import { CreateProjectDto as CreateSessionReplayProjectDto } from '../../session-replay/dto/create-project.dto';
import { CreateBaselineDto } from '../../visual-regression/dto/project-settings.dto';
import { CreatePaletteDto } from '../../color-palette/dto/create-palette.dto';
import { AnalyzeVideoDto } from '../../photosensitivity/photosensitivity.dto';
import { ComponentVariantDto, CreateBannerDto, CreateComponentDto, HeuristicEvaluationDto, SusDto, UpdateIssueDto } from '../../design-system/design-system.dto';
import { CreatePatternDto, UpdatePatternDto } from '../../patterns-library/patterns-library.dto';
import { ComponentScaffoldDto } from '../../component-scaffolding/component-scaffolding.dto';
import { ExtractRequestDto } from '../../design-extraction/design-extraction.dto';
import { CreateCheckDto, CreateGuidelineDto, CreateTemplateDto, GeneratePullRequestDto } from '../../contribution-workflow/contribution-workflow.dto';
import { GLOBAL_VALIDATION_OPTIONS, globalValidationPipe } from './global-validation';

/**
 * Bodies the global pipe doesn't validate because they are typed as plain
 * objects, with why. A new free-form body has to be added here (or given a
 * DTO), so none slips in unnoticed.
 */
const FREE_FORM_BODIES: Record<string, string> = {
  // Validated by hand in the service, against the resource kind's own DTO
  'WorkspacesController.createResource': 'validated per resource kind (workspaces/resource-kinds.ts)',
  'WorkspacesController.updateResource': 'validated per resource kind (workspaces/resource-kinds.ts)',
  'WorkspacesController.createStyleDictionary': 'validated per resource kind (workspaces/resource-kinds.ts)',
  // A third party's payload, authenticated by its signature over the raw bytes
  'ArgosWebhookController.handleArgosWebhook': "Argos's webhook payload, checked by signature",
  // Connections are validated by the service against each provider's settings
  'TokenSyncController.createConnection': 'validated by the token-sync service per provider',
  'TokenSyncController.updateConnection': 'validated by the token-sync service per provider',
  'DesignSyncController.createConnection': 'validated by the design-sync service per provider',
  'DesignSyncController.updateConnection': 'validated by the design-sync service per provider',
  // Multipart: validated in the handler against VersionDto, so a refused request can delete its staged upload
  'ReviewsController.addVersion': 'validated in the handler (VersionDto) after the upload is staged',
};

/** Every controller class under src/, with the file it came from */
function controllers(): Array<{ name: string; cls: any }> {
  const root = path.resolve(__dirname, '../..');
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.controller.ts') && !/ \d\./.test(entry.name)) files.push(full);
    }
  };
  walk(root);
  const found: Array<{ name: string; cls: any }> = [];
  for (const file of files) {
    for (const exported of Object.values(require(file))) {
      if (typeof exported === 'function' && Reflect.getMetadata(PATH_METADATA, exported) !== undefined) found.push({ name: exported.name, cls: exported });
    }
  }
  return found;
}

/** Whole-object @Body() and @Query() parameters: what the global pipe sees */
function objectParams() {
  const params: Array<{ route: string; kind: 'body' | 'query'; metatype: unknown }> = [];
  for (const { name, cls } of controllers()) {
    for (const method of Object.getOwnPropertyNames(cls.prototype)) {
      const args: Record<string, { index: number; data?: unknown }> = Reflect.getMetadata(ROUTE_ARGS_METADATA, cls, method) ?? {};
      const types: unknown[] = Reflect.getMetadata('design:paramtypes', cls.prototype, method) ?? [];
      for (const [key, arg] of Object.entries(args)) {
        const type = Number(key.split(':')[0]);
        if ((type !== RouteParamtypes.BODY && type !== RouteParamtypes.QUERY) || arg.data !== undefined) continue;
        params.push({ route: `${name}.${method}`, kind: type === RouteParamtypes.BODY ? 'body' : 'query', metatype: types[arg.index] });
      }
    }
  }
  return params;
}

const isPlain = (metatype: unknown) => !metatype || [Object, String, Number, Boolean, Array].includes(metatype as any);
const decorated = (metatype: any) => getMetadataStorage().getTargetValidationMetadatas(metatype, '', true, false).length > 0;

describe('Global validation (whitelist + forbidNonWhitelisted)', () => {
  const params = objectParams();

  it('is on for every route', () => {
    expect(GLOBAL_VALIDATION_OPTIONS).toMatchObject({ whitelist: true, forbidNonWhitelisted: true });
    expect(params.length).toBeGreaterThan(50);
  });

  it('types every body and query as a validated DTO class, or lists it as free-form', () => {
    const undecorated = params.filter((p) => !isPlain(p.metatype) && !decorated(p.metatype)).map((p) => `${p.route} (${(p.metatype as any).name})`);
    // A class without validation decorators would have every property refused
    expect(undecorated).toEqual([]);
    const unlisted = params.filter((p) => p.kind === 'body' && isPlain(p.metatype) && !FREE_FORM_BODIES[p.route]).map((p) => p.route);
    expect(unlisted).toEqual([]);
    const plainQueries = params.filter((p) => p.kind === 'query' && isPlain(p.metatype)).map((p) => p.route);
    expect(plainQueries.every((route) => route.startsWith('VisualRegressionController.'))).toBe(true);
  });

  it('lists no free-form body that no longer exists or now has a DTO', () => {
    const plainBodies = new Set(params.filter((p) => p.kind === 'body' && isPlain(p.metatype)).map((p) => p.route));
    expect(Object.keys(FREE_FORM_BODIES).filter((route) => !plainBodies.has(route))).toEqual([]);
  });

  describe('refuses unknown fields on representative routes', () => {
    const pipe = globalValidationPipe();
    const body = (metatype: ArgumentMetadata['metatype']): ArgumentMetadata => ({ type: 'body', metatype });
    const refused = async (value: unknown, metatype: ArgumentMetadata['metatype']) => {
      try {
        await pipe.transform(value, body(metatype));
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        return ((error as BadRequestException).getResponse() as { message: string[] }).message;
      }
      throw new Error('accepted');
    };

    it('palettes, including nested colours', async () => {
      const ok = { name: 'Brand', colors: [{ hex: '#112233', name: 'Ink', role: null }] };
      await expect(pipe.transform(ok, body(CreatePaletteDto))).resolves.toEqual(ok);
      expect(await refused({ ...ok, owner: { id: 'someone-else' } }, CreatePaletteDto)).toEqual(['property owner should not exist']);
      expect(await refused({ ...ok, colors: [{ hex: '#112233', extra: 1 }] }, CreatePaletteDto)).toEqual(['colors.0.property extra should not exist']);
    });

    it('session-replay projects, visual-regression baselines and photosensitivity form fields', async () => {
      const project = { name: 'Shop', openreplayProjectKey: 'key', workspaceId: null };
      await expect(pipe.transform(project, body(CreateSessionReplayProjectDto))).resolves.toEqual(project);
      expect(await refused({ ...project, createdBy: 'me' }, CreateSessionReplayProjectDto)).toEqual(['property createdBy should not exist']);
      expect(await refused({ name: 'Release', runId: 'run_1', approvedBy: 'me' }, CreateBaselineDto)).toEqual(['property approvedBy should not exist']);
      expect(await refused({ applicationName: 'Shop', owner: 'x' }, AnalyzeVideoDto)).toEqual(['property owner should not exist']);
    });
    it('design-system banners, issues, components and variants', async () => {
      const banner = { title: 'Maintenance', message: 'Tonight', type: 'info' };
      await expect(pipe.transform(banner, body(CreateBannerDto))).resolves.toEqual(banner);
      expect(await refused({ ...banner, createdAt: '2020-01-01' }, CreateBannerDto)).toEqual(['property createdAt should not exist']);
      expect(await refused({ ...banner, type: 'loud' }, CreateBannerDto)).toEqual([expect.stringContaining('type must be one of')]);
      expect(await refused({ status: 'resolved', id: 'other' }, UpdateIssueDto)).toEqual(['property id should not exist']);
      expect(await refused({ status: null }, UpdateIssueDto)).toEqual([expect.stringContaining('status must be one of')]);
      expect(await refused({ id: 'card', name: 'Card', description: 'x', isGlobal: true }, CreateComponentDto)).toEqual(['property isGlobal should not exist']);
      expect(await refused({ id: 'Not An Id', name: 'Card', description: 'x' }, CreateComponentDto)).toEqual(['id must be a kebab-case component id']);
      expect(await refused({ name: 'compact', properties: { hover: { glow: 'x' } } }, ComponentVariantDto)).toEqual(['properties.hover.property glow should not exist']);
    });

    it('research forms: SUS answers 1-5, heuristic ratings 0-4', async () => {
      const sus = { systemName: 'Shop', q1: 5, q2: 1, q3: 4, q4: 2, q5: 4, q6: 2, q7: 5, q8: 1, q9: 4, q10: 2, user: 'Ana' };
      await expect(pipe.transform(sus, body(SusDto))).resolves.toEqual(sus);
      expect(await refused({ ...sus, q3: 6 }, SusDto)).toEqual(['q3 must not be greater than 5']);
      expect(await refused({ ...sus, score: 100 }, SusDto)).toEqual(['property score should not exist']);
      const evaluation = { systemName: 'Shop', evaluator: 'Ana', heuristics: [{ heuristic: 'Visibility', issues: '', severity: 0 }], overallAssessment: 'Fine' };
      await expect(pipe.transform(evaluation, body(HeuristicEvaluationDto))).resolves.toEqual(evaluation);
      expect(await refused({ ...evaluation, heuristics: [{ heuristic: 'Visibility', issues: '', severity: 9 }] }, HeuristicEvaluationDto)).toEqual(['heuristics.0.severity must not be greater than 4']);
      expect(await refused({ ...evaluation, heuristics: [] }, HeuristicEvaluationDto)).toEqual(['heuristics must contain at least 1 elements']);
    });

    it('patterns, scaffolding and design extraction', async () => {
      expect(await refused({ name: 'Grid', description: 'Cards', category: 'common', id: 'mine' }, CreatePatternDto)).toEqual(['property id should not exist']);
      expect(await refused({ name: null }, UpdatePatternDto)).toEqual(expect.arrayContaining(['name must be a string']));
      await expect(pipe.transform({ description: 'Rows' }, body(UpdatePatternDto))).resolves.toEqual({ description: 'Rows' });
      const scaffold = { name: 'Alert', description: '', category: '', props: [{ name: 'tone', type: 'enum', options: ['info'], defaultValue: 'info' }], styles: { colors: { background: '#eef' } } };
      await expect(pipe.transform(scaffold, body(ComponentScaffoldDto))).resolves.toEqual(scaffold);
      expect(await refused({ ...scaffold, styles: { colors: { glow: 'x' } } }, ComponentScaffoldDto)).toEqual(['styles.colors.property glow should not exist']);
      expect(await refused({ ...scaffold, props: [{ name: 'tone', type: 'tuple' }] }, ComponentScaffoldDto)).toEqual([expect.stringContaining('props.0.type must be one of')]);
      expect(await refused({ url: 'https://example.com', options: { headless: false } }, ExtractRequestDto)).toEqual(['options.property headless should not exist']);
      expect(await refused({ url: '  ' }, ExtractRequestDto)).toEqual(['URL cannot be empty']);
    });
    it('contribution guidelines, templates, checks and pull requests', async () => {
      const guideline = { title: 'Buttons', description: 'How', category: 'component', content: 'Use tokens', checklist: ['Tokens'] };
      await expect(pipe.transform(guideline, body(CreateGuidelineDto))).resolves.toEqual(guideline);
      expect(await refused({ ...guideline, category: 'other' }, CreateGuidelineDto)).toEqual([expect.stringContaining('category must be one of')]);
      expect(await refused({ ...guideline, title: '  ' }, CreateGuidelineDto)).toEqual(['title should not be empty']);
      expect(await refused({ name: 'PR', description: 'x', category: 'token', template: { title: 'T', description: '', checklist: [], owner: 'x' } }, CreateTemplateDto)).toEqual(['template.property owner should not exist']);
      expect(await refused({ name: 'Lint', description: 'x', category: 'linting', enabled: 'yes' }, CreateCheckDto)).toEqual(['enabled must be a boolean value']);

      const pr = { title: 'Add Chip', files: [{ path: 'src/components/Chip.vue', content: '<template />' }] };
      await expect(pipe.transform(pr, body(GeneratePullRequestDto))).resolves.toEqual(pr);
      for (const path of ['../secrets', '/etc/passwd', '.github/workflows/ci.yml', 'src//Chip.vue', 'src/./Chip.vue']) {
        expect(await refused({ files: [{ path, content: '' }] }, GeneratePullRequestDto)).toEqual([expect.stringContaining('files.0.path must be a relative path')]);
      }
      expect(await refused({ files: [{ path: 'a.txt', content: 'x', mode: '100755' }] }, GeneratePullRequestDto)).toEqual(['files.0.property mode should not exist']);
    });
  });
});
