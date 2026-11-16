import { DesignSystemService, heuristicOverallScore, rawTlxScore } from './design-system.service';
import { createDesignSystemStores } from './testing/in-memory-stores';

/** A service whose survey answers go to a fake Elasticsearch that records each write */
function serviceWithSurveyStorage() {
  const stores = createDesignSystemStores();
  const writes: Array<{ index: string; document: any }> = [];
  const elasticsearch = {
    index: jest.fn(async ({ index, document }: { index: string; document: any }) => {
      writes.push({ index, document });
      return { _id: `doc-${writes.length}` };
    }),
  };
  const service = new DesignSystemService(
    stores.components, stores.tokens, stores.meta, stores.roadmap, stores.banners, stores.budgets,
    elasticsearch as any,
  );
  return { service, writes };
}

const heuristics = (severity: number) =>
  Array.from({ length: 10 }, (_, i) => ({ heuristic: `H${i + 1}`, issues: severity > 0 ? 'An issue' : '', severity }));

describe('heuristic evaluation score', () => {
  it('maps average severity 0-4 onto 10-0', () => {
    expect(heuristicOverallScore([0, 0, 0])).toBe(10);
    expect(heuristicOverallScore([4, 4, 4])).toBe(0);
    expect(heuristicOverallScore([2, 2])).toBe(5);
    expect(heuristicOverallScore([1, 2])).toBe(6.3); // 10 - 1.5 * 2.5 = 6.25
  });

  it('stores the same score the page shows: all Critical is 0/10', async () => {
    const { service, writes } = serviceWithSurveyStorage();
    const result = await service.submitHeuristicEvaluation({
      systemName: 'Portal', evaluator: 'Ada', heuristics: heuristics(4), overallAssessment: '', timestamp: '',
    });
    expect(result.overallScore).toBe(0);
    expect(result.criticalIssues).toBe(10);
    expect(writes[0].index).toBe('heuristic-evaluations');
    expect(writes[0].document.overallScore).toBe(0);
  });

  it('stores 10/10 when nothing was found', async () => {
    const { service } = serviceWithSurveyStorage();
    const result = await service.submitHeuristicEvaluation({
      systemName: 'Portal', evaluator: 'Ada', heuristics: heuristics(0), overallAssessment: '', timestamp: '',
    });
    expect(result.overallScore).toBe(10);
  });
});

describe('NASA-TLX raw score', () => {
  const ratings = { mentalDemand: 80, physicalDemand: 10, temporalDemand: 60, performance: 30, effort: 70, frustration: 50 };

  it('is the unweighted mean of the six ratings', () => {
    expect(rawTlxScore(ratings)).toBe(50);
    expect(rawTlxScore({ ...ratings, frustration: 51 })).toBe(50.2);
  });

  it('is computed server-side, stored and returned', async () => {
    const { service, writes } = serviceWithSurveyStorage();
    const result = await service.submitNASATLX({ systemName: 'Portal', task: 'Checkout', user: 'ada', ...ratings });
    expect(result.rawTlx).toBe(50);
    expect(result.id).toBe('doc-1');
    expect(writes[0].index).toBe('nasa-tlx');
    expect(writes[0].document.rawTlx).toBe(50);
  });
});
