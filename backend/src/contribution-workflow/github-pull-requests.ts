import { BadGatewayException, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

/** Where contributions are opened as pull requests, from the server's environment */
export interface GitHubRepositoryConfig {
  apiUrl: string;
  token: string;
  owner: string;
  repo: string;
  /** The branch pull requests target; the repository's default branch when unset */
  baseBranch?: string;
}

export interface PullRequestFile {
  path: string;
  content: string;
}

export interface OpenedPullRequest {
  url: string;
  number: number;
  branch: string;
  base: string;
  repository: string;
}

/** What the contribution page shows before anyone submits */
export interface PullRequestSetup {
  configured: boolean;
  /** owner/name, when configured */
  repository?: string;
  baseBranch?: string;
}

const NAME = /^[A-Za-z0-9_.-]{1,100}$/;
const BRANCH = /^(?!\/)(?!.*\.\.)(?!.*\/\/)[A-Za-z0-9._/-]{1,200}(?<![./])$/;

/**
 * The repository from GITHUB_TOKEN, GITHUB_REPO_OWNER and GITHUB_REPO_NAME
 * (plus optional GITHUB_BASE_BRANCH and GITHUB_API_URL for GitHub Enterprise);
 * null when any required one is missing or malformed.
 */
export function githubConfigFrom(env: NodeJS.ProcessEnv): GitHubRepositoryConfig | null {
  const token = env.GITHUB_TOKEN?.trim();
  const owner = env.GITHUB_REPO_OWNER?.trim();
  const repo = env.GITHUB_REPO_NAME?.trim();
  if (!token || !owner || !repo || !NAME.test(owner) || !NAME.test(repo)) return null;
  const baseBranch = env.GITHUB_BASE_BRANCH?.trim() || undefined;
  if (baseBranch && !BRANCH.test(baseBranch)) return null;
  return { token, owner, repo, baseBranch, apiUrl: (env.GITHUB_API_URL?.trim() || 'https://api.github.com').replace(/\/+$/, '') };
}

/** A branch name from the pull request title, unique per contribution */
export function contributionBranch(title: string): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50).replace(/-+$/, '');
  return `contribution/${slug || 'change'}-${randomUUID().slice(0, 8)}`;
}

class GitHubError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

/**
 * Opens contributions as pull requests through the GitHub REST API: one
 * commit with every file on a new branch from the base branch, then the pull
 * request. The branch is only created once the commit exists, and removed
 * again if the pull request can't be opened.
 */
export class GitHubPullRequests {
  private readonly logger = new Logger(GitHubPullRequests.name);

  constructor(
    private readonly env: NodeJS.ProcessEnv = process.env,
    private readonly fetchImpl: typeof fetch = (input, init) => fetch(input, init),
  ) {}

  private get config(): GitHubRepositoryConfig | null {
    return githubConfigFrom(this.env);
  }

  setup(): PullRequestSetup {
    const config = this.config;
    return config ? { configured: true, repository: `${config.owner}/${config.repo}`, baseBranch: config.baseBranch } : { configured: false };
  }

  isConfigured(): boolean {
    return !!this.config;
  }

  async open(request: { title: string; body: string; commitMessage: string; files: PullRequestFile[] }): Promise<OpenedPullRequest> {
    const config = this.config;
    if (!config) throw new Error('GitHub is not configured');
    const repoPath = `/repos/${config.owner}/${config.repo}`;
    const call = <T>(method: string, path: string, body?: unknown) => this.call<T>(config, method, `${repoPath}${path}`, body);

    try {
      const base = config.baseBranch ?? (await call<{ default_branch: string }>('GET', '')).default_branch;
      const head = await call<{ object: { sha: string } }>('GET', `/git/ref/heads/${encodeBranch(base)}`);
      const baseCommit = await call<{ tree: { sha: string } }>('GET', `/git/commits/${head.object.sha}`);
      const tree = await call<{ sha: string }>('POST', '/git/trees', {
        base_tree: baseCommit.tree.sha,
        tree: request.files.map((file) => ({ path: file.path, mode: '100644', type: 'blob', content: file.content })),
      });
      const commit = await call<{ sha: string }>('POST', '/git/commits', { message: request.commitMessage, tree: tree.sha, parents: [head.object.sha] });
      const branch = contributionBranch(request.title);
      await call('POST', '/git/refs', { ref: `refs/heads/${branch}`, sha: commit.sha });
      try {
        const pull = await call<{ html_url: string; number: number }>('POST', '/pulls', { title: request.title, head: branch, base, body: request.body });
        return { url: pull.html_url, number: pull.number, branch, base, repository: `${config.owner}/${config.repo}` };
      } catch (error) {
        await call('DELETE', `/git/refs/heads/${encodeBranch(branch)}`).catch((cleanup) => this.logger.warn(`Could not delete branch ${branch}: ${cleanup.message}`));
        throw error;
      }
    } catch (error) {
      if (error instanceof GitHubError) throw new BadGatewayException(gitHubMessage(error, `${config.owner}/${config.repo}`));
      this.logger.warn(`GitHub request failed: ${(error as Error).message}`);
      throw new BadGatewayException('GitHub could not be reached, so no pull request was opened. Try again later.');
    }
  }

  private async call<T>(config: GitHubRepositoryConfig, method: string, path: string, body?: unknown): Promise<T> {
    const response = await this.fetchImpl(`${config.apiUrl}${path}`, {
      method,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${config.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'design-system-contributions',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    const text = await response.text();
    if (!response.ok) {
      let message = text.slice(0, 300);
      try {
        message = JSON.parse(text).message ?? message;
      } catch {
        // Not JSON; keep the start of the text
      }
      throw new GitHubError(response.status, message);
    }
    return (text ? JSON.parse(text) : undefined) as T;
  }
}

function encodeBranch(branch: string): string {
  return branch.split('/').map(encodeURIComponent).join('/');
}

function gitHubMessage(error: GitHubError, repository: string): string {
  const prefix = 'No pull request was opened:';
  if (error.status === 401) return `${prefix} GitHub refused the server's token. Ask an administrator to check GITHUB_TOKEN.`;
  if (error.status === 403 || error.status === 404) {
    return `${prefix} the server's token can't write to ${repository} (GitHub said "${error.message}"). Ask an administrator to check its access.`;
  }
  return `${prefix} GitHub answered ${error.status} ("${error.message}").`;
}
