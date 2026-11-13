import { NotFoundException } from '@nestjs/common';
import { DesignSystemService } from './design-system.service';

describe('DesignSystemService.calculateTestCoverage', () => {
  const service = new DesignSystemService();

  it('reports no coverage data, and the testable surface from real props', () => {
    service.createComponent({
      id: 'coverage-fixture',
      name: 'Coverage Fixture',
      description: 'fixture',
      props: [
        { name: 'size', type: 'string', options: ['sm', 'md', 'lg'] },
        { name: 'disabled', type: 'boolean', required: true },
        { name: 'label', type: 'string' },
        { name: 'onSelect', type: 'function' },
      ],
    });

    const coverage = service.calculateTestCoverage('coverage-fixture');
    expect(coverage.available).toBe(false);
    expect(coverage.statements).toBeNull();
    expect(coverage.branches).toBeNull();
    expect(coverage.functions).toBeNull();
    expect(coverage.lines).toBeNull();
    expect(coverage.reason).toMatch(/no test runs/i);
    expect(coverage.surface).toEqual({
      props: 4,
      requiredProps: 1,
      booleanProps: 1,
      enumProps: 1,
      enumOptions: 3,
      functionProps: 1,
      // 4 props + 2 extra enum options + 1 boolean false state
      suggestedTestCases: 7,
    });
  });

  it('is deterministic for a built-in component', () => {
    expect(service.calculateTestCoverage('button')).toEqual(service.calculateTestCoverage('button'));
  });

  it('throws NotFound for an unknown component', () => {
    expect(() => service.calculateTestCoverage('nope')).toThrow(NotFoundException);
  });
});
