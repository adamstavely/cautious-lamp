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

/* eslint-disable @typescript-eslint/no-explicit-any */

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
    schema: []
  },
  create(context) {
    return {
      Literal(node: any) {
        if (typeof node.value !== 'string' || isNonValueLiteral(node)) return;
        for (const value of findColors(node.value)) {
          context.report({ node, messageId: 'hardcodedColor', data: { value } });
        }
      },
      TemplateLiteral(node: any) {
        for (const quasi of node.quasis ?? []) {
          for (const value of findColors(quasi?.value?.raw ?? '')) {
            context.report({ node: quasi, messageId: 'hardcodedColor', data: { value } });
          }
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
    schema: []
  },
  create(context) {
    return {
      Literal(node: any) {
        if (typeof node.value !== 'string' || isNonValueLiteral(node)) return;
        if (isHardcodedSpacing(node.value, getPropertyName(node))) {
          context.report({ node, messageId: 'inconsistentSpacing', data: { value: node.value.trim() } });
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
    schema: []
  },
  create(context) {
    return {
      Literal(node: any) {
        if (isNonValueLiteral(node)) return;
        const name = getPropertyName(node);
        if (!isTypographyName(name)) return;
        const value = getTypographyValue(node.value, name);
        if (value !== undefined) {
          context.report({ node, messageId: 'invalidTypography', data: { value } });
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
