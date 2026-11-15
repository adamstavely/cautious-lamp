import { Resource } from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../logger.js';

/**
 * Markdown under these directories is served as `design-system://docs/<path>`:
 * the platform docs (top-level `docs/`: GETTING_STARTED, API_REFERENCE, …) and
 * the design system guides (`frontend/docs/`: index, colors, …). When both have
 * a file at the same path, the first directory wins.
 */
export const DOC_DIRS = ['docs', path.join('frontend', 'docs')];

/** Copies of DOC_DIRS that `npm run bundle-docs` puts in the package, for an installed server outside the repository */
export const BUNDLED_DOCS_DIR = 'bundled-docs';

/**
 * The directories to serve, in order:
 * 1. `MCP_DOCS_DIRS`, a path-delimiter-separated list (`:` on macOS and Linux), when set
 * 2. the repository's DOC_DIRS, found by walking up from this file, so it works from `src/` and `dist/`
 *    whatever the working directory
 * 3. the package's bundled copies
 */
export function resolveDocsDirs(env: NodeJS.ProcessEnv = process.env, from: string = __dirname): string[] {
  const configured = env.MCP_DOCS_DIRS?.split(path.delimiter).map((d) => d.trim()).filter(Boolean);
  if (configured?.length) return configured.map((d) => path.resolve(d));

  const ancestors: string[] = [];
  for (let dir = path.resolve(from); ; dir = path.dirname(dir)) {
    ancestors.push(dir);
    if (path.dirname(dir) === dir) break;
  }
  // The repository first, so a bundle left by `npm pack` in a checkout never shadows the live docs
  for (const dir of ancestors) {
    const repoDirs = DOC_DIRS.map((d) => path.join(dir, d));
    if (repoDirs.every((d) => fs.existsSync(d))) return repoDirs;
  }
  for (const dir of ancestors) {
    const bundled = path.join(dir, BUNDLED_DOCS_DIR);
    if (fs.existsSync(path.join(dir, 'package.json')) && fs.existsSync(bundled)) {
      return DOC_DIRS.map((d) => path.join(bundled, d));
    }
  }
  return [];
}

export interface DocumentationResource extends Resource {
  uri: string;
  name: string;
  description: string;
  mimeType: 'text/markdown';
}

function readMarkdownFile(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    logger.debug('Documentation file read', { filePath });
    return content;
  } catch (error) {
    logger.error('Failed to read documentation file', {
      filePath,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error(`Failed to read documentation file: ${filePath}`);
  }
}

function listMarkdownFiles(dir: string, baseUri: string = ''): DocumentationResource[] {
  const resources: DocumentationResource[] = [];
  
  try {
    if (!fs.existsSync(dir)) {
      return resources;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      // Hidden directories (.vitepress) hold site config, not docs
      if (entry.name.startsWith('.')) continue;
      const fullPath = path.join(dir, entry.name);
      const uri = baseUri ? `${baseUri}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        // Recursively list subdirectories
        resources.push(...listMarkdownFiles(fullPath, uri));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const name = entry.name.replace(/\.md$/, '');
        const resourceUri = `design-system://docs/${uri.replace(/\.md$/, '')}`;
        
        resources.push({
          uri: resourceUri,
          name: `Documentation: ${name}`,
          description: `Design system documentation: ${name}`,
          mimeType: 'text/markdown',
        });
      }
    }
  } catch (error) {
    // Silently fail if directory doesn't exist
  }
  
  return resources;
}

export function listDocumentationResources(): DocumentationResource[] {
  const dirs = resolveDocsDirs();
  const byUri = new Map<string, DocumentationResource>();
  for (const dir of dirs) {
    for (const resource of listMarkdownFiles(dir)) {
      if (!byUri.has(resource.uri)) byUri.set(resource.uri, resource);
    }
  }
  const resources = [...byUri.values()];
  logger.debug('Documentation resources listed', { count: resources.length, dirs });
  return resources;
}

/** `docPath` inside `base`, or null when it would escape it */
function insideDir(base: string, docPath: string): string | null {
  const resolvedBase = path.resolve(base);
  const resolvedPath = path.resolve(path.join(base, `${docPath}.md`));
  // Compare against the base plus a separator so sibling directories that share
  // the prefix (e.g. `docs-private` next to `docs`) are rejected too.
  return resolvedPath.startsWith(resolvedBase + path.sep) ? resolvedPath : null;
}

export async function readDocumentationResource(uri: string): Promise<string> {
  logger.debug('Reading documentation resource', { uri });
  
  // Parse URI: design-system://docs/path/to/file
  const match = uri.match(/^design-system:\/\/docs\/(.+)$/);
  if (!match) {
    logger.error('Invalid documentation URI', { uri });
    throw new Error(`Invalid documentation URI: ${uri}`);
  }
  
  const docPath = match[1];
  const dirs = resolveDocsDirs();
  const candidates = dirs.map((dir) => insideDir(dir, docPath));

  // Security: the path must stay inside the docs directories
  const normalized = path.posix.normalize(docPath);
  if (normalized.startsWith('..') || path.isAbsolute(normalized) || candidates.some((candidate) => candidate === null)) {
    logger.error('Invalid documentation path (security check)', { uri, docPath, dirs });
    throw new Error(`Invalid documentation path: ${docPath}`);
  }

  const found = (candidates as string[]).find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error(`Documentation not found: ${docPath}`);
  }
  return readMarkdownFile(found);
}
