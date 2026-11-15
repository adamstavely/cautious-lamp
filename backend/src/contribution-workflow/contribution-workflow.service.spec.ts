import { BadRequestException } from '@nestjs/common';
import { SeedMarker } from '../common/elasticsearch/seed-defaults';
import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { SYSTEM_SCOPE } from '../governance/evidence-access';
import { MetaDoc } from '../governance/governance-stores';
import { GovernanceRule, ScanRecord } from '../governance/governance.types';
import { RulesService } from '../governance/rules.service';
import { ScansService } from '../governance/scans.service';
import { FakeApplications, FakeDesignSystem } from '../governance/testing/fakes';
import { ContributionSubmission, declaredProps, governanceOutcome } from './contribution-checks';
import { DEFAULT_CHECKS, DEFAULT_GUIDELINES } from './contribution-defaults';
import { ContributionWorkflowService } from './contribution-workflow.service';

const GOOD: ContributionSubmission = {
  name: 'ActionButton',
  language: 'vue',
  description: 'A button for the main action on a page or in a dialog.',
  code: `<template>
  <button type="button" class="action-button" :disabled="disabled" @click="$emit('click')">{{ label }}</button>
</template>

<script setup>
defineProps({
  /** The button's text */
  label: { type: String, required: true },
  disabled: { type: Boolean, default: false },
});
defineEmits(['click']);
</script>

<style scoped>
.action-button {
  color: var(--color-on-primary);
  background-color: var(--color-primary);
  padding: 8px 16px;
  border-radius: var(--radius-md);
}
</style>`,
  documentation: '# ActionButton\n\nUse `disabled` while a form is saving.\n\n```vue\n<ActionButton label="Save" />\n```',
  tests: "import ActionButton from './ActionButton.vue';\ndescribe('ActionButton', () => {\n  it('emits click', () => {\n    expect(mount(ActionButton, { props: { label: 'Save' } }).emitted()).toBeTruthy();\n  });\n});",
};

const BAD: ContributionSubmission = {
  name: 'fancy-thing',
  language: 'html',
  code: `<style>.box { color: #ff0000; padding: 13px; }</style>
<div class="box">
  <img src="hero.png">
  <input type="text">
  <h1>Title</h1>
  <h4>Skipped levels</h4>
</div>`,
};

function setup() {
  const rules = new RulesService(new InMemoryStore<GovernanceRule>(), new InMemoryStore<MetaDoc>());
  const scans = new ScansService(rules, new InMemoryStore<ScanRecord>(), new FakeApplications(), new FakeDesignSystem(), { scopeFor: async () => SYSTEM_SCOPE });
  const service = new ContributionWorkflowService({} as never, scans, new InMemoryStore(), new InMemoryStore(), new InMemoryStore(), new InMemoryStore());
  const byName = (results: Array<{ check: { name: string }; status: string }>) => Object.fromEntries(results.map((r) => [r.check.name, r.status]));
  return { service, scans, byName };
}

describe('ContributionWorkflowService.runAutomatedChecks', () => {
  let ctx: ReturnType<typeof setup>;
  beforeAll(() => {
    ctx = setup();
  });
  afterAll(async () => {
    await ctx.scans.onModuleDestroy();
  });

  it('passes known-good code, and leaves what only a person can judge as needs review', async () => {
    const { results, summary } = await ctx.service.runAutomatedChecks(GOOD);
    expect(ctx.byName(results)).toEqual({
      'Accessibility audit': 'pass',
      'Component structure': 'pass',
      'Design system rules': 'pass',
      'Documentation check': 'pass',
      ESLint: 'needs-review',
      Prettier: 'needs-review',
      TypeScript: 'needs-review',
      'Unit tests': 'needs-review',
    });
    expect(summary).toEqual({ passed: 4, failed: 0, needsReview: 4, total: 8 });
    const eslint = results.find((r) => r.check.name === 'ESLint')!;
    expect(eslint.passed).toBeNull();
    expect(eslint.summary).toContain('npm run lint');
  });

  it('fails known-bad code, with the findings that explain why', async () => {
    const { results, summary } = await ctx.service.runAutomatedChecks(BAD);
    expect(ctx.byName(results)).toMatchObject({
      'Accessibility audit': 'fail',
      'Component structure': 'fail',
      'Design system rules': 'fail',
      'Documentation check': 'fail',
      'Unit tests': 'fail',
    });
    expect(summary.failed).toBe(5);
    const messages = (name: string) => results.find((r) => r.check.name === name)!.findings.map((f) => f.message).join('\n');
    expect(messages('Accessibility audit')).toMatch(/alt/i);
    expect(messages('Design system rules')).toMatch(/colour/i);
    expect(messages('Component structure')).toContain('isn\'t PascalCase');
    expect(messages('Documentation check')).toContain('No usage documentation');
    expect(results.find((r) => r.check.name === 'Unit tests')!.summary).toBe('No tests were submitted.');
  });

  it('gives the same results every time for the same submission', async () => {
    const first = await ctx.service.runAutomatedChecks(BAD);
    const second = await ctx.service.runAutomatedChecks(BAD);
    expect(second).toEqual(first);
  });

  it('runs only the checks asked for, and refuses unknown ids', async () => {
    const structure = (await ctx.service.getAllChecks('structure'))[0];
    const { results } = await ctx.service.runAutomatedChecks(GOOD, [structure.id]);
    expect(results.map((r) => r.check.name)).toEqual(['Component structure']);
    await expect(ctx.service.runAutomatedChecks(GOOD, ['check-nope'])).rejects.toBeInstanceOf(BadRequestException);
  });

  it('fails a test file with no cases or assertions, and asks for review of one that has them', async () => {
    const empty = await ctx.service.runAutomatedChecks({ ...GOOD, tests: '// todo' });
    expect(ctx.byName(empty.results)['Unit tests']).toBe('fail');
  });

  it('reports props nobody documented', async () => {
    const { results } = await ctx.service.runAutomatedChecks({ ...GOOD, documentation: '# ActionButton\n\n```vue\n<ActionButton label="Save" />\n```' });
    const docs = results.find((r) => r.check.name === 'Documentation check')!;
    expect(docs.status).toBe('fail');
    expect(docs.findings[0].message).toBe('Props without documentation: disabled. Describe them in the docs or with a /** comment */.');
  });

  it('gives checks created with a command to a reviewer', async () => {
    const check = await ctx.service.createCheck({ name: 'Visual diff', description: 'Chromatic', category: 'testing', enabled: true, command: 'npx chromatic' });
    expect(check.runner).toBe('manual');
    expect((await ctx.service.createCheck({ name: 'A11y', description: 'x', category: 'accessibility', enabled: false })).runner).toBe('governance');
  });
});

