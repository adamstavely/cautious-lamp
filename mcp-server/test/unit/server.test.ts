import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { callTool, TOOLS, DesignSystemMCPServer } from '../../src/index';
import { apiClient } from '../../src/api-client';

jest.mock('../../src/api-client');
jest.mock('../../src/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

function textOf(result: { content: unknown[] }): string {
  return (result.content[0] as { text: string }).text;
}

describe('MCP server tool calls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Any backend call returns an empty object; tools must cope with it
    mockApiClient.get.mockResolvedValue({});
    mockApiClient.post.mockResolvedValue({});
    mockApiClient.put.mockResolvedValue({});
    mockApiClient.delete.mockResolvedValue({});
  });

  describe('called with no arguments', () => {
    it.each(TOOLS.map((tool) => [tool.name, tool] as const))(
      '%s returns a result or a clean error, never throws',
      async (_name, tool) => {
        const result = await callTool(tool.name, undefined);

        expect(Array.isArray(result.content)).toBe(true);
        expect(typeof textOf(result)).toBe('string');

        // Tools with required inputs reject the call; the rest run normally
        const required = (tool.inputSchema.required as string[] | undefined) ?? [];
        if (required.length > 0) {
          expect(result.isError).toBe(true);
          expect(textOf(result)).toContain(`Invalid arguments for tool ${tool.name}`);
          for (const field of required) {
            expect(textOf(result)).toContain(field);
          }
        } else {
          expect(result.isError).toBeFalsy();
        }
      }
    );

    it('get_components with no arguments calls the backend without a status filter', async () => {
      mockApiClient.get.mockResolvedValue({ components: [], count: 0 });

      const result = await callTool('get_components');

      expect(result.isError).toBeFalsy();
      expect(JSON.parse(textOf(result))).toEqual({ components: [], count: 0 });
      expect(mockApiClient.get).toHaveBeenCalledWith('/components', {}, 'components');
    });
  });

  describe('invalid argument types', () => {
    it.each([
      ['get_components', { status: 123 }],
      ['get_components', { status: 'archived' }],
      ['get_token', { name: 5 }],
      ['search_tokens', { query: null }],
      ['get_component_code', { id: 'button', format: 'svelte' }],
      ['get_patterns', { category: ['layout'] }],
      ['get_assets', { workspaceId: ['ws1'] }],
      ['export_rules', { format: 'yaml' }],
      ['create_review', { url: 'not a url' }],
      ['update_review', { reviewId: 'r1', action: 'approve' }],
      ['get_reviews', { showExpired: 'yes' }],
    ])('%s rejects %j cleanly without calling the backend', async (name, args) => {
      const result = await callTool(name, args as Record<string, unknown>);

      expect(result.isError).toBe(true);
      expect(textOf(result)).toContain(`Invalid arguments for tool ${name}`);
      expect(mockApiClient.get).not.toHaveBeenCalled();
      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    it('returns a clean error for an unknown tool', async () => {
      const result = await callTool('does_not_exist', {});

      expect(result.isError).toBe(true);
      expect(textOf(result)).toContain('Unknown tool: does_not_exist');
    });

    it('returns API failures as an error result', async () => {
      mockApiClient.get.mockRejectedValue(new Error('API Error 500: Internal Server Error'));

      const result = await callTool('get_tokens', {});

      expect(result.isError).toBe(true);
      expect(textOf(result)).toContain('API Error 500');
    });
  });

  describe('over the MCP protocol', () => {
    it('lists every tool and handles a tools/call that omits arguments', async () => {
      const server = new DesignSystemMCPServer();
      const client = new Client({ name: 'test-client', version: '1.0.0' });
      const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
      await (server as any).server.connect(serverTransport);
      await client.connect(clientTransport);

      const { tools } = await client.listTools();
      expect(tools.map((t) => t.name)).toEqual(TOOLS.map((t) => t.name));

      mockApiClient.get.mockResolvedValue({ components: [], count: 0 });
      const result = await client.callTool({ name: 'get_components' });
      expect(result.isError).toBeFalsy();

      const invalid = await client.callTool({ name: 'get_component', arguments: { id: 42 } });
      expect(invalid.isError).toBe(true);

      await client.close();
    });
  });
});
