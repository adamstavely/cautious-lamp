import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { DEFAULT_RETENTION_DAYS, DeliveryRetentionJob, esAttemptPruner, retentionDays } from './delivery-retention';
import { DELIVERY_ATTEMPTS_INDEX, DeliveryAttempt, DeliveryAttemptPruner, DeliveryMetaDoc } from './delivery.types';

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-11-15T03:00:00.000Z');

const attempt = (id: string, daysOld: number): DeliveryAttempt => {
  const at = new Date(NOW.getTime() - daysOld * DAY).toISOString();
  return {
    id,
    owner: 'user:usr_1',
    ownerKind: 'user',
    ownerId: 'usr_1',
    channel: 'email',
    target: 'a@example.com',
    event: 'design-system-change',
    title: 't',
    test: false,
    status: 'sent',
    tries: [],
    createdAt: at,
    finishedAt: at,
  };
};

/** The pruner over an in-memory attempts store, as the Elasticsearch one is over the index */
const memoryPruner = (attempts: InMemoryStore<DeliveryAttempt>): DeliveryAttemptPruner & { calls: number } => ({
  calls: 0,
  async deleteCreatedBefore(cutoff) {
    this.calls++;
    let deleted = 0;
    for (const doc of await attempts.list()) {
      if (doc.createdAt < cutoff && (await attempts.delete(doc.id))) deleted++;
    }
    return deleted;
  },
});

describe('DeliveryRetentionJob', () => {
  const saved = { ...process.env };
  let attempts: InMemoryStore<DeliveryAttempt>;
  let meta: InMemoryStore<DeliveryMetaDoc>;
  let pruner: ReturnType<typeof memoryPruner>;

  beforeEach(async () => {
    delete process.env.DELIVERY_ATTEMPT_RETENTION_DAYS;
    attempts = new InMemoryStore<DeliveryAttempt>();
    meta = new InMemoryStore<DeliveryMetaDoc>();
    pruner = memoryPruner(attempts);
    for (const [id, days] of [['a_new', 1], ['a_89', 89], ['a_91', 91], ['a_old', 400]] as const) await attempts.create(attempt(id, days));
  });

  afterEach(() => {
    process.env = { ...saved };
  });

  const ids = async () => (await attempts.list()).map((a) => a.id).sort();

  it('deletes attempts older than 90 days and keeps the rest', async () => {
    const job = new DeliveryRetentionJob(meta, pruner);
    expect(await job.runIfDue(NOW)).toBe(2);
    expect(await ids()).toEqual(['a_89', 'a_new']);
    expect(await job.status()).toMatchObject({ period: '2026-11-15', state: 'completed', lastDeleted: 2, lastCutoff: '2026-08-17T03:00:00.000Z' });
    expect(await job.status()).not.toHaveProperty('token');
  });

  it('takes the retention period from DELIVERY_ATTEMPT_RETENTION_DAYS', async () => {
    process.env.DELIVERY_ATTEMPT_RETENTION_DAYS = '30';
    expect(retentionDays()).toBe(30);
    await new DeliveryRetentionJob(meta, pruner).runIfDue(NOW);
    expect(await ids()).toEqual(['a_new']);
    expect(retentionDays({ DELIVERY_ATTEMPT_RETENTION_DAYS: 'soon' })).toBe(DEFAULT_RETENTION_DAYS);
    expect(retentionDays({ DELIVERY_ATTEMPT_RETENTION_DAYS: '0' })).toBe(DEFAULT_RETENTION_DAYS);
  });

  it('runs once a day however many replicas there are', async () => {
    const replicas = [new DeliveryRetentionJob(meta, pruner), new DeliveryRetentionJob(meta, pruner), new DeliveryRetentionJob(meta, pruner)];
    const results = await Promise.all(replicas.map((job) => job.runIfDue(NOW)));
    expect(results.filter((r) => r !== null)).toHaveLength(1);
    expect(pruner.calls).toBe(1);

    // Later the same day: nothing to do; the next day: runs again
    expect(await replicas[1].runIfDue(new Date(NOW.getTime() + 3 * 60 * 60 * 1000))).toBeNull();
    expect(await replicas[2].runIfDue(new Date(NOW.getTime() + DAY))).toBe(0);
    expect(pruner.calls).toBe(2);
  });

  it('leaves a live claim alone and takes over one whose lease ran out', async () => {
    const job = new DeliveryRetentionJob(meta, pruner);
    // Another replica claimed today's run and died
    await meta.create({
      id: 'attempt-retention',
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
      period: '2026-11-15',
      state: 'claimed',
      token: 'theirs',
      leaseUntil: new Date(NOW.getTime() + 5 * 60_000).toISOString(),
    });
    expect(await job.runIfDue(NOW)).toBeNull();
    expect(await job.runIfDue(new Date(NOW.getTime() + 6 * 60_000))).toBe(2);
    expect(await job.status()).toMatchObject({ state: 'completed' });
  });

  it('records a failure and tries again on the next pass', async () => {
    const failing: DeliveryAttemptPruner = { deleteCreatedBefore: jest.fn().mockRejectedValueOnce(new Error('cluster busy')).mockResolvedValue(2) };
    const job = new DeliveryRetentionJob(meta, failing);
    await job.tick(NOW);
    expect(await job.status()).toMatchObject({ state: 'failed', lastError: 'cluster busy' });
    expect(await job.runIfDue(NOW)).toBe(2);
    expect(await job.status()).toMatchObject({ state: 'completed', lastDeleted: 2 });
    expect(await job.status()).not.toHaveProperty('lastError');
  });
});

describe('esAttemptPruner', () => {
  it('deletes by a createdAt range on the attempts index, and treats a missing index as nothing to delete', async () => {
    const es = { deleteByQuery: jest.fn().mockResolvedValue({ deleted: 7 }) };
    expect(await esAttemptPruner(es as any).deleteCreatedBefore('2026-08-17T03:00:00.000Z')).toBe(7);
    expect(es.deleteByQuery).toHaveBeenCalledWith(
      expect.objectContaining({ index: DELIVERY_ATTEMPTS_INDEX, query: { range: { createdAt: { lt: '2026-08-17T03:00:00.000Z' } } } }),
    );

    es.deleteByQuery.mockRejectedValueOnce(Object.assign(new Error('no index'), { meta: { statusCode: 404 } }));
    expect(await esAttemptPruner(es as any).deleteCreatedBefore('2026-08-17T03:00:00.000Z')).toBe(0);
  });
});
