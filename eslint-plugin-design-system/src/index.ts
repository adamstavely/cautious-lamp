import { Rule } from 'eslint';
import { convertToESLintRule, DesignSystemRule, DesignSystemConfig, fetchRules } from './rule-converter';

// Built-in rules that work without API
const builtInRules: Record<string, Rule.RuleModule> = {};

// Create built-in rule implementations
function createBuiltInRules(): Record<string, Rule.RuleModule> {
  return {
    'hardcoded-design-tokens': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Prevent hardcoded design token values',
          category: 'Design System',
          recommended: true
        },
        messages: {
          hardcodedColor: 'Found hardcoded color: {{value}}. Use design token instead.',
          hardcodedSpacing: 'Found hardcoded spacing: {{value}}. Use design token instead.',
          hardcodedTypography: 'Found hardcoded typography: {{value}}. Use design token instead.'
        },
        fixable: 'code',
        schema: []
      },
      create(context) {
        return {
          Literal(node: any) {
            const value = node.value;
            if (typeof value === 'string') {
              // Check for hardcoded colors
              if (/^#[0-9a-fA-F]{6}$/i.test(value)) {
                context.report({
                  node,
                  messageId: 'hardcodedColor',
                  data: { value },
                  fix(fixer) {
                    // Could suggest token replacement
                    return null;
                  }
                });
              }
              // Check for hardcoded spacing
              if (/^\d+px$/.test(value)) {
                const numValue = parseInt(value);
                if (numValue > 0 && numValue <= 100) {
                  context.report({
                    node,
                    messageId: 'hardcodedSpacing',
                    data: { value }
                  });
                }
              }
            }
          },
          TemplateLiteral(node: any) {
            node.quasis.forEach((quasi: any) => {
              const value = quasi.value?.raw || '';
              if (/#[0-9a-fA-F]{6}/i.test(value)) {
                context.report({
                  node: quasi,
                  messageId: 'hardcodedColor',
                  data: { value: value.match(/#[0-9a-fA-F]{6}/i)?.[0] || '' }
                });
              }
            });
          }
        };
      }
    },
    'component-naming': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforce component naming conventions',
          category: 'Design System',
          recommended: false
        },
        messages: {
          invalidNaming: 'Component "{{name}}" should follow PascalCase convention'
        },
        schema: []
      },
      create(context) {
        return {
          Identifier(node: any) {
            const name = node.name;
            if (name && name[0] === name[0].toUpperCase() && name.length > 1) {
              const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;
              if (!pascalCaseRegex.test(name)) {
                context.report({
                  node,
                  messageId: 'invalidNaming',
                  data: { name }
                });
              }
            }
          }
        };
      }
    },
    'accessibility-attributes': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Require accessibility attributes',
          category: 'Accessibility',
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
            const tagName = node.name?.name;
            const attributes = node.attributes || [];
            
            if (['button', 'input', 'select', 'textarea'].includes(tagName?.toLowerCase())) {
              const hasAriaLabel = attributes.some((attr: any) => 
                attr.name?.name === 'aria-label' || attr.name?.name === 'aria-labelledby'
              );
              const hasLabel = attributes.some((attr: any) => 
                attr.name?.name === 'htmlFor' || attr.name?.name === 'for'
              );
              const hasPlaceholder = attributes.some((attr: any) => 
                attr.name?.name === 'placeholder'
              );
              
              if (!hasAriaLabel && !hasLabel && !hasPlaceholder && tagName?.toLowerCase() !== 'input') {
                context.report({
                  node,
                  messageId: 'missingAriaLabel',
                  data: { attribute: 'aria-label or aria-labelledby' }
                });
              }
            }
          }
        };
      }
    },
    'spacing-consistency': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Ensure consistent spacing usage',
          category: 'Design System',
          recommended: false
        },
        messages: {
          inconsistentSpacing: 'Use design system spacing tokens instead of hardcoded values'
        },
        schema: []
      },
      create(context) {
        return {
          Literal(node: any) {
            const value = node.value;
            if (typeof value === 'string' && /^\d+px$/.test(value)) {
              context.report({
                node,
                messageId: 'inconsistentSpacing'
              });
            }
          }
        };
      }
    },
    'typography-scale': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Validate typography scale usage',
          category: 'Design System',
          recommended: false
        },
        messages: {
          invalidTypography: 'Use design system typography tokens instead of hardcoded font sizes'
        },
        schema: []
      },
      create(context) {
        return {
          Literal(node: any) {
            const value = node.value;
            if (typeof value === 'string' && /^\d+(\.\d+)?(px|rem|em)$/.test(value)) {
              const numValue = parseFloat(value);
              if (numValue > 0 && numValue < 100) {
                context.report({
                  node,
                  messageId: 'invalidTypography'
                });
              }
            }
          }
        };
      }
    }
  };
}

// Initialize built-in rules
Object.assign(builtInRules, createBuiltInRules());

// Plugin with built-in rules
const plugin = {
  meta: {
    name: 'eslint-plugin-design-system',
    version: '1.0.0'
  },
  configs: {
    recommended: {
      plugins: ['design-system'],
      rules: {
        'design-system/hardcoded-design-tokens': 'error',
        'design-system/component-naming': 'warn',
        'design-system/accessibility-attributes': 'error',
        'design-system/spacing-consistency': 'warn',
        'design-system/typography-scale': 'warn'
      }
    }
  },
  rules: builtInRules
};

// Function to load additional rules from API
let apiRulesLoaded = false;
let apiRules: Record<string, Rule.RuleModule> = {};

export async function loadRulesFromAPI(config: DesignSystemConfig): Promise<void> {
  if (apiRulesLoaded || !config.apiUrl) {
    return;
  }
  
  try {
    const fetchedRules = await fetchRules(config);
    
    fetchedRules.forEach(rule => {
      if (rule.enabled) {
        const eslintRule = convertToESLintRule(rule, config);
        const ruleName = `design-system/${rule.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
        apiRules[ruleName] = eslintRule;
      }
    });
    
    // Merge API rules into plugin rules
    Object.assign(plugin.rules, apiRules);
    apiRulesLoaded = true;
  } catch (error) {
    console.warn('Failed to load rules from Design System API:', error);
  }
}

// Export plugin
export default plugin;
