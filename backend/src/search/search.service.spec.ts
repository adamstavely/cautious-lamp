import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { DesignSystemService } from '../design-system/design-system.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WorkspaceAccessService } from '../workspaces/workspace-access.service';
import { ComponentAccessService } from '../design-system/component-access.service';
import { AuthPrincipal } from '../auth/principal';

describe('SearchService', () => {
  let service: SearchService;
  let designSystemService: DesignSystemService;

  const mockDesignSystemService = {
    getAllComponents: jest.fn(),
    getAllTokens: jest.fn(),
  };
  const mockWorkspacesService = { list: jest.fn() };
  const mockWorkspaceAccess = { memberWorkspaceIds: jest.fn(async () => new Set<string>()) };
  const principal = { type: 'user', id: 'u1', permissions: new Set<string>() } as unknown as AuthPrincipal;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: DesignSystemService,
          useValue: mockDesignSystemService,
        },
        { provide: WorkspacesService, useValue: mockWorkspacesService },
        { provide: WorkspaceAccessService, useValue: mockWorkspaceAccess },
        ComponentAccessService,
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    designSystemService = module.get<DesignSystemService>(DesignSystemService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should return empty array when no results found', async () => {
      mockDesignSystemService.getAllComponents.mockReturnValue([]);
      mockDesignSystemService.getAllTokens.mockReturnValue([]);
      mockWorkspacesService.list.mockResolvedValue([]);

      const results = await service.search('nonexistent');

      expect(results).toEqual([]);
    });

    it('should find components by name', async () => {
      mockDesignSystemService.getAllComponents.mockReturnValue([
        {
          id: '1',
          name: 'Button',
          description: 'A button component',
          props: [],
        },
        {
          id: '2',
          name: 'Input',
          description: 'An input component',
          props: [],
        },
      ]);
      mockDesignSystemService.getAllTokens.mockReturnValue([]);
      mockWorkspacesService.list.mockResolvedValue([]);

      const results = await service.search('Button');

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('component');
      expect(results[0].title).toBe('Button');
    });

    it('should filter by type', async () => {
      mockDesignSystemService.getAllComponents.mockReturnValue([
        {
          id: '1',
          name: 'Button',
          description: 'A button component',
          props: [],
        },
      ]);
      mockDesignSystemService.getAllTokens.mockReturnValue([
        {
          name: 'primary-color',
          value: '#000',
          type: 'color',
          category: 'colors',
        },
      ]);
      mockWorkspacesService.list.mockResolvedValue([]);

      const results = await service.search('Button', { type: ['token'] });

      expect(results).toHaveLength(0);
    });

    it('should calculate relevance scores correctly', async () => {
      mockDesignSystemService.getAllComponents.mockReturnValue([
        {
          id: '1',
          name: 'Button',
          description: 'A button component',
          props: [],
        },
        {
          id: '2',
          name: 'ButtonGroup',
          description: 'A group of buttons',
          props: [],
        },
      ]);
      mockDesignSystemService.getAllTokens.mockReturnValue([]);
      mockWorkspacesService.list.mockResolvedValue([]);

      const results = await service.search('Button');

      expect(results.length).toBeGreaterThan(0);
      // Exact match should have higher score
      const exactMatch = results.find(r => r.title === 'Button');
      const partialMatch = results.find(r => r.title === 'ButtonGroup');
      expect(exactMatch?.score).toBeGreaterThan(partialMatch?.score || 0);
    });
  });

  describe('workspace components', () => {
    const components = [
      { id: 'lib', name: 'Button', description: 'library', props: [] },
      { id: 'mine', name: 'Button Mine', description: 'mine', props: [], workspaceId: 'ws_mine' },
      { id: 'secret', name: 'Button Secret', description: 'other team', props: [], workspaceId: 'ws_other' },
      { id: 'shared', name: 'Button Shared', description: 'shared', props: [], workspaceId: 'ws_other', sharedWith: ['ws_mine'] },
      { id: 'global', name: 'Button Global', description: 'global', props: [], workspaceId: 'ws_other', isGlobal: true },
    ];

    beforeEach(() => {
      mockDesignSystemService.getAllComponents.mockReturnValue(components);
      mockDesignSystemService.getAllTokens.mockReturnValue([]);
      mockWorkspacesService.list.mockResolvedValue([]);
    });

    it('only finds components from workspaces the caller belongs to', async () => {
      mockWorkspaceAccess.memberWorkspaceIds.mockResolvedValueOnce(new Set(['ws_mine']));
      const ids = (await service.search('Button', undefined, principal)).map((r) => r.id).sort();
      expect(ids).toEqual(['global', 'lib', 'mine', 'shared']);
    });

    it('hides workspace components from suggestions and filter counts, and without a principal', async () => {
      expect(await service.getSuggestions('Secret', 5, principal)).toEqual([]);
      expect((await service.getAvailableFilters(principal)).types.find((t) => t.value === 'component')?.count).toBe(2);
      expect((await service.search('Button')).map((r) => r.id)).not.toContain('secret');
    });
  });

  describe('getSuggestions', () => {
    it('should return suggestions based on query', async () => {
      mockDesignSystemService.getAllComponents.mockReturnValue([
        {
          id: '1',
          name: 'Button',
          description: 'A button component',
          props: [],
        },
        {
          id: '2',
          name: 'ButtonGroup',
          description: 'A group of buttons',
          props: [],
        },
      ]);
      mockDesignSystemService.getAllTokens.mockReturnValue([]);

      const suggestions = await service.getSuggestions('But', 5);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions).toContain('Button');
    });

    it('should respect limit parameter', async () => {
      mockDesignSystemService.getAllComponents.mockReturnValue(
        Array.from({ length: 10 }, (_, i) => ({
          id: `${i}`,
          name: `Component${i}`,
          description: '',
          props: [],
        }))
      );
      mockDesignSystemService.getAllTokens.mockReturnValue([]);

      const suggestions = await service.getSuggestions('Component', 3);

      expect(suggestions.length).toBeLessThanOrEqual(3);
    });
  });

  describe('getAvailableFilters', () => {
    it('should return filter counts', async () => {
      mockDesignSystemService.getAllComponents.mockReturnValue([
        {
          id: '1',
          name: 'Button',
          description: 'A button component',
          status: 'stable',
          props: [{ name: 'variant', type: 'string' }],
        },
      ]);
      mockDesignSystemService.getAllTokens.mockReturnValue([
        {
          name: 'primary-color',
          value: '#000',
          type: 'color',
          category: 'colors',
        },
      ]);
      mockWorkspacesService.list.mockResolvedValue([
        { id: '1', name: 'Workspace 1' },
      ]);

      const filters = await service.getAvailableFilters(principal);

      expect(filters.types).toBeDefined();
      expect(filters.categories).toBeDefined();
      expect(filters.commonProps).toBeDefined();
    });
  });
});

