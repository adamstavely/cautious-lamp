import { BadGatewayException, BadRequestException } from '@nestjs/common';
import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { AuthPrincipal } from '../auth/principal';
import { ContributionWorkflowService, PR_NEEDS_FILES, PR_NOT_CONFIGURED } from './contribution-workflow.service';
import { DEFAULT_TEMPLATES } from './contribution-defaults';
import { GitHubPullRequests, contributionBranch, githubConfigFrom } from './github-pull-requests';

const ENV = { GITHUB_TOKEN: 'ghp_test', GITHUB_REPO_OWNER: 'acme', GITHUB_REPO_NAME: 'design-system' };

/** A stand-in for api.github.com: answers the calls a pull request needs, and records them */
function fakeGitHub(overrides: Record<string, { status: number; body: unknown }> = {}) {
  const calls: Array<{ method: string; path: string; body?: any; headers: Record<string, string> }> = [];
  const routes: Record<string, unknown> = {
    'GET /repos/acme/design-system': { default_branch: 'main' },
    'GET /repos/acme/design-system/git/ref/heads/main': { object: { sha: 'base-sha' } },
    'GET /repos/acme/design-system/git/ref/heads/release/next': { object: { sha: 'release-sha' } },
    'GET /repos/acme/design-system/git/commits/base-sha': { tree: { sha: 'base-tree' } },
    'GET /repos/acme/design-system/git/commits/release-sha': { tree: { sha: 'release-tree' } },
    'POST /repos/acme/design-system/git/trees': { sha: 'new-tree' },
    'POST /repos/acme/design-system/git/commits': { sha: 'new-commit' },
    'POST /repos/acme/design-system/git/refs': { ref: 'refs/heads/x' },
    'POST /repos/acme/design-system/pulls': { html_url: 'https://github.com/acme/design-system/pull/42', number: 42 },
  };
  const fetchImpl = jest.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    const method = init?.method ?? 'GET';
    calls.push({ method, path: url.pathname, body: init?.body ? JSON.parse(String(init.body)) : undefined, headers: init?.headers as Record<string, string> });
    const key = `${method} ${url.pathname}`;
    const override = overrides[key] ?? Object.entries(overrides).find(([pattern]) => key.startsWith(pattern))?.[1];
    if (override) return new Response(JSON.stringify(override.body), { status: override.status });
    if (method === 'DELETE') return new Response(null, { status: 204 });
    if (!(key in routes)) return new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 });
    return new Response(JSON.stringify(routes[key]), { status: 201 });
  });
  return { calls, fetchImpl };
}

function service(env: NodeJS.ProcessEnv, github = fakeGitHub()) {
  const templates = new InMemoryStore<any>();
  const contribution = new ContributionWorkflowService(
    {} as never,
    {} as never,
    new InMemoryStore(),
    templates,
    new InMemoryStore(),
    new InMemoryStore(),
    new GitHubPullRequests(env, github.fetchImpl as typeof fetch),
  );
  return { contribution, github };
}

const ANN = { type: 'user', id: 'usr_ann', name: 'Ann Lee', email: 'ann@example.com' } as AuthPrincipal;
const FILES = [
  { path: 'src/components/Chip.vue', content: '<template><span class="chip"><slot /></span></template>\n' },
  { path: 'docs/components/chip.md', content: '# Chip\n' },
];
const templateId = DEFAULT_TEMPLATES[0].id;

describe('GitHub configuration', () => {
  it('needs a token, an owner and a repository', () => {
    expect(githubConfigFrom({})).toBeNull();
    expect(githubConfigFrom({ ...ENV, GITHUB_TOKEN: ' ' })).toBeNull();
    expect(githubConfigFrom({ ...ENV, GITHUB_REPO_OWNER: '../evil' })).toBeNull();
    expect(githubConfigFrom({ ...ENV, GITHUB_BASE_BRANCH: '../x' })).toBeNull();
    expect(githubConfigFrom({ ...ENV, GITHUB_API_URL: 'https://github.example.com/api/v3/' })).toEqual({
      token: 'ghp_test', owner: 'acme', repo: 'design-system', baseBranch: undefined, apiUrl: 'https://github.example.com/api/v3',
    });
  });

  it('names branches after the title', () => {
    expect(contributionBranch('Add the Chip component!')).toMatch(/^contribution\/add-the-chip-component-[0-9a-f]{8}$/);
    expect(contributionBranch('***')).toMatch(/^contribution\/change-[0-9a-f]{8}$/);
  });

  it('tells the page whether pull requests can be opened, without the token', () => {
    expect(service({}).contribution.pullRequestSetup()).toEqual({ configured: false });
    const setup = service({ ...ENV, GITHUB_BASE_BRANCH: 'release/next' }).contribution.pullRequestSetup();
    expect(setup).toEqual({ configured: true, repository: 'acme/design-system', baseBranch: 'release/next' });
    expect(JSON.stringify(setup)).not.toContain('ghp_test');
  });
});

