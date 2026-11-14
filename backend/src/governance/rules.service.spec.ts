import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { BUILTIN_RULES } from './builtin-rules';
import { MetaDoc } from './governance-stores';
import { GovernanceRule } from './governance.types';
import { RulesService } from './rules.service';

/** A rule store whose writes fail on chosen calls, like Elasticsearch going away mid-seed */
class FlakyStore extends InMemoryStore<GovernanceRule> {
  creates = 0;
  failOn = new Set<number>();

  async create(doc: GovernanceRule): Promise<void> {
    this.creates++;
    if (this.failOn.has(this.creates)) throw new Error('Elasticsearch unavailable');
    return super.create(doc);
  }
}

describe('RulesService seeding', () => {
  it('resumes an interrupted seed and only marks it complete when every rule exists', async () => {
    const rules = new FlakyStore();
    const meta = new InMemoryStore<MetaDoc>();
    rules.failOn.add(2);
    const service = new RulesService(rules, meta);

    await expect(service.ensureSeeded()).rejects.toThrow(/unavailable/);
    expect(rules.docs.size).toBe(1);
    expect(meta.docs.has('builtin-rules-seeded-v1')).toBe(false);

    // A later start (or request) carries on and finishes
    await service.ensureSeeded();
    expect(rules.docs.size).toBe(BUILTIN_RULES.length);
    expect(meta.docs.has('builtin-rules-seeded-v1')).toBe(true);
    expect((await service.list()).map((r) => r.id).sort()).toEqual(BUILTIN_RULES.map((r) => r.id).sort());
  });

  it('survives a failure between creating a rule and recording it', async () => {
    const rules = new InMemoryStore<GovernanceRule>();
    const meta = new InMemoryStore<MetaDoc>();
    let metaCreates = 0;
    const create = meta.create.bind(meta);
    meta.create = async (doc) => {
      if (++metaCreates === 3) throw new Error('Elasticsearch unavailable');
      return create(doc);
    };
    const service = new RulesService(rules, meta);
    await expect(service.ensureSeeded()).rejects.toThrow();
    await new RulesService(rules, meta).ensureSeeded();
    expect(rules.docs.size).toBe(BUILTIN_RULES.length);
    expect(meta.docs.has('builtin-rules-seeded-v1')).toBe(true);
  });

  it('does not bring back a deleted built-in when an interrupted seed resumes', async () => {
    const rules = new FlakyStore();
    const meta = new InMemoryStore<MetaDoc>();
    rules.failOn.add(5);
    const service = new RulesService(rules, meta);
    await expect(service.ensureSeeded()).rejects.toThrow();

    // An admin deletes one of the rules that was already seeded, then the seed resumes
    const deletedId = BUILTIN_RULES[0].id;
    await service.delete(deletedId);
    await service.ensureSeeded();
    expect(rules.docs.has(deletedId)).toBe(false);
    expect(rules.docs.size).toBe(BUILTIN_RULES.length - 1);

    // And a fresh instance on the same cluster doesn't either
    await new RulesService(rules, meta).ensureSeeded();
    expect(rules.docs.has(deletedId)).toBe(false);
  });
});
