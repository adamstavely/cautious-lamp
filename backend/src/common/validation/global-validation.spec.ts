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
  // Not converted yet: these belong to the design-system, contribution
  // and scaffolding work, and are passed on without validation as before
  'PatternsLibraryController.createPattern': 'not converted yet (patterns)',
  'PatternsLibraryController.updatePattern': 'not converted yet (patterns)',
  'ContributionWorkflowController.createGuideline': 'not converted yet (contributions)',
  'ContributionWorkflowController.createTemplate': 'not converted yet (contributions)',
  'ContributionWorkflowController.generatePRTemplate': 'not converted yet (contributions)',
  'ContributionWorkflowController.createCheck': 'not converted yet (contributions)',
  'ComponentScaffoldingController.scaffoldComponent': 'not converted yet (component scaffolding)',
  'ComponentScaffoldingController.createComponent': 'not converted yet (component scaffolding)',
  'DesignExtractionController.extract': 'not converted yet (design extraction)',
  'DesignSystemController.createPerformanceBudget': 'not converted yet (design system)',
  'DesignSystemController.updatePerformanceBudget': 'not converted yet (design system)',
  'DesignSystemController.analyzeBundle': 'not converted yet (design system)',
  'DesignSystemController.createRoadmapItem': 'not converted yet (design system)',
  'DesignSystemController.updateRoadmapItem': 'not converted yet (design system)',
  'DesignSystemController.createBanner': 'not converted yet (design system)',
  'DesignSystemController.updateBanner': 'not converted yet (design system)',
  'DesignSystemController.createIssue': 'not converted yet (design system)',
  'DesignSystemController.updateIssue': 'not converted yet (design system)',
  'DesignSystemController.submitNASATLX': 'not converted yet (design system)',
  'DesignSystemController.submitSUS': 'not converted yet (design system)',
  'DesignSystemController.submitHeuristicEvaluation': 'not converted yet (design system)',
  'DesignSystemController.saveComponentVariant': 'not converted yet (design system)',
  'DesignSystemController.createComponent': 'not converted yet (design system)',
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
  });
});
