# Design System CLI

`ds`, a command-line interface for the Design System API, built on [`@adamstavely/design-system-sdk`](../sdk/README.md).

## Installation

The CLI is published to GitHub Packages under the `@adamstavely` scope. Tell npm where that scope lives, in `~/.npmrc` for a global install:

```ini
@adamstavely:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN` is a GitHub personal access token (classic) with the `read:packages` scope. Then:

```bash
npm install -g @adamstavely/design-system-cli
ds --help
```

From a checkout instead: `npm ci` at the repository root, `npm run build --workspace sdk && npm run build --workspace cli`, then `node cli/dist/cli.js`.

## Configuration

```bash
ds config set apiKey YOUR_API_KEY
ds config set baseURL https://design.example.com/api/v1   # default: http://localhost:3000/api/v1
ds config list                                           # effective settings and where each comes from
```

Settings are stored in `~/.designsystem/config.json` (mode 0600). Environment variables override the file:

```bash
export DS_API_KEY=YOUR_API_KEY
export DS_API_URL=https://design.example.com/api/v1
export DS_API_TIMEOUT=30000   # request timeout in ms (optional)
```

Valid config keys are `apiKey` and `baseURL`. The API key is never printed in full (`ds config get apiKey` and `ds config list` show a masked value).

## Commands

| Command | Request | Notes |
| --- | --- | --- |
| `ds tokens [-c <category>] [-t <type>] [--tag <tag>] [-f table\|json]` | `GET /tokens` | |
| `ds token <name>` | `GET /tokens/:name` | |
| `ds components [-s <status>] [-f table\|json]` | `GET /components` | |
| `ds component <id> [-c vue\|react\|html\|none]` | `GET /components/:id` | |
| `ds health` | `GET /health` | No API key needed. Exits 1 when the API reports itself unavailable (Elasticsearch down). |
| `ds compliance [-s design-system\|applications] [-a <appId>] [--components <ids>] [-c <categories>] [-f table\|json]` | `POST /compliance/scan` | The design-system scope needs component:view; `--components button,card` scans only those. The applications scope scans one application (`-a`) and **needs an API key with admin:governance**. |
| `ds scan -a <appId> (--url <url> \| --html/--css/--js <file>) [-c <categories>] [-f table\|json]` | `POST /compliance/scan-application` | **Needs an API key with admin:governance.** A key without it gets a 403, and the CLI says which permission is missing. |
| `ds register -n <name> [-w <workspaceId>] [-u <url>] [-r <repo>] [-d <text>] [-v <version>]` | `POST /applications/register` | `-w` is required unless the API key has admin:governance. `-u` is the URL scans fetch when given no code. |
| `ds applications [--team <id>] [--capability <name>] [-f table\|json]` | `GET /applications` | |
| `ds validate [-t tokens\|components\|all] [-f <file.json>]` | `GET /tokens`, `GET /components` | With `-f`, checks a local JSON file instead and calls nothing. |
| `ds scaffold component\|token -n <name> [--framework vue\|react] [-d <dir>] [--force] [--dry-run]` | none | See below. |
| `ds migrate -c <id> [--framework vue\|react\|html] [-d <dir>] [--force] [--dry-run]` | `GET /components/:id` | See below. |
| `ds config set\|get\|unset <key>`, `ds config list` | none | |

### `ds scaffold`

Writes starter files from templates built into the CLI: a component in `<dir>/src/components/<name>/` (the component and a test, Vue or React) or a token in `<dir>/tokens/<name>.json`. It works offline: it doesn't call the API, and nothing is registered in the design system. To generate a component with the platform's own generator (props, events, tokens) and register it, use the scaffolding page in the app or `POST /api/v1/component-scaffolding/scaffold` and `/create`.

### `ds migrate`

Writes a component's **current** source from the API (`GET /components/:id`) into `<dir>/src/components/<id>/`. The API serves only the current version of a component, so there are no `--from`/`--to` options.

`scaffold` and `migrate` never overwrite existing files unless `--force` is given.

## Publishing packages

Nothing publishes on merge. `.github/workflows/release.yml` publishes one package to GitHub Packages when a maintainer either:

- pushes a tag `<package>-v<version>` that matches the package's `package.json` version, for example `git tag cli-v1.0.0 && git push origin cli-v1.0.0`; or
- runs the **Release** workflow from the Actions tab (or `gh workflow run release.yml -f package=cli`) and picks the package.

The packages are `sdk`, `cli`, `mcp-server`, `eslint-plugin`, `loupe-tool` and `breakpoint-overlay`. The workflow builds and tests the package, skips a version that is already published, and publishes with the repository's `GITHUB_TOKEN`. Publish `sdk` before the first `cli` release, since the CLI depends on it. To release a new version, bump `version` in the package's `package.json` in a PR, merge it, then tag.

## Development

```bash
npm run build   # needs the SDK built first: npm run build --workspace sdk
npm test        # builds, then runs the dist/cli.js bin against a mock API
```