describe('generate-pr', () => {
  it('returns the text and says so when GitHub is not set up', async () => {
    const { contribution, github } = service({});
    const result = await contribution.generatePRTemplate(templateId, { title: 'Add Chip', files: FILES }, ANN);
    expect(result).toMatchObject({ pullRequestOpened: false, message: PR_NOT_CONFIGURED });
    expect(result.prTemplate).toContain('## Add Chip');
    expect(github.fetchImpl).not.toHaveBeenCalled();
  });

  it('needs files to open a pull request', async () => {
    const { contribution, github } = service(ENV);
    expect(await contribution.generatePRTemplate(templateId, { title: 'Add Chip' }, ANN)).toMatchObject({ pullRequestOpened: false, message: PR_NEEDS_FILES });
    expect(github.fetchImpl).not.toHaveBeenCalled();
  });

  it('commits the files on a new branch and opens the pull request', async () => {
    const { contribution, github } = service(ENV);
    const result = await contribution.generatePRTemplate(templateId, { title: 'Add Chip', description: 'A compact label', files: FILES }, ANN);

    expect(result).toMatchObject({
      pullRequestOpened: true,
      pullRequest: { url: 'https://github.com/acme/design-system/pull/42', number: 42, base: 'main', repository: 'acme/design-system' },
      message: 'Opened pull request #42 in acme/design-system.',
    });
    expect(github.calls.map((c) => `${c.method} ${c.path}`)).toEqual([
      'GET /repos/acme/design-system',
      'GET /repos/acme/design-system/git/ref/heads/main',
      'GET /repos/acme/design-system/git/commits/base-sha',
      'POST /repos/acme/design-system/git/trees',
      'POST /repos/acme/design-system/git/commits',
      'POST /repos/acme/design-system/git/refs',
      'POST /repos/acme/design-system/pulls',
    ]);
    const [, , , tree, commit, ref, pull] = github.calls;
    expect(github.calls.every((c) => c.headers.Authorization === 'Bearer ghp_test' && c.headers['X-GitHub-Api-Version'] === '2022-11-28')).toBe(true);
    expect(tree.body).toEqual({ base_tree: 'base-tree', tree: FILES.map((f) => ({ path: f.path, mode: '100644', type: 'blob', content: f.content })) });
    expect(commit.body).toMatchObject({ tree: 'new-tree', parents: ['base-sha'], message: expect.stringMatching(/^Add Chip\n/) });
    expect(ref.body).toEqual({ ref: `refs/heads/${result.pullRequest!.branch}`, sha: 'new-commit' });
    expect(result.pullRequest!.branch).toMatch(/^contribution\/add-chip-/);
    expect(pull.body).toMatchObject({ title: 'Add Chip', head: result.pullRequest!.branch, base: 'main' });
    expect(pull.body.body).toContain('A compact label');
    expect(pull.body.body).toContain('Submitted through the design system by Ann Lee (ann@example.com).');
  });

  it('targets the configured base branch', async () => {
    const { contribution, github } = service({ ...ENV, GITHUB_BASE_BRANCH: 'release/next' });
    const result = await contribution.generatePRTemplate(templateId, { files: FILES }, ANN);
    expect(result.pullRequest!.base).toBe('release/next');
    expect(github.calls[0].path).toBe('/repos/acme/design-system/git/ref/heads/release/next');
  });

  it("explains GitHub's refusals and creates no branch when the commit fails", async () => {
    const denied = service(ENV, fakeGitHub({ 'POST /repos/acme/design-system/git/trees': { status: 403, body: { message: 'Resource not accessible by personal access token' } } }));
    const error = await denied.contribution.generatePRTemplate(templateId, { files: FILES }, ANN).catch((e) => e);
    expect(error).toBeInstanceOf(BadGatewayException);
    expect(error.message).toContain("can't write to acme/design-system");
    expect(error.message).toContain('Resource not accessible by personal access token');
    expect(denied.github.calls.some((c) => c.path.endsWith('/git/refs'))).toBe(false);

    const badToken = service(ENV, fakeGitHub({ 'GET /repos/acme/design-system': { status: 401, body: { message: 'Bad credentials' } } }));
    await expect(badToken.contribution.generatePRTemplate(templateId, { files: FILES }, ANN)).rejects.toThrow('GitHub refused the server');
  });

  it('deletes the branch again when the pull request is refused', async () => {
    const { contribution, github } = service(ENV, fakeGitHub({ 'POST /repos/acme/design-system/pulls': { status: 422, body: { message: 'Validation Failed' } } }));
    await expect(contribution.generatePRTemplate(templateId, { files: FILES }, ANN)).rejects.toThrow('GitHub answered 422 ("Validation Failed")');
    const branch = github.calls.find((c) => c.path.endsWith('/git/refs'))!.body.ref.replace('refs/heads/', '');
    expect(github.calls.at(-1)).toMatchObject({ method: 'DELETE', path: `/repos/acme/design-system/git/refs/heads/${branch}` });
  });

  it('says when GitHub cannot be reached', async () => {
    const offline = fakeGitHub();
    offline.fetchImpl.mockRejectedValue(new TypeError('fetch failed'));
    const { contribution } = service(ENV, offline);
    await expect(contribution.generatePRTemplate(templateId, { files: FILES }, ANN)).rejects.toThrow('GitHub could not be reached');
  });

  it('refuses a path listed twice and an unknown template', async () => {
    const { contribution, github } = service(ENV);
    await expect(contribution.generatePRTemplate(templateId, { files: [FILES[0], FILES[0]] }, ANN)).rejects.toBeInstanceOf(BadRequestException);
    await expect(contribution.generatePRTemplate('template-missing', { files: FILES }, ANN)).rejects.toBeInstanceOf(BadRequestException);
    expect(github.fetchImpl).not.toHaveBeenCalled();
  });
});
