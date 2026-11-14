import { BadRequestException } from '@nestjs/common';
import { AuthPrincipal } from '../auth/principal';
import { AnalyticsController } from './analytics.controller';

const outsider = { type: 'user', id: 'usr_out', email: 'out@example.com', name: 'Out', roles: [], permissions: new Set(), mustChangePassword: false } as unknown as AuthPrincipal;
const visible = [{ id: 'button', name: 'Button' }];
const visibleApps = [{ id: 'app_1', name: 'Mine' }];

describe('AnalyticsController', () => {
  const analytics = {
    getComponentPopularity: jest.fn(async () => []),
    getApplicationAdoption: jest.fn(async () => []),
    getCrossApplicationComparison: jest.fn(async () => []),
    getDesignDebtMetrics: jest.fn(() => ({})),
    getComponentUsageAnalytics: jest.fn(() => ({})),
    getUsageTrends: jest.fn(() => []),
    applicationsVisibleTo: jest.fn(async () => visibleApps),
  };
  const access = {
    list: jest.fn(async () => visible),
    get: jest.fn(async (_p: AuthPrincipal, id: string) => {
      if (id !== 'button') throw new BadRequestException(`Component '${id}' not found`);
      return visible[0];
    }),
  };
  const controller = new AnalyticsController(analytics as any, access as any);

  it('computes every report from the components and applications the caller can see', async () => {
    await controller.getComponentPopularity(outsider, '30d');
    await controller.getApplicationAdoption(outsider);
    await controller.getCrossApplicationComparison(outsider, 'app_1,app_2');
    await controller.getDesignDebtMetrics(outsider);
    await controller.getUsageTrends(outsider, '7');
    expect(access.list).toHaveBeenCalledTimes(5);
    expect(access.list).toHaveBeenCalledWith(outsider);
    expect(analytics.applicationsVisibleTo).toHaveBeenCalledTimes(5);
    expect(analytics.applicationsVisibleTo).toHaveBeenCalledWith(outsider);
    expect(analytics.getComponentPopularity).toHaveBeenCalledWith('30d', visible, visibleApps);
    expect(analytics.getApplicationAdoption).toHaveBeenCalledWith(visible, visibleApps);
    expect(analytics.getCrossApplicationComparison).toHaveBeenCalledWith(['app_1', 'app_2'], visible, visibleApps);
    expect(analytics.getDesignDebtMetrics).toHaveBeenCalledWith(visible, visibleApps);
    expect(analytics.getUsageTrends).toHaveBeenCalledWith(7, visible, visibleApps);
  });

  it("answers a hidden component's usage like a missing one", async () => {
    await expect(controller.getComponentUsage(outsider, 'secret-card')).rejects.toBeInstanceOf(BadRequestException);
    expect(analytics.getComponentUsageAnalytics).not.toHaveBeenCalled();
    await controller.getComponentUsage(outsider, 'button');
    expect(analytics.getComponentUsageAnalytics).toHaveBeenCalledWith('button', 'all', visibleApps);
  });
});
