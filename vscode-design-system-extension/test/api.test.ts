import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { DesignSystemAPI } from '../src/api';

const silent = { appendLine: () => {} };

/** An API client whose GETs answer from `respond`, recording each request */
function client(respond: (attempt: number) => Partial<AxiosResponse> | Error, options: { apiKey?: string; requestTimeout?: number } = {}) {
  const calls: AxiosRequestConfig[] = [];
  const api = new DesignSystemAPI('http://api.test/api/v1/', options.apiKey ?? 'key', silent, {
    requestTimeout: options.requestTimeout,
    sleep: async () => {},
    get: async (_url, config) => {
      calls.push(config);
      const answer = respond(calls.length);
      if (answer instanceof Error) throw answer;
      return { status: 200, statusText: 'OK', headers: {}, config, data: undefined, ...answer } as AxiosResponse;
    },
  });
  return { api, calls };
}

const networkError = (code: string) => Object.assign(new Error(code), { code });

test('401 and 404 are not retried', async () => {
  for (const status of [401, 404, 403]) {
    const { api, calls } = client(() => ({ status, statusText: 'nope' }));
    assert.deepEqual(await api.getTokens(), []);
    assert.equal(calls.length, 1, `status ${status}`);
  }
});

test('timeouts and 5xx are retried twice, then succeed or give up', async () => {
  const flaky = client(attempt => (attempt < 3 ? networkError('ECONNABORTED') : { data: { tokens: [{ name: 'color.primary' }] } }));
  assert.deepEqual((await flaky.api.getTokens()).map(t => t.name), ['color.primary']);
  assert.equal(flaky.calls.length, 3);

  const down = client(() => Object.assign(new Error('Request failed with status code 503'), { response: { status: 503 } }));
  assert.deepEqual(await down.api.getComponents(), []);
  assert.equal(down.calls.length, 3);
});

test('the request timeout is configurable', async () => {
  const configured = client(() => ({ data: [] }), { requestTimeout: 2500 });
  await configured.api.getTokens();
  assert.equal(configured.calls[0].timeout, 2500);

  const fallback = client(() => ({ data: [] }));
  await fallback.api.getTokens();
  assert.equal(fallback.calls[0].timeout, 10000);
});

test('the API key is sent as a Bearer token, and no header is sent without one', async () => {
  const withKey = client(() => ({ data: [] }), { apiKey: 'abc' });
  await withKey.api.getTokens();
  assert.deepEqual(withKey.calls[0].headers, { Authorization: 'Bearer abc' });

  const withoutKey = client(() => ({ data: [] }), { apiKey: '' });
  await withoutKey.api.getTokens();
  assert.deepEqual(withoutKey.calls[0].headers, {});
});
