// Reads the snippet files in snippets/ (VS Code's snippet JSON format). Pure, so it can be unit tested.

export interface SnippetDefinition {
  name: string;
  prefix: string;
  body: string;
  description: string;
}

/** Languages and the snippet file each one uses */
export const SNIPPET_FILES: Record<string, string> = {
  javascript: 'javascript.json',
  typescript: 'typescript.json',
  vue: 'vue.json',
  javascriptreact: 'react.json',
  typescriptreact: 'react.json',
};

export function parseSnippets(json: unknown): SnippetDefinition[] {
  if (!json || typeof json !== 'object') return [];
  return Object.entries(json as Record<string, any>).flatMap(([name, def]) => {
    if (!def || typeof def !== 'object') return [];
    const prefixes: unknown[] = Array.isArray(def.prefix) ? def.prefix : [def.prefix];
    const body = Array.isArray(def.body) ? def.body.join('\n') : def.body;
    if (typeof body !== 'string') return [];
    return prefixes
      .filter((prefix): prefix is string => typeof prefix === 'string' && prefix.length > 0)
      .map(prefix => ({ name, prefix, body, description: typeof def.description === 'string' ? def.description : name }));
  });
}
