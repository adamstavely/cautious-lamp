import axios from 'axios';
import { DesignSystemAPI, DEFAULT_BASE_URL } from '../src/index';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DesignSystemAPI', () => {
  const client = {
    get: jest.fn(),
    post: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    client.get.mockResolvedValue({ data: { ok: 'get' } });
    client.post.mockResolvedValue({ data: { ok: 'post' } });
    mockedAxios.create.mockReturnValue(client as any);
  });

  const make = (baseURL?: string) => new DesignSystemAPI({ apiKey: 'secret-key', baseURL });

  describe('constructor', () => {
    it('sends the API key as a Bearer token with JSON content type', () => {
      make('https://ds.example.com/api/v1');
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://ds.example.com/api/v1',
        headers: {
          Authorization: 'Bearer secret-key',
          'Content-Type': 'application/json',
        },
      });
    });

    it('passes a timeout through when given', () => {
      new DesignSystemAPI({ apiKey: 'k', timeout: 1234 });
      expect(mockedAxios.create.mock.calls[0][0]!.timeout).toBe(1234);
    });

    it('defaults the base URL to the /api/v1 prefix', () => {
      make();
      expect(mockedAxios.create.mock.calls[0][0]!.baseURL).toBe(DEFAULT_BASE_URL);
      expect(DEFAULT_BASE_URL).toBe('http://localhost:3000/api/v1');
    });
  });

  describe('GET methods', () => {
    const cases: Array<[string, (api: DesignSystemAPI) => Promise<unknown>, string, unknown]> = [
      ['tokens', (api) => api.tokens(), '/tokens', undefined],
      ['tokensByCategory', (api) => api.tokensByCategory('color'), '/tokens/category/color', undefined],
      ['token (encodes name)', (api) => api.token('color/primary 500'), '/tokens/color%2Fprimary%20500', undefined],
      [
        'tokensFiltered',
        (api) => api.tokensFiltered({ category: 'color', type: 'hex', tag: 'brand' }),
        '/tokens',
        { params: { category: 'color', type: 'hex', tag: 'brand' } },
      ],
      [
        'tokensFiltered omits empty filters',
        (api) => api.tokensFiltered({ type: 'hex' }),
        '/tokens',
        { params: { type: 'hex' } },
      ],
      ['components', (api) => api.components(), '/components', undefined],
      ['components with status', (api) => api.components('production'), '/components', { params: { status: 'production' } }],
      ['component', (api) => api.component('button'), '/components/button', undefined],
      ['componentsByStatus', (api) => api.componentsByStatus('in-progress'), '/components/status/in-progress', undefined],
      ['getApplications', (api) => api.getApplications(), '/applications', { params: {} }],
      [
        'getApplications with filters',
        (api) => api.getApplications({ teamId: 't1', capability: 'governance' }),
        '/applications',
        { params: { teamId: 't1', capability: 'governance' } },
      ],
      [
        'getApplications with workspace, search and paging',
        (api) => api.getApplications({ workspaceId: 'ws1', environment: 'production', search: 'shop', limit: 20, offset: 40 }),
        '/applications',
        { params: { workspaceId: 'ws1', environment: 'production', search: 'shop', limit: 20, offset: 40 } },
      ],
    ];

    // Every row has exactly 4 entries so jest does not treat a trailing arg as `done`.
    it.each(cases)('%s', async (_label, call, url, config) => {
      const api = make();
      const result = await call(api);
      expect(client.post).not.toHaveBeenCalled();
      expect(client.get).toHaveBeenCalledTimes(1);
      if (config === undefined) {
        expect(client.get).toHaveBeenCalledWith(url);
      } else {
        expect(client.get).toHaveBeenCalledWith(url, config);
      }
      expect(result).toEqual({ ok: 'get' });
    });
  });

  describe('POST methods', () => {
    const cases: Array<[string, (api: DesignSystemAPI) => Promise<unknown>, string, unknown]> = [
      ['createApiKey', (api) => api.createApiKey('ci'), '/auth/api-keys', { name: 'ci' }],
      [
        'createApiKey with options',
        (api) => api.createApiKey('ci', { expiresInDays: 30, scopes: ['read'] }),
        '/auth/api-keys',
        { name: 'ci', expiresInDays: 30, scopes: ['read'] },
      ],
      ['registerApplication', (api) => api.registerApplication('app'), '/applications/register', { name: 'app' }],
      [
        'registerApplication with repo/version/options',
        (api) => api.registerApplication('app', 'https://git/x', '2.0.0', { teamId: 't1' }),
        '/applications/register',
        { name: 'app', repository: 'https://git/x', version: '2.0.0', teamId: 't1' },
      ],
      [
        'scanCompliance',
        (api) => api.scanCompliance('applications', 'app-1', ['accessibility']),
        '/compliance/scan',
        { scope: 'applications', applicationId: 'app-1', categories: ['accessibility'] },
      ],
      [
        'scanCompliance for some components and rules',
        (api) => api.scanCompliance('design-system', undefined, undefined, { componentIds: ['button'], ruleIds: ['ds-hardcoded-colors'] }),
        '/compliance/scan',
        { scope: 'design-system', applicationId: undefined, categories: undefined, componentIds: ['button'], ruleIds: ['ds-hardcoded-colors'] },
      ],
      [
        'registerApplication in a workspace',
        (api) => api.registerApplication('app', undefined, undefined, { workspaceId: 'ws1', designSystemVersion: '2.1.0' }),
        '/applications/register',
        { name: 'app', workspaceId: 'ws1', designSystemVersion: '2.1.0' },
      ],
      [
        'scanApplicationCodebase',
        (api) => api.scanApplicationCodebase('app-1', undefined, ['ux-hcd']),
        '/compliance/scan-application',
        { applicationId: 'app-1', codebase: undefined, categories: ['ux-hcd'] },
      ],
      [
        'chat',
        (api) => api.chat('hi', [{ role: 'user', content: 'x' }]),
        '/ai/chat',
        { message: 'hi', conversationHistory: [{ role: 'user', content: 'x' }] },
      ],
    ];

    it.each(cases)('%s', async (_label, call, url, body) => {
      const api = make();
      const result = await call(api);
      expect(client.get).not.toHaveBeenCalled();
      expect(client.post).toHaveBeenCalledTimes(1);
      expect(client.post).toHaveBeenCalledWith(url, body);
      expect(result).toEqual({ ok: 'post' });
    });
  });

  describe('health', () => {
    it('resolves with the report for 200 and for 503 (the server answers 503 when Elasticsearch is down)', async () => {
      const report = { status: 'unavailable', version: '1.2.0', timestamp: 'now', elasticsearch: { status: 'down' } };
      client.get.mockResolvedValueOnce({ data: report });
      await expect(make().health()).resolves.toEqual(report);

      const [url, config] = client.get.mock.calls[0];
      expect(url).toBe('/health');
      expect([200, 503].map((status) => config.validateStatus(status))).toEqual([true, true]);
      expect([401, 500].map((status) => config.validateStatus(status))).toEqual([false, false]);
    });
  });

  it('propagates request errors', async () => {
    client.get.mockRejectedValueOnce(new Error('Request failed with status code 401'));
    await expect(make().tokens()).rejects.toThrow('401');
  });
});
