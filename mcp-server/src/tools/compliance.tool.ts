import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { apiClient } from '../api-client';
import { getComponent } from './components.tool';

export interface ComplianceRule {
  id?: string;
  name: string;
  description: string;
  enabled: boolean;
  category?: string;
  severity?: 'info' | 'warning' | 'error' | 'warn';
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

export interface ComplianceScanResult {
  checks: ComplianceCheck[];
  summary: {
    total: number;
    pass: number;
    warning: number;
    error: number;
  };
}

/**
 * Shape returned by `POST /api/v1/compliance/scan` for the design-system scope.
 */
interface BackendScanResult {
  scope: string;
  passed: number;
  warnings: number;
  failed: number;
  checks: ComplianceCheck[];
}

/**
 * `GET /api/v1/rules/export` returns `{ rules: [...], version, exportedAt }` (axios
 * already parses it). Older/alternative shapes (a bare array, or a JSON string)
 * are accepted too.
 */
function extractRules(rulesExport: unknown): ComplianceRule[] {
  let data = rulesExport;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      return [];
    }
  }
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object' && Array.isArray((data as { rules?: unknown }).rules)) {
    return (data as { rules: ComplianceRule[] }).rules;
  }
  return [];
}

export const getComplianceRulesSchema = z.object({});

export const getComplianceRulesTool: Tool = {
  name: 'get_compliance_rules',
  description: 'List all compliance rules',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function getComplianceRules(): Promise<{ rules: ComplianceRule[] }> {
  const rulesExport = await apiClient.get<unknown>('/rules/export', undefined, 'compliance');
  return { rules: extractRules(rulesExport) };
}

export const scanComponentSchema = z.object({
  componentId: z.string().min(1),
});

export const scanComponentTool: Tool = {
  name: 'scan_component',
  description: 'Run compliance scan on a specific component',
  inputSchema: {
    type: 'object',
    properties: {
      componentId: {
        type: 'string',
        description: 'The ID of the component to scan',
      },
    },
    required: ['componentId'],
  },
};

export async function scanComponent(args: { componentId: string }): Promise<ComplianceScanResult> {
  // The backend scans the whole design system (it has no per-component scope)
  // and tags each check with the component's *name*, so resolve the name first
  // and filter the checks down to this component.
  const component = await getComponent({ id: args.componentId });
  const result = await apiClient.post<BackendScanResult>('/compliance/scan', {
    scope: 'design-system',
  });

  const matches = (value?: string) =>
    !!value && (value === component.name || value === component.id || value === args.componentId);
  const checks = (result?.checks || []).filter((check) => matches(check.component));

  return {
    checks,
    summary: {
      total: checks.length,
      pass: checks.filter((c) => c.status === 'pass').length,
      warning: checks.filter((c) => c.status === 'warning').length,
      error: checks.filter((c) => c.status === 'error').length,
    },
  };
}

export const exportRulesSchema = z.object({
  format: z.enum(['json', 'eslint']).optional(),
});

export const exportRulesTool: Tool = {
  name: 'export_rules',
  description: 'Export rules for linter integration',
  inputSchema: {
    type: 'object',
    properties: {
      format: {
        type: 'string',
        enum: ['json', 'eslint'],
        description: 'Export format',
        default: 'json',
      },
    },
  },
};

export async function exportRules(args: { format?: 'json' | 'eslint' }): Promise<string> {
  const rules = await apiClient.get<unknown>('/rules/export', args.format ? { format: args.format } : undefined, 'compliance');

  // The backend returns a JSON object; MCP text content must be a string
  return typeof rules === 'string' ? rules : JSON.stringify(rules, null, 2);
}
