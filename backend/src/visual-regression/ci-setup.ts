import { ProjectConfig } from './visual-regression.types';

/**
 * What a project's CI runs to produce Argos builds. Argos builds are created
 * by uploading screenshots (its CLI or SDKs), so the workbench can't start one
 * itself: it shows the commands, generated from the project's settings.
 *
 * - The test config: `testDirectories` become `testMatch` globs, `browsers`
 *   Playwright projects.
 * - The screenshot helper: `viewports` and `screenshotOptions` are passed to
 *   `argosScreenshot`, which saves to ./screenshots (no Argos reporter).
 * - The upload: `ignorePatterns` become `--ignore`, and the current baseline's
 *   commit (or the project's branch) is what Argos compares against.
 */
export interface CiSetup {
  /** Shell command run after the tests, with ARGOS_TOKEN set */
  uploadCommand: string;
  /** playwright.config.ts */
  playwrightConfig: string;
  /** tests/argos.ts, imported by tests instead of calling argosScreenshot directly */
  screenshotHelper: string;
  /** Tells this workbench the build exists; only with a webhook secret */
  notifyCommand?: string;
  /** What builds are compared against */
  reference: { kind: 'commit'; commit: string; baselineName: string } | { kind: 'branch'; branch: string };
}

export const SCREENSHOT_ROOT = './screenshots';

export const BROWSERS: Record<string, string> = {
  chromium: 'Desktop Chrome',
  firefox: 'Desktop Firefox',
  webkit: 'Desktop Safari',
};

/** An Argos viewport preset (`iphone-16`) or `WIDTHxHEIGHT` */
export const VIEWPORT_PATTERN = /^(?:[a-z0-9]+(?:-[a-z0-9]+)*|\d{2,5}x\d{2,5})$/;

/** Single-quoted for POSIX shells */
export function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

const js = (value: unknown) => JSON.stringify(value);

function viewportLiteral(viewport: string): string {
  const size = /^(\d+)x(\d+)$/.exec(viewport);
  return size ? `{ width: ${Number(size[1])}, height: ${Number(size[2])} }` : js(viewport);
}

export function buildCiSetup(input: {
  argosProjectId: string;
  argosBranch: string;
  config: ProjectConfig;
  baseline?: { name: string; commitSha?: string };
  /** Absolute URL of the build notification endpoint, when the project has a webhook secret */
  notifyUrl?: string;
}): CiSetup {
  const config = input.config ?? {};
  const dirs = (config.testDirectories ?? []).filter(Boolean);
  const browsers = (config.browsers ?? []).filter((b) => BROWSERS[b]);
  const viewports = (config.viewports ?? []).filter((v) => VIEWPORT_PATTERN.test(v));
  const shot = config.screenshotOptions ?? {};

  const reference: CiSetup['reference'] = input.baseline?.commitSha
    ? { kind: 'commit', commit: input.baseline.commitSha, baselineName: input.baseline.name }
    : { kind: 'branch', branch: input.argosBranch };

  const upload = [`npx @argos-ci/cli upload ${SCREENSHOT_ROOT}`];
  upload.push(
    reference.kind === 'commit'
      ? `--reference-commit ${shellQuote(reference.commit)}`
      : `--reference-branch ${shellQuote(reference.branch)}`,
  );
  const ignore = (config.ignorePatterns ?? []).filter(Boolean);
  if (ignore.length) upload.push(`--ignore ${ignore.map(shellQuote).join(' ')}`);

  const configLines = [
    `import { defineConfig, devices } from '@playwright/test';`,
    ``,
    `// Argos project ${input.argosProjectId}: screenshots are uploaded with the Argos CLI after the run`,
    `export default defineConfig({`,
  ];
  if (dirs.length) {
    configLines.push(`  testMatch: [${dirs.map((d) => js(`${d.replace(/\/+$/, '')}/**/*.spec.ts`)).join(', ')}],`);
  }
  if (browsers.length) {
    configLines.push(`  projects: [`);
    for (const browser of browsers) configLines.push(`    { name: ${js(browser)}, use: { ...devices[${js(BROWSERS[browser])}] } },`);
    configLines.push(`  ],`);
  }
  configLines.push(`});`, ``);

  const options: string[] = [`root: ${js(SCREENSHOT_ROOT)}`];
  if (viewports.length) options.push(`viewports: [${viewports.map(viewportLiteral).join(', ')}]`);
  if (shot.fullPage !== undefined) options.push(`fullPage: ${shot.fullPage ? 'true' : 'false'}`);
  const helperLines = [
    `import type { Page } from '@playwright/test';`,
    `import { argosScreenshot } from '@argos-ci/playwright';`,
    ``,
    `export async function screenshot(page: Page, name: string) {`,
  ];
  if (shot.waitForSelector) helperLines.push(`  await page.waitForSelector(${js(shot.waitForSelector)});`);
  if (shot.waitForTimeout) helperLines.push(`  await page.waitForTimeout(${Number(shot.waitForTimeout)});`);
  helperLines.push(`  await argosScreenshot(page, name, { ${options.join(', ')} });`, `}`, ``);

  const setup: CiSetup = {
    uploadCommand: upload.join(' \\\n  '),
    playwrightConfig: configLines.join('\n'),
    screenshotHelper: helperLines.join('\n'),
    reference,
  };
  if (input.notifyUrl) {
    const body = `{"projectId":${js(input.argosProjectId)}}`;
    setup.notifyCommand = [
      `BODY=${shellQuote(body)}`,
      `SIG="sha256=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$ARGOS_WEBHOOK_SECRET" -r | cut -d' ' -f1)"`,
      `curl -fsS -X POST ${shellQuote(input.notifyUrl)} -H 'Content-Type: application/json' -H "x-argos-signature: $SIG" -d "$BODY"`,
    ].join('\n');
  }
  return setup;
}
