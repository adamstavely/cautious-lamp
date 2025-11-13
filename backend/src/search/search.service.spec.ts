import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { DesignSystemService } from '../design-system/design-system.service';

describe('SearchService', () => {
  let service: SearchService;
  let designSystemService: DesignSystemService;

  const mockDesignSystemService = {
    getAllComponents: jest.fn(),
    getAllTokens: jest.fn(),
    getAllWorkspaces: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: DesignSystemService,
          useValue: mockDesignSystemService,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    designSystemService = module.get<DesignSystemService>(DesignSystemService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should return empty array when no results found', () => {
      mockDesignSystemService.getAllComponents.mockReturnValue([]);
      mockDesignSystemService.getAllTokens.mockReturnValue([]);
      mockDesignSystemService.getAllWorkspaces.mockReturnValue([]);

      const results = service.search('nonexistent');

      expect(results).toEqual([]);
    });

    it('should find components by name', () => {
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
      mockDesignSystemService.getAllWorkspaces.mockReturnValue([]);

      const results = service.search('Button');

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('component');
      expect(results[0].title).toBe('Button');
    });

    it('should filter by type', () => {
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
      mockDesignSystemService.getAllWorkspaces.mockReturnValue([]);

      const results = service.search('Button', { type: ['token'] });

      expect(results).toHaveLength(0);
    });

    it('should calculate relevance scores correctly', () => {
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
      mockDesignSystemService.getAllWorkspaces.mockReturnValue([]);

      const results = service.search('Button');

      expect(results.length).toBeGreaterThan(0);
      // Exact match should have higher score
      const exactMatch = results.find(r => r.title === 'Button');
      const partialMatch = results.find(r => r.title === 'ButtonGroup');
      expect(exactMatch?.score).toBeGreaterThan(partialMatch?.score || 0);
    });
  });

  describe('getSuggestions', () => {
    it('should return suggestions based on query', () => {
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

      const suggestions = service.getSuggestions('But', 5);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions).toContain('Button');
    });

    it('should respect limit parameter', () => {
      mockDesignSystemService.getAllComponents.mockReturnValue(
        Array.from({ length: 10 }, (_, i) => ({
          id: `${i}`,
          name: `Component${i}`,
          description: '',
          props: [],
        }))
      );
      mockDesignSystemService.getAllTokens.mockReturnValue([]);

      const suggestions = service.getSuggestions('Component', 3);

      expect(suggestions.length).toBeLessThanOrEqual(3);
    });
  });

  describe('getAvailableFilters', () => {
    it('should return filter counts', () => {
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
      mockDesignSystemService.getAllWorkspaces.mockReturnValue([
        { id: '1', name: 'Workspace 1' },
      ]);

      const filters = service.getAvailableFilters();

      expect(filters.types).toBeDefined();
      expect(filters.categories).toBeDefined();
      expect(filters.commonProps).toBeDefined();
    });
  });
});

