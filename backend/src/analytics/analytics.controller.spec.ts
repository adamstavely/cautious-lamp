import { BadRequestException } from '@nestjs/common';
import { AuthPrincipal } from '../auth/principal';
import { AnalyticsController } from './analytics.controller';

const outsider = { type: 'user', id: 'usr_out', email: 'out@example.com', name: 'Out', roles: [], permissions: new Set(), mustChangePassword: false } as unknown as AuthPrincipal;
const visible = [{ id: 'button', name: 'Button' }];

describe('AnalyticsController', () => {
  const analytics = {
    getComponentPopularity: jest.fn(async () => []),
    getApplicationAdoption: jest.fn(async () => []),
    getCrossApplicationComparison: jest.fn(async () => []),
    getDesignDebtMetrics: jest.fn(() => ({})),
    getComponentUsageAnalytics: jest.fn(() => ({})),
  };
  const access = {
    list: jest.fn(async () => visible),
    get: jest.fn(async (_p: AuthPrincipal, id: string) => {
      if (id !== 'button') throw new BadRequestException(`Component '${id}' not found`);
      return visible[0];
    }),
  };
  const controller = new AnalyticsController(analytics as any, access as any);

  it('computes every component report from the components the caller can read', async () => {
    await controller.getComponentPopularity(outsider, '30d');
    await controller.getApplicationAdoption(outsider);
    await controller.getCrossApplicationComparison(outsider, 'app_1,app_2');
    await controller.getDesignDebtMetrics(outsider);
    expect(access.list).toHaveBeenCalledTimes(4);
    expect(access.list).toHaveBeenCalledWith(outsider);
    expect(analytics.getComponentPopularity).toHaveBeenCalledWith('30d', visible);
    expect(analytics.getApplicationAdoption).toHaveBeenCalledWith(visible);
    expect(analytics.getCrossApplicationComparison).toHaveBeenCalledWith(['app_1', 'app_2'], visible);
    expect(analytics.getDesignDebtMetrics).toHaveBeenCalledWith(visible);
  });

  it("answers a hidden component's usage like a missing one", async () => {
    await expect(controller.getComponentUsage(outsider, 'secret-card')).rejects.toBeInstanceOf(BadRequestException);
    expect(analytics.getComponentUsageAnalytics).not.toHaveBeenCalled();
    await controller.getComponentUsage(outsider, 'button');
    expect(analytics.getComponentUsageAnalytics).toHaveBeenCalledWith('button', 'all');
  });
});
