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

    it('should handle non-JSON response', async () => {
      mockApiClient.get.mockResolvedValue('not json');

      const result = await getComplianceRules();

      expect(result.rules).toEqual([]);
    });
  });

  describe('scanComponent', () => {
    it('should scan a component for compliance', async () => {
      const mockResult = {
        checks: [{ id: 'check1', rule: 'rule1', status: 'pass' as const, message: 'OK' }],
        summary: { total: 1, pass: 1, warning: 0, error: 0 },
      };

      mockApiClient.post.mockResolvedValue(mockResult);

      const result = await scanComponent({ componentId: 'button' });

      expect(result).toEqual(mockResult);
      expect(mockApiClient.post).toHaveBeenCalledWith('/compliance/scan', { componentId: 'button' }, 'compliance');
    });
  });

  describe('exportRules', () => {
    it('should export rules', async () => {
      const mockRules = 'exported rules';
      mockApiClient.get.mockResolvedValue(mockRules);

      const result = await exportRules({});

      expect(result).toBe(mockRules);
    });
  });
});


