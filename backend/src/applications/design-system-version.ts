import { Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import * as path from 'path';

export interface DesignSystemVersionInfo {
  version: string;
  /** Where it came from: the DESIGN_SYSTEM_VERSION setting, or the backend's package.json */
  source: 'DESIGN_SYSTEM_VERSION' | 'backend-package';
}

const VERSION_PATTERN = /^v?(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/;
const logger = new Logger('DesignSystemVersion');

/** [major, minor, patch], or null if it isn't a semantic version */
export function parseVersion(version: string | undefined | null): [number, number, number] | null {
  const match = typeof version === 'string' ? version.trim().match(VERSION_PATTERN) : null;
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}

/** -1, 0 or 1 like a comparator. Pre-release suffixes are ignored. Invalid versions sort first. */
export function compareVersions(a: string | undefined, b: string | undefined): number {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) return pa ? 1 : pb ? -1 : 0;
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1;
  }
  return 0;
}

function backendPackageVersion(): string {
  // src/applications or dist/applications → backend/package.json
  const file = path.resolve(__dirname, '..', '..', 'package.json');
  return JSON.parse(readFileSync(file, 'utf8')).version;
}

/**
 * The current design system version: `DESIGN_SYSTEM_VERSION` when it is set
 * to a semantic version, otherwise the backend's own package.json version.
 */
export function currentDesignSystemVersion(): DesignSystemVersionInfo {
  const configured = process.env.DESIGN_SYSTEM_VERSION?.trim();
  if (configured) {
    if (parseVersion(configured)) return { version: configured.replace(/^v/, ''), source: 'DESIGN_SYSTEM_VERSION' };
    logger.warn(`DESIGN_SYSTEM_VERSION "${configured}" is not a semantic version; using the backend package version`);
  }
  return { version: backendPackageVersion(), source: 'backend-package' };
}
