import { ConflictException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { designSystemComponentSource } from '../workspaces/workspaces.module';
import { AnalyticsService } from '../analytics/analytics.service';
import { ComponentIssueService } from './component-issue.service';
import { SEED_COMPONENTS, SEED_TOKENS } from './design-system-seed';
import { CONTENT_CHECK_INTERVAL_MS, DesignSystemService, MAX_COPY_AGE_MS, TokenChangedError } from './design-system.service';
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

  describe('several servers over the same indices', () => {
    let now: number;
    beforeEach(() => {
      now = Date.now();
      jest.spyOn(Date, 'now').mockImplementation(() => now);
    });
    afterEach(() => jest.restoreAllMocks());

    it("sees another server's writes once its copy is due a check", async () => {
      const other = await restart();
      await first.createComponent({ id: 'status-pill', name: 'StatusPill', description: 'Shows a status' });
      await first.setComponentStatus('input', 'deprecated', 'usr_ann');
      // Still inside the interval: the other server answers from its copy
      await other.ready();
      expect(other.getComponentById('status-pill')).toBeUndefined();

      now += CONTENT_CHECK_INTERVAL_MS;
      await other.ready();
      expect(other.getComponentById('status-pill')).toMatchObject({ name: 'StatusPill' });
      expect(other.getComponentById('input')!.status).toBe('deprecated');
    });

    it('catches up from a synchronous read on the next request', async () => {
      const other = await restart();
      await first.saveComponentVariant('button', { name: 'ghost', properties: {} });
      now += CONTENT_CHECK_INTERVAL_MS;
      // This read answers from the copy and starts the check
      expect(other.getComponentVariants('button').map((v) => v.name)).not.toContain('ghost');
      await other.ready();
      expect(other.getComponentVariants('button').map((v) => v.name)).toContain('ghost');
    });

    it("doesn't reload for its own writes, and keeps its copy when the check fails", async () => {
      await first.setComponentStatus('input', 'in-progress', 'usr_ann');
      const list = jest.spyOn(stores.components, 'list');
      now += CONTENT_CHECK_INTERVAL_MS;
      await first.ready();
      expect(list).not.toHaveBeenCalled();

      const other = await restart();
      await other.setComponentStatus('card', 'planned', 'usr_bob');
      const get = jest.spyOn(stores.meta, 'get').mockRejectedValueOnce(new ServiceUnavailableException('Storage is unavailable'));
      now += CONTENT_CHECK_INTERVAL_MS;
      await first.ready();
      expect(first.getComponentById('card')!.status).not.toBe('planned');
      get.mockRestore();
      now += CONTENT_CHECK_INTERVAL_MS;
      await first.ready();
      expect(first.getComponentById('card')!.status).toBe('planned');
    });

    it("sees another server's token creates, updates and deletes once its copy is due a check", async () => {
      const other = await restart();
      const before = other.getTokenByName('color.primary')!.value;
      await first.updateToken('color.primary', { value: '#123456' });
      await first.createToken({ name: 'color.new', value: '#abcdef', type: 'color', category: 'colors' });
      await first.deleteToken('spacing.md');
      await other.ready();
      expect(other.getTokenByName('color.primary')!.value).toBe(before);

      now += CONTENT_CHECK_INTERVAL_MS;
      await other.ready();
      expect(other.getTokenByName('color.primary')!.value).toBe('#123456');
      expect(other.getTokenByName('color.new')).toMatchObject({ value: '#abcdef' });
      expect(other.getTokenByName('spacing.md')).toBeUndefined();
    });

    it('reloads a copy older than MAX_COPY_AGE_MS even when a write never changed the stamp', async () => {
      const other = await restart();
      // As if the writing server stopped between the write and the stamp change
      const stored = (await stores.tokens.get('color.primary'))!.doc;
      stores.tokens.forceWrite({ ...stored, value: '#00ff00' });
      now += CONTENT_CHECK_INTERVAL_MS;
      await other.ready();
      expect(other.getTokenByName('color.primary')!.value).not.toBe('#00ff00');
      now += MAX_COPY_AGE_MS;
      await other.ready();
      expect(other.getTokenByName('color.primary')!.value).toBe('#00ff00');
    });
  });

  describe('conditional token writes', () => {
    it('writes only when the stored value is still the expected one, whatever this copy holds', async () => {
      const other = await restart();
      await other.updateToken('border.radius.sm', { value: '19px' });
      // `first` still holds the old value in its copy; the stored one decides
      await expect(first.updateToken('border.radius.sm', { value: '6px' }, { expectedValue: '0.25rem' })).rejects.toBeInstanceOf(TokenChangedError);
      await expect(first.deleteToken('border.radius.sm', { expectedValue: '0.25rem' })).rejects.toBeInstanceOf(TokenChangedError);
      expect((await stores.tokens.get('border.radius.sm'))!.doc.value).toBe('19px');

      await first.updateToken('border.radius.sm', { value: '6px' }, { expectedValue: '19px' });
      expect((await stores.tokens.get('border.radius.sm'))!.doc.value).toBe('6px');
      expect(await first.deleteToken('border.radius.sm', { expectedValue: '6px' })).toBe(true);
    });

    it('refuses when another write lands between the read and the compare-and-swap', async () => {
      let raced = false;
      stores.tokens.beforeReplace = (doc) => {
        if (raced || doc.id !== 'border.radius.sm') return;
        raced = true;
        stores.tokens.forceWrite({ ...doc, value: '19px' });
      };
      await expect(first.updateToken('border.radius.sm', { value: '6px' }, { expectedValue: '0.25rem' })).rejects.toBeInstanceOf(TokenChangedError);
      expect((await stores.tokens.get('border.radius.sm'))!.doc.value).toBe('19px');
    });
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
