import { getComplianceRules, scanComponent, exportRules } from '../../../src/tools/compliance.tool';
import { apiClient } from '../../../src/api-client';

jest.mock('../../../src/api-client');
jest.mock('../../../src/cache', () => ({
  cache: {
    get: jest.fn(() => undefined),
    set: jest.fn(),
    isEnabled: jest.fn(() => false),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Compliance Tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getComplianceRules', () => {
    it('should retrieve compliance rules', async () => {
      const mockRules = [{ id: 'rule1', name: 'Rule 1', description: 'Test rule', enabled: true, severity: 'error' as const }];
      mockApiClient.get.mockResolvedValue(JSON.stringify(mockRules));

      const result = await getComplianceRules();

      expect(result.rules).toEqual(mockRules);
    });

    it('should read rules from the object the backend returns', async () => {
      const exported = {
        rules: [{ name: 'Color Contrast WCAG AA', category: 'accessibility', enabled: true, description: 'Rule: Color Contrast WCAG AA (accessibility)' }],
        version: '1.0.0',
        exportedAt: '2024-01-01T00:00:00.000Z',
      };
      mockApiClient.get.mockResolvedValue(exported);

      const result = await getComplianceRules();

      expect(result.rules).toEqual(exported.rules);
      expect(mockApiClient.get).toHaveBeenCalledWith('/rules/export', undefined, 'compliance');
    });

    it('should handle non-JSON response', async () => {
      mockApiClient.get.mockResolvedValue('not json');

      const result = await getComplianceRules();

      expect(result.rules).toEqual([]);
    });
  });

  describe('scanComponent', () => {
    it('should scan the design system and keep only checks for the component', async () => {
      mockApiClient.get.mockResolvedValue({ id: 'button', name: 'Button' });
      mockApiClient.post.mockResolvedValue({
        scope: 'design-system',
        passed: 1,
        warnings: 1,
        failed: 0,
        checks: [
          { id: 'check1', rule: 'rule1', status: 'pass', message: 'OK', component: 'Button' },
          { id: 'check2', rule: 'rule1', status: 'warning', message: 'Hmm', component: 'Card' },
        ],
      });

      const result = await scanComponent({ componentId: 'button' });

      expect(result).toEqual({
        checks: [{ id: 'check1', rule: 'rule1', status: 'pass', message: 'OK', component: 'Button' }],
        summary: { total: 1, pass: 1, warning: 0, error: 0 },
      });
      expect(mockApiClient.get).toHaveBeenCalledWith('/components/button', { id: 'button' }, 'components');
      // The backend requires a scope and has no per-component scan
      expect(mockApiClient.post).toHaveBeenCalledWith('/compliance/scan', { scope: 'design-system' });
    });
  });

  describe('exportRules', () => {
    it('should export rules', async () => {
      const mockRules = 'exported rules';
      mockApiClient.get.mockResolvedValue(mockRules);

      const result = await exportRules({});

      expect(result).toBe(mockRules);
    });

    it('should stringify the object the backend returns', async () => {
      const exported = { rules: [{ name: 'rule-1', severity: 'warn' }], meta: {} };
      mockApiClient.get.mockResolvedValue(exported);

      const result = await exportRules({ format: 'eslint' });

      expect(typeof result).toBe('string');
      expect(JSON.parse(result)).toEqual(exported);
      expect(mockApiClient.get).toHaveBeenCalledWith('/rules/export', { format: 'eslint' }, 'compliance');
    });
  });
});


