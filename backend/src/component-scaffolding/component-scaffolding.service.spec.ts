import { BadRequestException, ConflictException } from '@nestjs/common';
import { DesignSystemService } from '../design-system/design-system.service';
import { ComponentScaffoldingService, ComponentScaffoldInput } from './component-scaffolding.service';

describe('ComponentScaffoldingService.createComponentFromScaffold', () => {
  let designSystem: DesignSystemService;
  let service: ComponentScaffoldingService;

  const input: ComponentScaffoldInput = {
    name: 'Status Badge',
    description: 'Shows a status',
    category: 'display',
    props: [
      { name: 'tone', type: 'enum', options: ['info', 'success'], defaultValue: 'info', description: 'Colour tone' },
      { name: 'dismissible', type: 'boolean', defaultValue: false },
    ],
    events: [{ name: 'dismissed', detail: 'void' }],
    slots: ['default'],
    styles: { colors: { background: '#eef' } },
    status: 'experimental',
  };

  beforeEach(() => {
    designSystem = new DesignSystemService();
    service = new ComponentScaffoldingService(designSystem);
  });

  it('registers the component and returns the generated files', async () => {
    const before = designSystem.getAllComponents().length;
    const result = await service.createComponentFromScaffold(input);

    expect(result.componentId).toBe('status-badge');
    expect(result.success).toBe(true);

    const registered = designSystem.getComponentById('status-badge');
    expect(registered).toBeDefined();
    expect(registered!.name).toBe('Status Badge');
    expect(registered!.status).toBe('in-progress'); // 'experimental' is not a design-system status
    expect(registered!.props.map(p => p.name)).toEqual(['tone', 'dismissible']);
    expect(registered!.props[0].options).toEqual(['info', 'success']);
    expect(designSystem.getAllComponents().length).toBe(before + 1);

    const paths = result.files.map(f => f.path);
    expect(paths).toEqual([
      'src/components/status-badge/status-badge.tsx',
      'src/components/status-badge/status-badge.css',
      'src/components/status-badge/status-badge.spec.ts',
      'docs/status-badge.md',
      'README.md',
      'stencil.config.ts',
    ]);
    const tsx = result.files.find(f => f.path.endsWith('.tsx'))!.content;
    expect(tsx).toContain("tag: 'status-badge'");
    expect(tsx).toContain('export class StatusBadge');
    expect(tsx).toContain("tone?: 'info' | 'success' = 'info';");
    const css = result.files.find(f => f.path.endsWith('.css'))!.content;
    expect(css).toContain('background: #eef;');
    for (const file of result.files) {
      expect(file.content.length).toBeGreaterThan(0);
    }
  });

  it('rejects a duplicate component id', async () => {
    await service.createComponentFromScaffold(input);
    await expect(service.createComponentFromScaffold(input)).rejects.toBeInstanceOf(ConflictException);
    // An existing design-system component
    await expect(
      service.createComponentFromScaffold({ ...input, name: 'Button' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects invalid names and prop names', async () => {
    await expect(service.createComponentFromScaffold({ ...input, name: '' })).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.createComponentFromScaffold({ ...input, name: 'Ok Name', props: [{ name: 'bad-name', type: 'string' }] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('scaffolds without props, events or slots', async () => {
    const generated = await service.scaffoldComponent({ name: 'Plain Box', description: '', category: 'layout' } as ComponentScaffoldInput);
    expect(generated.componentCode).toContain('export class PlainBox');
    expect(generated.styleCode).toContain(':host');
  });
});
