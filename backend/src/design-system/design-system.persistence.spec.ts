import { ConflictException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { designSystemComponentSource } from '../workspaces/workspaces.module';
import { AnalyticsService } from '../analytics/analytics.service';
import { ComponentIssueService } from './component-issue.service';
import { SEED_COMPONENTS, SEED_TOKENS } from './design-system-seed';
import { DesignSystemService } from './design-system.service';
import { DesignSystemStores, createDesignSystemService, createDesignSystemStores } from './testing/in-memory-stores';

/**
 * Two service instances over the same stores stand for one server before and
 * after a restart: whatever the first wrote, the second must read back.
 */
describe('DesignSystemService storage', () => {
  let stores: DesignSystemStores;
  let first: DesignSystemService;
  const restart = () => createDesignSystemService(stores);

  beforeEach(async () => {
    stores = createDesignSystemStores();
    first = await restart();
  });

  describe('seeding the starting content', () => {
    it('stores the starting components and tokens in their original order', async () => {
      expect(stores.components.docs.size).toBe(SEED_COMPONENTS.length);
      expect(stores.tokens.docs.size).toBe(SEED_TOKENS.length);
      expect(first.getAllComponents().map((c) => c.id)).toEqual(SEED_COMPONENTS.map((c) => c.id));
      expect(first.getAllTokens().map((t) => t.name)).toEqual(SEED_TOKENS.map((t) => t.name));
      // Storage fields stay inside the service
      expect(first.getComponentById('button')).not.toHaveProperty('position');
      expect(first.getTokenByName('spacing.md')).toEqual(SEED_TOKENS.find((t) => t.name === 'spacing.md'));
    });

    it('runs once: a component deleted after seeding stays deleted', async () => {
      await stores.components.delete('button');
      await stores.tokens.delete('color.primary');
      const second = await restart();
      expect(second.getComponentById('button')).toBeUndefined();
      expect(second.getTokenByName('color.primary')).toBeUndefined();
      expect(second.getAllComponents()).toHaveLength(SEED_COMPONENTS.length - 1);
    });

    it('leaves indexes that already hold content alone', async () => {
      const fresh = createDesignSystemStores();
      await fresh.components.create({ ...structuredClone(SEED_COMPONENTS[0]), id: 'only-one', position: 0, createdAt: new Date().toISOString() });
      const service = await createDesignSystemService(fresh);
      expect(service.getAllComponents().map((c) => c.id)).toEqual(['only-one']);
      expect(service.getAllTokens()).toEqual([]);
      expect(await fresh.meta.get('starting-content-seeded-v1')).not.toBeNull();
    });

    it('finishes a seed that was cut short', async () => {
      const fresh = createDesignSystemStores();
      let writes = 0;
      const create = fresh.components.create.bind(fresh.components);
      fresh.components.create = async (doc) => {
        if (++writes === 3) throw new ServiceUnavailableException('Storage is unavailable');
        return create(doc);
      };
      const interrupted = await createDesignSystemService(fresh);
      expect(() => interrupted.getAllComponents()).toThrow(ServiceUnavailableException);
      expect(fresh.components.docs.size).toBe(2);

      fresh.components.create = create;
      const service = await createDesignSystemService(fresh);
      expect(service.getAllComponents().map((c) => c.id)).toEqual(SEED_COMPONENTS.map((c) => c.id));
      expect(service.getAllTokens()).toHaveLength(SEED_TOKENS.length);
    });
  });

  it('answers 503 until storage can be read, then loads on the next request', async () => {
    const fresh = createDesignSystemStores();
    const list = fresh.components.list.bind(fresh.components);
    fresh.components.list = async () => {
      throw new ServiceUnavailableException('Storage is unavailable');
    };
    const service = await createDesignSystemService(fresh);
    expect(() => service.getAllComponents()).toThrow(ServiceUnavailableException);
    expect(() => service.getTokenByName('spacing.md')).toThrow(ServiceUnavailableException);

    fresh.components.list = list;
    await service.ready();
    expect(service.getAllComponents().length).toBe(SEED_COMPONENTS.length);
  });

  it('keeps created components and their lifecycle changes across a restart', async () => {
    await first.createComponent({ id: 'status-pill', name: 'StatusPill', description: 'Shows a status', status: 'planned', workspaceId: 'ws_alpha' });
    await first.saveComponentVariant('status-pill', { name: 'compact', properties: { padding: '2' } });
    await first.saveComponentVariant('button', { name: 'ghost', properties: {} });
    await first.setComponentDependencies('status-pill', ['button'], new Set(['button']), 'usr_ann');
    await first.deprecateComponent('card', { replacement: 'status-pill', reason: 'Replaced' }, new Set(['status-pill']), 'usr_ann');
    await first.setComponentSharing('status-pill', { sharedWith: ['ws_beta'], isGlobal: false });
    await expect(first.createComponent({ id: 'status-pill', name: 'Again', description: 'x' })).rejects.toBeInstanceOf(ConflictException);

    const second = await restart();
    expect(second.getAllComponents().map((c) => c.id).slice(-1)).toEqual(['status-pill']);
    expect(second.getComponentById('status-pill')).toMatchObject({
      status: 'planned',
      workspaceId: 'ws_alpha',
      sharedWith: ['ws_beta'],
      dependencies: ['button'],
      updatedBy: 'usr_ann',
    });
    expect(second.getComponentVariants('status-pill').map((v) => v.name)).toEqual(['compact']);
    expect(second.getComponentVariants('button').map((v) => v.name)).toContain('ghost');
    expect(second.getComponentById('button')!.props.find((p) => p.name === 'variant')!.options).toContain('ghost');
    expect(second.getComponentById('card')).toMatchObject({ status: 'deprecated', deprecation: { replacement: 'status-pill', deprecatedBy: 'usr_ann' } });

    expect(await second.deleteComponentVariant('status-pill', 'compact')).toBe(true);
    expect(await second.deleteComponentVariant('status-pill', 'compact')).toBe(false);
    expect((await restart()).getComponentVariants('status-pill')).toEqual([]);
  });

  it('keeps reads correct after each write without another load', async () => {
    await first.setComponentStatus('input', 'in-progress', 'usr_ann');
    expect(first.getComponentById('input')!.status).toBe('in-progress');
    expect(first.getAllComponents('in-progress').map((c) => c.id)).toContain('input');
    // A caller changing what it read changes nothing stored
    first.getComponentById('input')!.status = 'deprecated';
    first.getAllComponents()[0].name = 'Renamed';
    expect(first.getComponentById('input')!.status).toBe('in-progress');
    expect(first.getAllComponents()[0].name).toBe(SEED_COMPONENTS[0].name);
  });

  it('stores workspace sharing changed through the workspaces module', async () => {
    await first.createComponent({ id: 'alpha-thing', name: 'AlphaThing', description: 'x', workspaceId: 'ws_alpha' });
    const source = designSystemComponentSource(first, { getComponentUsage: () => [] } as unknown as AnalyticsService);
    expect(await source.setSharing('alpha-thing', { sharedWith: ['ws_beta'], isGlobal: false })).toMatchObject({ sharedWith: ['ws_beta'] });
    expect(await source.setSharing('no-such-thing', { sharedWith: [], isGlobal: true })).toBeUndefined();
    expect((await restart()).getComponentById('alpha-thing')).toMatchObject({ sharedWith: ['ws_beta'], isGlobal: false });

    await source.setSharing('alpha-thing', { sharedWith: ['ws_beta'], isGlobal: true });
    const global = (await restart()).getComponentById('alpha-thing')!;
    expect(global.isGlobal).toBe(true);
    expect(global.sharedWith).toBeUndefined();
  });

  it('keeps roadmap items, banners and performance budgets across a restart', async () => {
    expect(await first.getRoadmap()).toEqual([]);
    const item = await first.createRoadmapItem({ title: 'Dark mode', description: 'All components', category: 'feature', priority: 'high' });
    await first.updateRoadmapItem(item.id, { status: 'in-progress', ...({ votes: 99 } as object) });
    const banner = await first.createBanner({ title: 'Maintenance', message: 'Tonight', type: 'warning', expiresAt: '2099-01-01' });
    const expired = await first.createBanner({ title: 'Old', message: 'Gone', type: 'info', expiresAt: '2000-01-01' });
    const budget = await first.createPerformanceBudget('Bundle', 'bundle-size', 100, 'kb', 80);
    await first.updatePerformanceBudget(budget.id, { enabled: false });

    const second = await restart();
    expect(await second.getRoadmap()).toEqual([expect.objectContaining({ id: item.id, status: 'in-progress', votes: 0 })]);
    expect((await second.getAllBanners()).map((b) => b.id)).toEqual([banner.id, expired.id]);
    expect((await second.getActiveBanners()).map((b) => b.id)).toEqual([banner.id]);
    expect(await second.getBanner(banner.id)).toMatchObject({ expiresAt: '2099-01-01T00:00:00.000Z' });
    expect(await second.getPerformanceBudgets()).toEqual([expect.objectContaining({ id: budget.id, enabled: false, alertThreshold: 80 })]);

    await second.updateBanner(banner.id, { expiresAt: '' });
    expect(await second.getBanner(banner.id)).not.toHaveProperty('expiresAt');
    expect(await second.deleteRoadmapItem(item.id)).toBe(true);
    expect(await second.deletePerformanceBudget(budget.id)).toBe(true);
    expect(await second.deleteBanner(expired.id)).toBe(true);

    const third = await restart();
    expect(await third.getRoadmap()).toEqual([]);
    expect(await third.getPerformanceBudgets()).toEqual([]);
    expect((await third.getAllBanners()).map((b) => b.id)).toEqual([banner.id]);
    await expect(third.updateRoadmapItem(item.id, { title: 'x' })).rejects.toBeInstanceOf(NotFoundException);
    await expect(third.getBanner('banner-missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('keeps issues across a restart', async () => {
    const issues = new ComponentIssueService(stores.issues);
    const issue = await issues.create({ title: 'Focus ring', description: 'x', category: 'bug', severity: 'high', reportedBy: 'usr_ann', componentId: 'button' });
    await issues.update(issue.id, { status: 'resolved' });
    const restarted = new ComponentIssueService(stores.issues);
    expect(await restarted.get(issue.id)).toMatchObject({ status: 'resolved', reportedBy: 'usr_ann' });
    expect((await restarted.list({ componentId: 'button', status: 'resolved' })).map((i) => i.id)).toEqual([issue.id]);
    expect(await restarted.list({ status: 'open' })).toEqual([]);
  });
});
