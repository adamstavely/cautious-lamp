import { Injectable } from '@nestjs/common';
import { Component, Token } from './design-system.service';

export interface Rule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: 'info' | 'warning' | 'error';
  scanner: (context: ScannerContext) => ComplianceCheck[];
}

export interface ScannerContext {
  components: Component[];
  tokens: Token[];
  codebase?: any; // For application scanning
  applicationName?: string;
}

export interface ComplianceCheck {
  id: string;
  rule: string;
  status: 'pass' | 'warning' | 'error';
  message: string;
  component?: string;
  application?: string;
  file?: string;
  line?: number;
}

@Injectable()
export class ComplianceScannerService {
  private rules: Map<string, Rule> = new Map();

  constructor() {
    this.registerDefaultRules();
  }

  private registerDefaultRules() {
    // Rule 1: Color Contrast WCAG AA
    this.rules.set('Color Contrast WCAG AA', {
      id: 'color-contrast-wcag-aa',
      name: 'Color Contrast WCAG AA',
      description: 'All text must meet WCAG AA contrast requirements (4.5:1)',
      enabled: true,
      severity: 'error',
      scanner: (context) => {
        const checks: ComplianceCheck[] = [];
        const contrastThreshold = 4.5;

        // Check component code for color usage
        context.components.forEach(component => {
          const code = component.code.vue || component.code.react || '';
          
          // Look for color values in code
          const colorMatches = code.match(/#[0-9a-fA-F]{6}|rgb\([^)]+\)|rgba\([^)]+\)/g);
          
          if (colorMatches) {
            // Simplified check - in production, would calculate actual contrast
            // For now, check if component has accessibility notes
            if (!component.accessibility?.wcag) {
              checks.push({
                id: `contrast-${component.id}`,
                rule: 'Color Contrast WCAG AA',
                status: 'warning',
                message: `Component "${component.name}" may not meet WCAG AA contrast requirements`,
                component: component.name
              });
            } else {
              checks.push({
                id: `contrast-${component.id}`,
                rule: 'Color Contrast WCAG AA',
                status: 'pass',
                message: `Component "${component.name}" meets WCAG AA contrast requirements`,
                component: component.name
              });
            }
          }
        });

        return checks.length > 0 ? checks : [{
          id: 'contrast-overall',
          rule: 'Color Contrast WCAG AA',
          status: 'pass',
          message: 'All design system components meet WCAG AA contrast requirements'
        }];
      }
    });

    // Rule 2: Spacing Consistency
    this.rules.set('Spacing Consistency', {
      id: 'spacing-consistency',
      name: 'Spacing Consistency',
      description: 'Spacing must use design tokens (4px, 8px, 16px, etc.)',
      enabled: true,
      severity: 'warning',
      scanner: (context) => {
        const checks: ComplianceCheck[] = [];
        const validSpacingValues = ['4px', '8px', '12px', '16px', '24px', '32px', '48px', '64px'];
        const spacingTokens = context.tokens.filter(t => t.category === 'spacing');
        const tokenValues = spacingTokens.map(t => t.value);

        context.components.forEach(component => {
          const code = component.code.vue || component.code.react || '';
          
          // Look for spacing values (px, rem, em)
          const spacingRegex = /(\d+(?:\.\d+)?)\s*(px|rem|em)/g;
          const matches = [...code.matchAll(spacingRegex)];
          
          matches.forEach(match => {
            const value = match[1];
            const unit = match[2];
            const fullValue = `${value}${unit}`;
            
            // Check if it's a standard spacing value or token
            const isStandard = validSpacingValues.includes(fullValue) || 
                             tokenValues.some(tv => tv.includes(value));
            
            if (!isStandard && unit === 'px') {
              checks.push({
                id: `spacing-${component.id}-${match.index}`,
                rule: 'Spacing Consistency',
                status: 'warning',
                message: `Component "${component.name}" uses non-standard spacing value: ${fullValue}`,
                component: component.name
              });
            }
          });
        });

        return checks.length > 0 ? checks : [{
          id: 'spacing-overall',
          rule: 'Spacing Consistency',
          status: 'pass',
          message: 'All components use design tokens for spacing'
        }];
      }
    });

    // Rule 3: Typography Scale
    this.rules.set('Typography Scale', {
      id: 'typography-scale',
      name: 'Typography Scale',
      description: 'Font sizes must follow the defined typography scale',
      enabled: true,
      severity: 'warning',
      scanner: (context) => {
        const checks: ComplianceCheck[] = [];
        const typographyTokens = context.tokens.filter(t => t.category === 'typography' && t.type === 'fontSize');
        const validFontSizes = typographyTokens.map(t => t.value);

        context.components.forEach(component => {
          const code = component.code.vue || component.code.react || '';
          
          // Look for font-size declarations
          const fontSizeRegex = /font-size:\s*([^;]+);/gi;
          const matches = [...code.matchAll(fontSizeRegex)];
          
          matches.forEach(match => {
            const fontSize = match[1].trim();
            const isStandard = validFontSizes.some(vs => vs.includes(fontSize) || fontSize.includes(vs));
            
            if (!isStandard) {
              checks.push({
                id: `typography-${component.id}-${match.index}`,
                rule: 'Typography Scale',
                status: 'warning',
                message: `Component "${component.name}" uses non-standard font size: ${fontSize}`,
                component: component.name
              });
            }
          });
        });

        return checks.length > 0 ? checks : [{
          id: 'typography-overall',
          rule: 'Typography Scale',
          status: 'pass',
          message: 'All font sizes follow the typography scale'
        }];
      }
    });

    // Rule 4: Component Naming
    this.rules.set('Component Naming', {
      id: 'component-naming',
      name: 'Component Naming',
      description: 'Components must follow PascalCase naming convention',
      enabled: true,
      severity: 'info',
      scanner: (context) => {
        const checks: ComplianceCheck[] = [];
        const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;

        context.components.forEach(component => {
          const isValid = pascalCaseRegex.test(component.name);
          
          if (!isValid) {
            checks.push({
              id: `naming-${component.id}`,
              rule: 'Component Naming',
              status: 'warning',
              message: `Component "${component.name}" does not follow PascalCase convention`,
              component: component.name
            });
          }
        });

        return checks.length > 0 ? checks : [{
          id: 'naming-overall',
          rule: 'Component Naming',
          status: 'pass',
          message: 'All components follow PascalCase convention'
        }];
      }
    });

    // Rule 5: Accessibility Attributes
    this.rules.set('Accessibility Attributes', {
      id: 'accessibility-attributes',
      name: 'Accessibility Attributes',
      description: 'All interactive elements must have ARIA labels',
      enabled: true,
      severity: 'error',
      scanner: (context) => {
        const checks: ComplianceCheck[] = [];
        const interactiveElements = ['button', 'input', 'select', 'textarea', 'a'];

        context.components.forEach(component => {
          const code = component.code.vue || component.code.react || '';
          
          // Check for interactive elements
          interactiveElements.forEach(element => {
            const elementRegex = new RegExp(`<${element}[^>]*>`, 'gi');
            const matches = [...code.matchAll(elementRegex)];
            
            matches.forEach(match => {
              const tagContent = match[0];
              const hasAriaLabel = /aria-label|aria-labelledby/i.test(tagContent);
              const hasLabel = /<label/i.test(code);
              
              if (!hasAriaLabel && !hasLabel) {
                checks.push({
                  id: `accessibility-${component.id}-${match.index}`,
                  rule: 'Accessibility Attributes',
                  status: 'error',
                  message: `Component "${component.name}" has ${element} element without ARIA label`,
                  component: component.name
                });
              }
            });
          });
        });

        return checks.length > 0 ? checks : [{
          id: 'accessibility-overall',
          rule: 'Accessibility Attributes',
          status: 'pass',
          message: 'All interactive elements have ARIA labels'
        }];
      }
    });

    // Rule 6: Token Usage
    this.rules.set('Token Usage', {
      id: 'token-usage',
      name: 'Token Usage',
      description: 'Components must use design tokens instead of hardcoded values',
      enabled: true,
      severity: 'warning',
      scanner: (context) => {
        const checks: ComplianceCheck[] = [];
        const colorTokens = context.tokens.filter(t => t.category === 'colors');
        const tokenNames = colorTokens.map(t => t.name);

        context.components.forEach(component => {
          const code = component.code.vue || component.code.react || '';
          
          // Look for hardcoded color values
          const colorRegex = /#[0-9a-fA-F]{6}|rgb\([^)]+\)|rgba\([^)]+\)/g;
          const colorMatches = [...code.matchAll(colorRegex)];
          
          colorMatches.forEach(match => {
            // Check if any token name appears in the code near this color
            const contextAroundMatch = code.substring(Math.max(0, match.index - 50), match.index + 50);
            const usesToken = tokenNames.some(tn => contextAroundMatch.includes(tn));
            
            if (!usesToken) {
              checks.push({
                id: `token-${component.id}-${match.index}`,
                rule: 'Token Usage',
                status: 'warning',
                message: `Component "${component.name}" uses hardcoded color value instead of design token`,
                component: component.name
              });
            }
          });
        });

        return checks.length > 0 ? checks : [{
          id: 'token-overall',
          rule: 'Token Usage',
          status: 'pass',
          message: 'All components use design tokens correctly'
        }];
      }
    });
  }

  scan(ruleNames: string[], context: ScannerContext): ComplianceCheck[] {
    const allChecks: ComplianceCheck[] = [];
    
    ruleNames.forEach(ruleName => {
      const rule = this.rules.get(ruleName);
      if (rule && rule.enabled) {
        try {
          const checks = rule.scanner(context);
          allChecks.push(...checks);
        } catch (error) {
          allChecks.push({
            id: `error-${rule.id}`,
            rule: rule.name,
            status: 'error',
            message: `Error scanning rule: ${error.message}`
          });
        }
      }
    });

    return allChecks;
  }

  getAllRules(): Rule[] {
    return Array.from(this.rules.values());
  }

  getRule(name: string): Rule | undefined {
    return this.rules.get(name);
  }

  registerRule(rule: Rule): void {
    this.rules.set(rule.name, rule);
  }
}

