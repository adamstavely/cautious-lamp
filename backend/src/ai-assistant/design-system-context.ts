import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import type { Component, Token } from '../design-system/design-system.service';
import type { ComponentPattern } from '../patterns-library/patterns-library.service';
import type { RuleDefinition } from '../governance/governance.types';

/**
 * The guideline docs (frontend/public/docs) worth giving the model, most
 * useful first. Each is cut to DOC_CHARS and the set to DOCS_CHARS, so the
 * system prompt stays a few thousand tokens whatever the docs grow to.
 */
const GUIDELINE_DOCS = [
  'colors.md',
  'spacing.md',
  'typography.md',
  'shadows.md',
  'components.md',
  'components/buttons.md',
  'components/forms.md',
  'components/cards.md',
  'principles.md',
  'patterns.md',
  'guidelines/color-contrast.md',
  'guidelines/focus.md',
  'guidelines/keyboard-gestures.md',
  'patterns/forms.md',
  'patterns/error-handling.md',
  'patterns/empty-loading-states.md',
  'patterns/feedback.md',
];
const DOC_CHARS = 1500;
const DOCS_CHARS = 16000;
const DESCRIPTION_CHARS = 200;

/**
 * Where the guideline docs are: DESIGN_DOCS_DIR, else the frontend's public
 * docs next to the backend (the repository in development; the Docker image
 * copies them to the same place).
 */
export function guidelineDocsDir(): string {
  return process.env.DESIGN_DOCS_DIR || path.resolve(__dirname, '..', '..', '..', 'frontend', 'public', 'docs');
}

const logger = new Logger('DesignSystemContext');
let docsCache: { dir: string; text: string } | null = null;

/** The guideline docs as one block of markdown, read once; empty when the folder is missing */
export function guidelineDocs(dir = guidelineDocsDir()): string {
  if (docsCache?.dir === dir) return docsCache.text;
  const parts: string[] = [];
  let total = 0;
  for (const file of GUIDELINE_DOCS) {
    let text: string;
    try {
      text = fs.readFileSync(path.join(dir, file), 'utf8').trim();
    } catch {
      continue;
    }
    const part = `### docs/${file}\n${clip(text, DOC_CHARS)}`;
    if (total + part.length > DOCS_CHARS) break;
    parts.push(part);
    total += part.length;
  }
  if (!parts.length) logger.warn(`No guideline docs found in ${dir}; the AI assistant answers without them`);
  docsCache = { dir, text: parts.join('\n\n') };
  return docsCache.text;
}

export interface DesignSystemFacts {
  components: Component[];
  tokens: Token[];
  patterns: ComponentPattern[];
  rules: Array<Pick<RuleDefinition, 'name' | 'description' | 'category'>>;
}

/**
 * A compact, plain-text summary of the design system: every component the
 * caller may see (id, status, props, accessibility), every token with its
 * value, the patterns and the compliance rules. Component source code is
 * left out; the props say how a component is used.
 */
export function summarizeDesignSystem({ components, tokens, patterns, rules }: DesignSystemFacts): string {
  const componentLines = components.map((c) => {
    const props = c.props.map((p) => (p.options?.length ? `${p.name} (${p.options.join('|')})` : `${p.name}: ${p.type}`));
    const a11y = c.accessibility ? ` Accessibility: ${clip(c.accessibility.wcag, 80)}.` : '';
    return `- ${c.name} [id: ${c.id}, ${c.status}]: ${clip(c.description, DESCRIPTION_CHARS)} Props: ${props.join(', ') || 'none'}.${a11y}`;
  });
  const tokenLines = tokens.map((t) => `- ${t.name} = ${t.value} (${t.category})${t.description ? `: ${clip(t.description, 80)}` : ''}`);
  const patternLines = patterns.map((p) => `- ${p.name} (${p.category}): ${clip(p.description, DESCRIPTION_CHARS)}`);
  const ruleLines = rules.map((r) => `- ${r.name} (${r.category}): ${clip(r.description, 120)}`);

  return [
    `## Components (${components.length})`,
    componentLines.join('\n') || '- none',
    `## Design tokens (${tokens.length})`,
    tokenLines.join('\n') || '- none',
    `## Patterns (${patterns.length})`,
    patternLines.join('\n') || '- none',
    `## Compliance rules (${rules.length})`,
    ruleLines.join('\n') || '- none',
  ].join('\n\n');
}

function clip(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
