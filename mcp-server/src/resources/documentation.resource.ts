import { Resource } from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../logger.js';

const DOCS_BASE_PATH = path.join(__dirname, '../../../frontend/docs');

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
      const fullPath = path.join(dir, entry.name);
      const uri = baseUri ? `${baseUri}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        // Recursively list subdirectories
        resources.push(...listMarkdownFiles(fullPath, uri));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const name = entry.name.replace('.md', '');
        const resourceUri = `design-system://docs/${uri.replace('.md', '')}`;
        
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
  const resources = listMarkdownFiles(DOCS_BASE_PATH);
  logger.debug('Documentation resources listed', {
    count: resources.length,
    basePath: DOCS_BASE_PATH,
  });
  return resources;
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
  const filePath = path.join(DOCS_BASE_PATH, `${docPath}.md`);
  
  // Security: ensure the resolved path is within the docs directory
  const resolvedPath = path.resolve(filePath);
  const resolvedBase = path.resolve(DOCS_BASE_PATH);
  
  if (!resolvedPath.startsWith(resolvedBase)) {
    logger.error('Invalid documentation path (security check)', {
      uri,
      docPath,
      resolvedPath,
      resolvedBase,
    });
    throw new Error(`Invalid documentation path: ${docPath}`);
  }
  
  return readMarkdownFile(resolvedPath);
}

