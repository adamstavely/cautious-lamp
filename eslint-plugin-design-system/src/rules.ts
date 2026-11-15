import type { Rule } from 'eslint';
import {
  COMPONENT_DECLARATION_SELECTOR,
  findColors,
  getDeclaredIdentifier,
  getPropertyName,
  getTypographyValue,
  isHardcodedSpacing,
  isInvalidComponentName,
  isMissingAccessibleName,
  isNonValueLiteral,
  isTypographyName
} from './checks';
import {
  TOKEN_FIX_SCHEMA,
  TokenFixOptions,
  ValueKind,
  locateInSource,
  quoteOf,
  readOptions,
  safeInside,
  tokenReference,
  uniqueToken
} from './token-fix';

/* eslint-disable @typescript-eslint/no-explicit-any */

/** The fix that swaps `range` for the one token whose value is `value`, if there is exactly one and it fits the quotes */
function tokenFix(options: TokenFixOptions, value: string, kind: ValueKind, range: [number, number] | undefined, quote: string) {
  if (!range) return undefined;
  const name = uniqueToken(options, value, kind);
  if (!name) return undefined;
  const reference = tokenReference(options, name);
  if (!safeInside(reference, quote)) return undefined;
  return (fixer: Rule.RuleFixer) => fixer.replaceTextRange(range, reference);
}

/**
 * For spacing and typography: a fix that replaces a whole string value
 * (`'8px 16px'`) when every part of it is one token's value.
 */
function wholeValueFix(context: Rule.RuleContext, node: any, kind: ValueKind) {
  const options = readOptions(context);
  if (!options.tokens || typeof node.value !== 'string' || !Array.isArray(node.range)) return undefined;
  const raw = context.getSourceCode().getText(node);
  const quote = quoteOf(node, raw);
  // Only plain literals whose source is exactly quote + value + quote
  if (raw !== `${quote}${node.value}${quote}`) return undefined;
  const parts = node.value.trim().split(/\s+/);
  const references: string[] = [];
  for (const part of parts) {
    const name = uniqueToken(options, part, kind);
    if (!name) return undefined;
    const reference = tokenReference(options, name);
    if (!safeInside(reference, quote)) return undefined;
    references.push(reference);
  }
  return (fixer: Rule.RuleFixer) => fixer.replaceText(node, `${quote}${references.join(' ')}${quote}`);
}

const hardcodedDesignTokens: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded colors (hex, rgb(), hsl()); use design tokens instead',
      recommended: true
    },
    messages: {
      hardcodedColor: 'Found hardcoded color: {{value}}. Use design token instead.'
    },
    fixable: 'code',
    schema: TOKEN_FIX_SCHEMA
  },
  create(context) {
    const options = readOptions(context);
    const sourceCode = context.getSourceCode();
    // Reports each color in `text`; with `tokens`, fixes those that are exactly one token's value
    const reportColors = (node: any, text: string) => {
      const values = findColors(text);
      if (values.length === 0) return;
      const source = Array.isArray(node.range) ? sourceCode.getText(node) : '';
      const located = options.tokens && source ? locateInSource(source, node.range[0], values) : [];
      values.forEach((value, i) => {
        const fix = options.tokens ? tokenFix(options, value, 'color', located[i]?.range, quoteOf(node, source)) : undefined;
        context.report({ node, messageId: 'hardcodedColor', data: { value }, ...(fix ? { fix } : {}) });
      });
    };
    return {
      Literal(node: any) {
        if (typeof node.value !== 'string' || isNonValueLiteral(node)) return;
        reportColors(node, node.value);
      },
      TemplateLiteral(node: any) {
        for (const quasi of node.quasis ?? []) {
          reportColors(quasi, quasi?.value?.raw ?? '');
        }
      }
    };
  }
};

const componentNaming: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce PascalCase for component declarations (names starting with an uppercase letter)',
      recommended: false
    },
    messages: {
      invalidNaming: 'Component "{{name}}" should follow PascalCase convention'
    },
    schema: []
  },
  create(context) {
    return {
      [COMPONENT_DECLARATION_SELECTOR](node: any) {
        const id = getDeclaredIdentifier(node);
        if (id && isInvalidComponentName(id.name)) {
          context.report({ node: id, messageId: 'invalidNaming', data: { name: id.name } });
        }
      }
    };
  }
};

const accessibilityAttributes: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require an accessible name on native button/input/select/textarea JSX elements',
      recommended: true
    },
    messages: {
      missingAriaLabel: 'Missing required ARIA attribute: {{attribute}}'
    },
    schema: []
  },
  create(context) {
    return {
      JSXOpeningElement(node: any) {
        if (isMissingAccessibleName(node)) {
          context.report({
            node,
            messageId: 'missingAriaLabel',
            data: { attribute: 'aria-label or aria-labelledby' }
          });
        }
      }
    };
  }
};

const spacingConsistency: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow hardcoded px spacing values; use spacing tokens instead',
      recommended: false
    },
    messages: {
      inconsistentSpacing: 'Use design system spacing tokens instead of hardcoded value {{value}}'
    },
    fixable: 'code',
    schema: TOKEN_FIX_SCHEMA
  },
  create(context) {
    return {
      Literal(node: any) {
        if (typeof node.value !== 'string' || isNonValueLiteral(node)) return;
        if (isHardcodedSpacing(node.value, getPropertyName(node))) {
          const fix = wholeValueFix(context, node, 'length');
          context.report({ node, messageId: 'inconsistentSpacing', data: { value: node.value.trim() }, ...(fix ? { fix } : {}) });
        }
      }
    };
  }
};

const typographyScale: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow hardcoded font sizes / line heights; use typography tokens instead',
      recommended: false
    },
    messages: {
      invalidTypography: 'Use design system typography tokens instead of hardcoded font size {{value}}'
    },
    fixable: 'code',
    schema: TOKEN_FIX_SCHEMA
  },
  create(context) {
    return {
      Literal(node: any) {
        if (isNonValueLiteral(node)) return;
        const name = getPropertyName(node);
        if (!isTypographyName(name)) return;
        const value = getTypographyValue(node.value, name);
        if (value !== undefined) {
          // Numbers (`fontSize: 16`) aren't fixed: a token reference is a string
          const fix = typeof node.value === 'string' ? wholeValueFix(context, node, 'length') : undefined;
          context.report({ node, messageId: 'invalidTypography', data: { value }, ...(fix ? { fix } : {}) });
        }
      }
    };
  }
};

export const builtInRules: Readonly<Record<string, Rule.RuleModule>> = Object.freeze({
  'hardcoded-design-tokens': hardcodedDesignTokens,
  'component-naming': componentNaming,
  'accessibility-attributes': accessibilityAttributes,
  'spacing-consistency': spacingConsistency,
  'typography-scale': typographyScale
});

/**
 * The plugin's live rule registry (`plugin.rules`). Built-in rules are always
 * present; rules fetched by `loadRulesFromAPI` are added to this same object.
 */
export const rules: Record<string, Rule.RuleModule> = { ...builtInRules };