describe('governanceOutcome', () => {
  it('needs review when no rules are enabled, rather than passing', () => {
    expect(governanceOutcome([], null, 'accessibility')).toEqual({ status: 'needs-review', summary: 'No accessibility rules are enabled, so nothing was checked automatically.', findings: [] });
  });
});

describe('declaredProps', () => {
  it('reads script-setup, TypeScript, Options API and React props', () => {
    expect(declaredProps("defineProps({ a: String, b: { type: Number, default: () => ({ x: 1 }) } })")).toEqual(['a', 'b']);
    expect(declaredProps("defineProps(['one', 'two'])")).toEqual(['one', 'two']);
    expect(declaredProps('withDefaults(defineProps<{ title: string; open?: boolean }>(), {})')).toEqual(['title', 'open']);
    expect(declaredProps("export default { props: { modelValue: String } }")).toEqual(['modelValue']);
    expect(declaredProps('export function Badge({ tone, children }) { return null }')).toEqual(['tone', 'children']);
  });
});

describe('ContributionWorkflowService storage', () => {
  /** One Elasticsearch "cluster": a new service on the same stores is a restart */
  function cluster() {
    const stores = [new InMemoryStore(), new InMemoryStore(), new InMemoryStore(), new InMemoryStore<SeedMarker>()] as const;
    const start = () => new ContributionWorkflowService({} as never, {} as never, ...(stores as unknown as [never, never, never, never]));
    return { stores, start };
  }

  it('seeds the default guidelines, templates and checks once, under unique ids', async () => {
    const { stores, start } = cluster();
    const service = start();
    expect((await service.getAllGuidelines()).map((g) => g.id).sort()).toEqual(DEFAULT_GUIDELINES.map((g) => g.id).sort());
    expect((await service.getAllTemplates()).map((t) => t.name)).toEqual(['Bug Fix', 'Component Enhancement', 'New Component']);
    const checks = await service.getAllChecks();
    expect(checks).toHaveLength(DEFAULT_CHECKS.length);
    expect(new Set(checks.map((c) => c.id)).size).toBe(checks.length);
    expect(checks.find((c) => c.name === 'ESLint')!.runner).toBe('manual');

    await start().getAllChecks();
    expect(stores[2].docs.size).toBe(DEFAULT_CHECKS.length);
  });

  it('keeps what was added across a restart, and does not bring back a deleted default', async () => {
    const { stores, start } = cluster();
    const before = start();
    const guideline = await before.createGuideline({ title: 'Pattern guidelines', description: 'd', category: 'pattern', content: '# Patterns', checklist: ['Named'] });
    const template = await before.createTemplate({ name: 'Docs fix', description: 'd', category: 'documentation', template: { title: 'Docs', description: 'd', checklist: [] } });
    const check = await before.createCheck({ name: 'Visual diff', description: 'Chromatic', category: 'testing', enabled: true, command: 'npx chromatic' });
    await stores[2].delete('check-prettier');

    const after = start();
    expect(await after.getGuideline(guideline.id)).toEqual(guideline);
    expect(await after.getTemplate(template.id)).toEqual(template);
    expect(await after.getCheck(check.id)).toMatchObject({ name: 'Visual diff', runner: 'manual' });
    expect((await after.getAllChecks()).map((c) => c.name)).not.toContain('Prettier');
  });

  it('generates the pull request text and says no pull request was opened', async () => {
    const result = await cluster().start().generatePRTemplate('template-bug-fix', { title: 'Fix the focus ring' });
    expect(result.pullRequestOpened).toBe(false);
    expect(result.message).toMatch(/no pull request was opened/i);
    expect(result.prTemplate).toContain('## Fix the focus ring');
    expect(result.prTemplate).toContain('- [ ] Root cause identified');
  });
});
