import { NotFoundException } from '@nestjs/common';
import { brotliCompressSync, constants, gzipSync } from 'zlib';
import { analyzeComponentBundle, bundleStatus, measureCode } from './bundle-analysis.service';
import { DesignSystemService } from './design-system.service';

describe('bundle analysis', () => {
  it('measures raw, gzip and brotli sizes of known input', () => {
    const code = 'a'.repeat(1000);
    const sizes = measureCode(code);
    expect(sizes.raw).toBe(1000);
    expect(sizes.gzip).toBe(gzipSync(Buffer.from(code), { level: 9 }).byteLength);
    expect(sizes.brotli).toBe(
      brotliCompressSync(Buffer.from(code), { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).byteLength,
    );
    // Highly repetitive input compresses far below its raw size
    expect(sizes.gzip).toBeLessThan(50);
    expect(measureCode('')).toEqual({ raw: 0, gzip: 0, brotli: 0 });
  });

  it('counts multi-byte characters as UTF-8 bytes', () => {
    expect(measureCode('é').raw).toBe(2);
  });

  it('analyzes a component and its dependencies', () => {
    const components = [
      { id: 'a', name: 'A', code: { vue: 'x'.repeat(100), react: 'y'.repeat(50) }, dependencies: ['b', 'missing'] },
      { id: 'b', name: 'B', code: { vue: 'z'.repeat(30), react: '' } },
    ];
    const result = analyzeComponentBundle(components[0], components);
    expect(result.vueSize).toBe(100);
    expect(result.reactSize).toBe(50);
    expect(result.totalSize).toBe(150);
    expect(result.dependenciesSize).toBe(30);
    expect(result.totalWithDeps).toBe(180);
    expect(result.dependencies).toEqual(['b']);
    expect(result.missingDependencies).toEqual(['missing']);
    expect(result.gzippedSize).toBe(measureCode('x'.repeat(100)).gzip + measureCode('y'.repeat(50)).gzip);
    expect(result.method).toBe('measured-source');

    const withoutDeps = analyzeComponentBundle(components[0], components, false);
    expect(withoutDeps.dependenciesSize).toBe(0);
    expect(withoutDeps.dependencies).toEqual([]);
  });

  it('reports error above the error threshold (not just warning)', () => {
    expect(bundleStatus(10)).toBe('pass');
    expect(bundleStatus(60_000)).toBe('warning');
    expect(bundleStatus(150_000)).toBe('error');
  });

  it('DesignSystemService.analyzeBundle measures the stored color-picker source', () => {
    const service = new DesignSystemService();
    const component = service.getComponentById('color-picker')!;
    const result = service.analyzeBundle('color-picker', true) as ReturnType<typeof analyzeComponentBundle>;
    expect(result.vueSize).toBe(Buffer.byteLength(component.code.vue, 'utf8'));
    expect(result.gzippedSize).toBe(measureCode(component.code.vue).gzip + measureCode(component.code.react).gzip);
    expect(result.gzippedSize).toBeGreaterThan(0);
    expect(result.gzippedSize).toBeLessThan(result.totalSize);
    expect(() => service.analyzeBundle('does-not-exist')).toThrow(NotFoundException);
  });
});
