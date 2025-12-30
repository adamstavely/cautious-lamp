import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { apiClient } from '../api-client';

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: 'info' | 'warning' | 'error';
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

export const getComplianceRulesTool: Tool = {
  name: 'get_compliance_rules',
  description: 'List all compliance rules',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function getComplianceRules(): Promise<{ rules: ComplianceRule[] }> {
  // The backend exports rules, we'll parse them
  const rulesExport = await apiClient.get<string>('/rules/export', undefined, 'compliance');
  
  // Parse the exported rules format (assuming JSON)
  try {
    const rules = JSON.parse(rulesExport);
    return { rules: Array.isArray(rules) ? rules : [] };
  } catch {
    // If it's not JSON, return empty array
    return { rules: [] };
  }
}

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
  const result = await apiClient.post<ComplianceScanResult>('/compliance/scan', {
    componentId: args.componentId,
  }, 'compliance');
  return result;
}

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
  const rules = await apiClient.get<string>('/rules/export', args.format ? { format: args.format } : undefined, 'compliance');
  
  if (args.format === 'eslint') {
    // Convert to ESLint format if needed
    // This is a placeholder - actual conversion would depend on backend format
    return rules;
  }
  
  return rules;
}

