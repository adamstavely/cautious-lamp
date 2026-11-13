import { BadRequestException } from '@nestjs/common';
import { JSDOM } from 'jsdom';
import { BUILTIN_CHECKS, LIMITS, RULE_CATEGORIES, RULE_SEVERITIES, RULE_TARGETS, RULE_TYPES, RuleDefinition, RuleTarget, RuleType } from './governance.types';
import { UnsafePatternError, assertSafePattern } from './regex-safety';

/** Which targets each rule type can run on */
export const TARGETS_BY_TYPE: Record<RuleType, RuleTarget[]> = {
  'regex-present': ['html', 'css', 'javascript'],
  'regex-absent': ['html', 'css', 'javascript'],
  'selector-attribute': ['html'],
  'selector-count': ['html'],
  'token-usage': ['css'],
  builtin: ['html'],
};

const ATTRIBUTE_NAME = /^[a-zA-Z_:][-a-zA-Z0-9_:.]{0,63}$/;
const CSS_PROPERTY = /^-?[a-z][a-z0-9-]{0,59}\*?$/;

let selectorDocument: Document | null = null;

/** Throws if jsdom can't parse the selector */
function assertValidSelector(selector: string): void {
  selectorDocument ??= new JSDOM('<!doctype html><html><body></body></html>').window.document;
  try {
    selectorDocument.querySelectorAll(selector);
  } catch {
    throw new BadRequestException(`Invalid CSS selector: ${selector}`);
  }
}

const isInt = (value: unknown) => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 10000;

/**
 * Checks a rule definition and returns it with only the fields its type uses.
 * The DTOs reject unknown fields and wrong types; this checks what depends on
 * the rule type (and is also used for imported rules and the built-in seed).
 */
export function normalizeRuleDefinition(input: RuleDefinition): RuleDefinition {
  const fail = (message: string): never => {
    throw new BadRequestException(message);
  };
  if (!(RULE_TYPES as readonly string[]).includes(input.type)) fail(`Unknown rule type "${input.type}"`);
  if (!(RULE_TARGETS as readonly string[]).includes(input.target)) fail(`Unknown target "${input.target}"`);
  if (!(RULE_CATEGORIES as readonly string[]).includes(input.category)) fail(`Unknown category "${input.category}"`);
  if (!(RULE_SEVERITIES as readonly string[]).includes(input.severity)) fail(`Unknown severity "${input.severity}"`);
  const name = String(input.name ?? '').trim();
  if (!name || name.length > LIMITS.name) fail(`Name is required (at most ${LIMITS.name} characters)`);
  const message = String(input.message ?? '').trim();
  if (!message || message.length > LIMITS.message) fail(`Message is required (at most ${LIMITS.message} characters)`);
  const description = String(input.description ?? '').trim();
  if (description.length > LIMITS.description) fail(`Description is longer than ${LIMITS.description} characters`);
  if (!TARGETS_BY_TYPE[input.type].includes(input.target)) {
    fail(`A ${input.type} rule can only target ${TARGETS_BY_TYPE[input.type].join(' or ')}`);
  }

  const out: RuleDefinition = {
    name,
    description,
    category: input.category,
    severity: input.severity,
    enabled: input.enabled !== false,
    type: input.type,
    target: input.target,
    message,
  };

  const checkPattern = (required: boolean) => {
    if (input.pattern === undefined || input.pattern === null || input.pattern === '') {
      if (required) fail('Pattern is required for this rule type');
      return;
    }
    const flags = input.flags ?? '';
    try {
      assertSafePattern(input.pattern, flags);
    } catch (error) {
      if (error instanceof UnsafePatternError) fail(error.message);
      throw error;
    }
    out.pattern = input.pattern;
    if (flags) out.flags = flags;
  };
  const checkSelector = () => {
    const selector = String(input.selector ?? '').trim();
    if (!selector || selector.length > LIMITS.selector) fail(`Selector is required (at most ${LIMITS.selector} characters)`);
    assertValidSelector(selector);
    out.selector = selector;
  };

  switch (input.type) {
    case 'regex-present':
    case 'regex-absent':
      checkPattern(true);
      break;
    case 'selector-attribute': {
      checkSelector();
      const names = String(input.attribute ?? '').split('|').map((n) => n.trim()).filter(Boolean);
      if (names.length === 0 || names.length > 10 || !names.every((n) => ATTRIBUTE_NAME.test(n))) {
        fail('Attribute must be one or more attribute names separated by |');
      }
      out.attribute = names.join('|');
      checkPattern(false);
      break;
    }
    case 'selector-count': {
      checkSelector();
      const hasMin = input.min !== undefined && input.min !== null;
      const hasMax = input.max !== undefined && input.max !== null;
      if (!hasMin && !hasMax) fail('A selector-count rule needs min, max or both');
      if (hasMin && !isInt(input.min)) fail('min must be a whole number from 0 to 10000');
      if (hasMax && !isInt(input.max)) fail('max must be a whole number from 0 to 10000');
      if (hasMin && hasMax && input.min! > input.max!) fail('min must not be greater than max');
      if (hasMin) out.min = input.min;
      if (hasMax) out.max = input.max;
      break;
    }
    case 'token-usage': {
      const properties = (input.properties ?? []).map((p) => String(p).trim().toLowerCase()).filter(Boolean);
      if (properties.length === 0 || properties.length > 30 || !properties.every((p) => CSS_PROPERTY.test(p))) {
        fail('token-usage needs 1 to 30 CSS property names (a trailing * matches a prefix)');
      }
      out.properties = [...new Set(properties)];
      const allowed = (input.allowedValues ?? []).map((v) => String(v).trim()).filter(Boolean);
      if (allowed.length > 100 || allowed.some((v) => v.length > 100)) fail('At most 100 allowed values of up to 100 characters');
      if (allowed.length) out.allowedValues = [...new Set(allowed)];
      break;
    }
    case 'builtin':
      if (!(BUILTIN_CHECKS as readonly string[]).includes(input.builtin as string)) {
        fail(`builtin must be one of: ${BUILTIN_CHECKS.join(', ')}`);
      }
      out.builtin = input.builtin;
      break;
  }
  return out;
}
