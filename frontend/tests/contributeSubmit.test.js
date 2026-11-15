// Contribute page: submitting a contribution posts the template, text and
// files to generate-pr; an opened pull request is linked, and when GitHub isn't
// set up the page says so and shows the text. People without component:create see no form.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import Contribute from '../src/views/Contribute.vue';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const permissions = new Set();
vi.mock('../src/composables/useAuth.js', () => ({
  useAuth: () => ({ hasPermission: (p) => permissions.has(p) }),
}));

const flush = async () => {
  for (let i = 0; i < 8; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

const API = '/api/v1/contribution-workflow';
const TEMPLATES = [{ id: 'template-component', name: 'New component', description: 'For a new component', category: 'component', template: { title: 'Add a component', description: '', checklist: [] } }];

let responses;
let calls;
let page;
const originalAdapter = apiClient.defaults.adapter;
const fail = (status, message) => Object.assign(new Error(message), { response: { status, data: { message } } });

beforeEach(() => {
  permissions.clear();
  calls = [];
  vi.spyOn(console, 'error').mockImplementation(() => {});
  responses = {
    [`GET ${API}/templates`]: TEMPLATES,
    [`GET ${API}/pull-requests/setup`]: { configured: true, repository: 'acme/design-system' },
    [`POST ${API}/templates/template-component/generate-pr`]: {
      prTemplate: '## Add Chip\n',
      pullRequestOpened: true,
      pullRequest: { url: 'https://github.com/acme/design-system/pull/42', number: 42, branch: 'contribution/add-chip-1a2b3c4d', base: 'main', repository: 'acme/design-system' },
      message: 'Opened pull request #42 in acme/design-system.',
    },
  };
  apiClient.defaults.adapter = async (config) => {
    const key = `${config.method.toUpperCase()} ${config.url}`;
    calls.push({ key, data: config.data ? JSON.parse(config.data) : undefined });
    const data = responses[key];
    if (data instanceof Error) return Promise.reject(data);
    if (data === undefined) return Promise.reject(fail(404, 'not found'));
    return { status: 200, statusText: 'OK', data, headers: {}, config };
  };
});

afterEach(() => {
  page?.unmount();
  page = null;
  apiClient.defaults.adapter = originalAdapter;
  vi.restoreAllMocks();
});

const open = async () => {
  page = await mountView(Contribute, { path: '/getting-started/contribute' });
  await flush();
  return page;
};
const text = () => document.body.textContent.replace(/\s+/g, ' ');
const submit = async () => {
  await page.state.submit();
  await flush();
};

describe('Submitting a contribution', () => {
  it('opens a pull request with the files and links to it', async () => {
    permissions.add('component:create');
    await open();
    expect(text()).toContain('Pull requests open in acme/design-system');
    const { form } = page.state;
    form.templateId = 'template-component';
    form.title = 'Add Chip';
    form.files[0].path = 'src/components/Chip.vue';
    form.files[0].content = '<template />';
    page.state.addFile();
    form.files[1].path = 'docs/chip.md';
    form.files[1].content = '# Chip';
    await submit();

    const post = calls.find((c) => c.key.startsWith('POST'));
    expect(post).toEqual({
      key: `POST ${API}/templates/template-component/generate-pr`,
      data: { title: 'Add Chip', files: [{ path: 'src/components/Chip.vue', content: '<template />' }, { path: 'docs/chip.md', content: '# Chip' }] },
    });
    expect(text()).toContain('Opened pull request #42 in acme/design-system.');
    const link = [...document.querySelectorAll('a')].find((a) => a.textContent.includes('View pull request #42'));
    expect(link.getAttribute('href')).toBe('https://github.com/acme/design-system/pull/42');
  });

  it('checks the template and paths before sending', async () => {
    permissions.add('component:create');
    await open();
    page.state.form.files[0].path = '../outside.txt';
    await submit();
    expect(page.state.errors.templateId).toBe('Choose a template');
    expect(page.state.errors.files[0]).toContain('Enter a path inside the repository');
    expect(calls.some((c) => c.key.startsWith('POST'))).toBe(false);
  });

  it("says when GitHub isn't set up and shows the text to paste", async () => {
    permissions.add('component:create');
    responses[`GET ${API}/pull-requests/setup`] = { configured: false };
    responses[`POST ${API}/templates/template-component/generate-pr`] = {
      prTemplate: '## Add a component\n\n### Checklist\n',
      pullRequestOpened: false,
      message: "GitHub isn't set up on this server, so no pull request was opened.",
    };
    await open();
    expect(text()).toContain("GitHub isn't set up on this server, so no pull request will be opened");
    expect(text()).toContain('Generate pull request text');
    page.state.form.templateId = 'template-component';
    await submit();
    expect(calls.find((c) => c.key.startsWith('POST')).data).toEqual({});
    expect(text()).toContain('### Checklist');
    expect(text()).not.toContain('View pull request');
  });

  it("shows the server's refusal", async () => {
    permissions.add('component:create');
    responses[`POST ${API}/templates/template-component/generate-pr`] = fail(502, "No pull request was opened: the server's token can't write to acme/design-system.");
    await open();
    page.state.form.templateId = 'template-component';
    page.state.form.files[0].path = 'a.txt';
    await submit();
    expect(document.querySelector('[role="alert"]').textContent).toContain("can't write to acme/design-system");
  });

  it('shows no form without component:create', async () => {
    await open();
    expect(text()).toContain('Submitting a contribution needs permission to create components');
    expect(document.querySelector('form')).toBeNull();
    expect(calls).toEqual([]);
  });
});
