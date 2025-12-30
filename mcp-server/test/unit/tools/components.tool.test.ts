import { getComponents, getComponent, getComponentCode, searchComponents } from '../../../src/tools/components.tool';
import { apiClient } from '../../../src/api-client';

jest.mock('../../../src/api-client');
jest.mock('../../../src/cache', () => ({
  cache: {
    get: jest.fn(() => undefined),
    set: jest.fn(),
    isEnabled: jest.fn(() => false),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Components Tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getComponents', () => {
    it('should retrieve all components', async () => {
      const mockResponse = {
        components: [
          { id: 'button', name: 'Button', description: 'A button component', status: 'production' as const, props: [], code: { vue: '', react: '' } },
        ],
        count: 1,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await getComponents({});

      expect(result).toEqual(mockResponse);
      expect(mockApiClient.get).toHaveBeenCalledWith('/components', {}, 'components');
    });
  });

  describe('getComponent', () => {
    it('should retrieve a specific component', async () => {
      const mockComponent = {
        id: 'button',
        name: 'Button',
        description: 'A button component',
        status: 'production' as const,
        props: [],
        code: { vue: '<button>Click</button>', react: '<button>Click</button>' },
      };

      mockApiClient.get.mockResolvedValue(mockComponent);

      const result = await getComponent({ id: 'button' });

      expect(result).toEqual(mockComponent);
      expect(mockApiClient.get).toHaveBeenCalledWith('/components/button', { id: 'button' }, 'components');
    });
  });

  describe('getComponentCode', () => {
    it('should return Vue code', async () => {
      const mockComponent = {
        id: 'button',
        name: 'Button',
        description: 'A button component',
        status: 'production' as const,
        props: [],
        code: { vue: '<button>Vue</button>', react: '<button>React</button>' },
      };

      mockApiClient.get.mockResolvedValue(mockComponent);

      const result = await getComponentCode({ id: 'button', format: 'vue' });

      expect(result).toBe('<button>Vue</button>');
    });

    it('should return React code', async () => {
      const mockComponent = {
        id: 'button',
        name: 'Button',
        description: 'A button component',
        status: 'production' as const,
        props: [],
        code: { vue: '<button>Vue</button>', react: '<button>React</button>' },
      };

      mockApiClient.get.mockResolvedValue(mockComponent);

      const result = await getComponentCode({ id: 'button', format: 'react' });

      expect(result).toBe('<button>React</button>');
    });
  });

  describe('searchComponents', () => {
    it('should search components by name', async () => {
      const allComponents = {
        components: [
          { id: 'button', name: 'Button', description: 'A button', status: 'production' as const, props: [], code: { vue: '', react: '' } },
          { id: 'card', name: 'Card', description: 'A card', status: 'production' as const, props: [], code: { vue: '', react: '' } },
        ],
        count: 2,
      };

      mockApiClient.get.mockResolvedValue(allComponents);

      const result = await searchComponents({ query: 'button' });

      expect(result.components).toHaveLength(1);
      expect(result.components[0].id).toBe('button');
    });
  });
});


