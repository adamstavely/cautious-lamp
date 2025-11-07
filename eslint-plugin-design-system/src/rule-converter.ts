import { Rule } from 'eslint';
import axios from 'axios';

export interface DesignSystemRule {
  name: string;
  category: string;
  enabled: boolean;
  severity: 'error' | 'warning' | 'info';
  description: string;
  scannerCode?: string;
}

export interface DesignSystemConfig {
  apiUrl?: string;
  apiKey?: string;
  rules?: DesignSystemRule[];
  cacheRules?: boolean;
  cacheTimeout?: number;
}

let rulesCache: DesignSystemRule[] | null = null;
let cacheTimestamp: number = 0;

export async function fetchRules(config: DesignSystemConfig): Promise<DesignSystemRule[]> {
  const cacheTimeout = config.cacheTimeout || 5 * 60 * 1000;
  
  if (config.cacheRules !== false && rulesCache && Date.now() - cacheTimestamp < cacheTimeout) {
    return rulesCache;
  }
  
  if (!config.apiUrl) {
    throw new Error('Design System API URL not configured. Set apiUrl in ESLint settings.');
  }
  
  try {
    const response = await axios.get(`${config.apiUrl}/rules/export`, {
      params: { format: 'eslint' },
      headers: {
        Authorization: config.apiKey ? `Bearer ${config.apiKey}` : undefined
      }
    });
    
    rulesCache = response.data.rules || [];
    cacheTimestamp = Date.now();
    
    return rulesCache;
  } catch (error: any) {
    console.warn('Failed to fetch rules from Design System API:', error.message);
    return rulesCache || [];
  }
}

export function convertToESLintRule(rule: DesignSystemRule, config: DesignSystemConfig): Rule.RuleModule {
  const ruleName = rule.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  return {
    meta: {
      type: rule.severity === 'error' ? 'problem' : 'suggestion',
      docs: {
        description: rule.description || rule.name,
        category: rule.category,
        recommended: rule.severity === 'error'
      } as any,
      messages: {
        violation: '{{message}}',
        useToken: 'Use design token {{token}} instead of {{value}}',
        hardcodedValue: 'Found hardcoded {{type}}: {{value}}. Use design token instead.',
        missingAttribute: 'Missing required attribute: {{attribute}}',
        namingConvention: '{{message}}'
      },
      fixable: 'code' as const,
      schema: []
    },
    create(context) {
      return createASTVisitor(rule, context, config);
    }
  };
}

function createASTVisitor(rule: DesignSystemRule, context: any, config: DesignSystemConfig): any {
  const visitors: any = {};
  const scannerCode = rule.scannerCode || '';
  
  // Pattern 1: Check for hardcoded colors
  if (scannerCode.includes('hardcoded') && scannerCode.includes('color')) {
    visitors.Literal = (node: any) => {
      const value = node.value;
      if (typeof value === 'string' && /^#[0-9a-fA-F]{6}$/i.test(value)) {
        context.report({
          node,
          messageId: 'hardcodedValue',
          data: { type: 'color', value: value }
        });
      }
    };
  }
  
  // Pattern 2: Check for hardcoded spacing
  if (scannerCode.includes('spacing') || scannerCode.includes('Spacing')) {
    visitors.Literal = (node: any) => {
      const value = node.value;
      if (typeof value === 'string' && /^\d+px$/.test(value)) {
        const numValue = parseInt(value);
        if (numValue > 0 && numValue <= 100) {
          context.report({
            node,
            messageId: 'hardcodedValue',
            data: { type: 'spacing', value: value }
          });
        }
      }
    };
  }
  
  // Pattern 3: Check component naming
  if (scannerCode.includes('naming') || scannerCode.includes('Naming')) {
    visitors.Identifier = (node: any) => {
      const name = node.name;
      if (name && name[0] === name[0].toUpperCase() && name.length > 1) {
        const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;
        if (!pascalCaseRegex.test(name)) {
          context.report({
            node,
            messageId: 'namingConvention',
            data: { message: `Component "${name}" should follow PascalCase convention` }
          });
        }
      }
    };
  }
  
  // Pattern 4: Check for missing ARIA attributes
  if (scannerCode.includes('aria') || scannerCode.includes('ARIA') || scannerCode.includes('Accessibility')) {
    visitors.JSXOpeningElement = (node: any) => {
      const tagName = node.name?.name;
      const attributes = node.attributes || [];
      
      if (['button', 'input', 'select', 'textarea'].includes(tagName?.toLowerCase())) {
        const hasAriaLabel = attributes.some((attr: any) => 
          attr.name?.name === 'aria-label' || attr.name?.name === 'aria-labelledby'
        );
        
        if (!hasAriaLabel) {
          context.report({
            node,
            messageId: 'missingAttribute',
            data: { attribute: 'aria-label or aria-labelledby' }
          });
        }
      }
    };
  }
  
  // Pattern 5: Check for design token usage
  if (scannerCode.includes('token') || scannerCode.includes('Token')) {
    visitors.TemplateLiteral = (node: any) => {
      node.quasis.forEach((quasi: any) => {
        const value = quasi.value?.raw || '';
        if (/#[0-9a-fA-F]{6}/i.test(value)) {
          context.report({
            node: quasi,
            messageId: 'hardcodedValue',
            data: {
              type: 'color',
              value: value.match(/#[0-9a-fA-F]{6}/i)?.[0] || ''
            }
          });
        }
      });
    };
  }
  
  // Default: Generic pattern matching
  if (Object.keys(visitors).length === 0) {
    visitors.Literal = (node: any) => {
      const value = node.value;
      if (typeof value === 'string' && /^#[0-9a-fA-F]{6}$/i.test(value)) {
        context.report({
          node,
          messageId: 'violation',
          data: { message: `Hardcoded color detected: ${value}. Consider using a design token.` }
        });
      }
    };
  }
  
  return visitors;
}
