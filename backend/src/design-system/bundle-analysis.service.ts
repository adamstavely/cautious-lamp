import { brotliCompressSync, constants as zlibConstants, gzipSync } from 'zlib';

/**
 * Bundle size measurement for component source code.
 *
 * Every number here is measured from the code the design system holds: raw
 * UTF-8 bytes, and the real gzip (level 9) and brotli (quality 11) output size
 * of that code, computed with Node's zlib. Nothing is estimated.
 *
 * These are sizes of the component source as stored, not of a production
 * build (no minification or tree shaking), and are labelled as such.
 */

export interface CodeSizes {
  raw: number;
  gzip: number;
  brotli: number;
}

export interface BundleComponentInput {
  id: string;
  name: string;
  code?: { vue?: string; react?: string; html?: string };
  dependencies?: string[];
}

export interface ComponentBundleAnalysis {
  componentId: string;
  componentName: string;
  /** Raw UTF-8 bytes of the Vue source */
  vueSize: number;
  /** Raw UTF-8 bytes of the React source */
  reactSize: number;
  /** vueSize + reactSize */
  totalSize: number;
  /** Raw bytes of the Vue + React source of the dependencies found */
  dependenciesSize: number;
  totalWithDeps: number;
  /** Dependency ids that exist in the design system and were measured */
  dependencies: string[];
  /** Dependency ids listed on the component but not found (not measured) */
  missingDependencies: string[];
  /** Measured gzip size: gzip(vue) + gzip(react) */
  gzippedSize: number;
  /** Measured brotli size: brotli(vue) + brotli(react) */
  brotliSize: number;
  sizes: { vue: CodeSizes; react: CodeSizes };
  status: 'pass' | 'warning' | 'error';
  method: 'measured-source';
  thresholds: { warning: number; error: number };
}

/** Raw-size thresholds for the status badge, in bytes */
export const BUNDLE_SIZE_THRESHOLDS = { warning: 50_000, error: 100_000 };

export function measureCode(code: string | undefined | null): CodeSizes {
  const text = code ?? '';
  if (!text) return { raw: 0, gzip: 0, brotli: 0 };
  const buffer = Buffer.from(text, 'utf8');
  return {
    raw: buffer.byteLength,
    gzip: gzipSync(buffer, { level: 9 }).byteLength,
    brotli: brotliCompressSync(buffer, {
      params: {
        [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
        [zlibConstants.BROTLI_PARAM_SIZE_HINT]: buffer.byteLength,
      },
    }).byteLength,
  };
}

export function bundleStatus(rawSize: number): 'pass' | 'warning' | 'error' {
  if (rawSize > BUNDLE_SIZE_THRESHOLDS.error) return 'error';
  if (rawSize > BUNDLE_SIZE_THRESHOLDS.warning) return 'warning';
  return 'pass';
}

export function analyzeComponentBundle(
  component: BundleComponentInput,
  allComponents: BundleComponentInput[],
  includeDependencies = true,
): ComponentBundleAnalysis {
  const vue = measureCode(component.code?.vue);
  const react = measureCode(component.code?.react);
  const totalSize = vue.raw + react.raw;

  let dependenciesSize = 0;
  const dependencies: string[] = [];
  const missingDependencies: string[] = [];
  if (includeDependencies) {
    for (const depId of component.dependencies ?? []) {
      const dep = allComponents.find((c) => c.id === depId);
      if (!dep) {
        missingDependencies.push(depId);
        continue;
      }
      dependenciesSize +=
        Buffer.byteLength(dep.code?.vue ?? '', 'utf8') + Buffer.byteLength(dep.code?.react ?? '', 'utf8');
      dependencies.push(depId);
    }
  }

  return {
    componentId: component.id,
    componentName: component.name,
    vueSize: vue.raw,
    reactSize: react.raw,
    totalSize,
    dependenciesSize,
    totalWithDeps: totalSize + dependenciesSize,
    dependencies,
    missingDependencies,
    gzippedSize: vue.gzip + react.gzip,
    brotliSize: vue.brotli + react.brotli,
    sizes: { vue, react },
    status: bundleStatus(totalSize),
    method: 'measured-source',
    thresholds: { ...BUNDLE_SIZE_THRESHOLDS },
  };
}

export function analyzeAllBundles(components: BundleComponentInput[]) {
  const analysis = components.map((c) => analyzeComponentBundle(c, components, true));
  const totalSize = analysis.reduce((sum, a) => sum + a.totalSize, 0);
  return {
    components: analysis,
    summary: {
      totalComponents: analysis.length,
      totalSize,
      totalGzippedSize: analysis.reduce((sum, a) => sum + a.gzippedSize, 0),
      totalBrotliSize: analysis.reduce((sum, a) => sum + a.brotliSize, 0),
      averageSize: analysis.length > 0 ? Math.round(totalSize / analysis.length) : 0,
      largestComponent: analysis.length > 0 ? analysis.reduce((max, a) => (a.totalSize > max.totalSize ? a : max)) : null,
      smallestComponent: analysis.length > 0 ? analysis.reduce((min, a) => (a.totalSize < min.totalSize ? a : min)) : null,
    },
  };
}
