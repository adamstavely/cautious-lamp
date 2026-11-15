# Design System MCP Server

Model Context Protocol (MCP) server for the Design System Platform. This server exposes design system resources (tokens, components, patterns, compliance rules, design assets, reviews, and documentation) to AI assistants via the Model Context Protocol.

## Overview

The MCP server provides a standardized interface for AI assistants to interact with the design system, enabling them to:
- Query design tokens, components, and patterns
- Access design system documentation
- Retrieve design assets and reviews
- Run compliance scans
- Search and filter design system resources

## Installation

The server is published to GitHub Packages under the `@adamstavely` scope. Tell npm where that scope lives (`~/.npmrc`):

```ini
@adamstavely:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN` is a GitHub personal access token (classic) with the `read:packages` scope. Then:

```bash
npm install -g @adamstavely/design-system-mcp-server   # installs the design-system-mcp command
```

From a checkout instead: `npm ci` at the repository root, then `npm run build --workspace mcp-server`; the entry point is `mcp-server/dist/index.js`.

## Configuration

The server requires the following environment variables:

- `MCP_API_BASE_URL` - Backend API base URL (default: `http://localhost:3000/api/v1`)
- `MCP_API_KEY` - API key for authentication (required)
- `MCP_DOCS_DIRS` - Optional: directories of Markdown to serve as documentation resources, separated by `:` (`;` on Windows). See [Documentation resources](#documentation-resources).

## Usage

### Running the Server

The server runs as a standalone process using stdio transport:

```bash
npm start
```

Or in development mode:

```bash
npm run dev
```

### MCP Client Configuration

Configure the MCP server in your MCP client (e.g., Cursor, Claude Desktop):

#### Cursor Configuration

Add to your Cursor settings (`.cursor/mcp.json` or similar):

```json
{
  "mcpServers": {
    "design-system": {
      "command": "design-system-mcp",
      "env": {
        "MCP_API_BASE_URL": "http://localhost:3000/api/v1",
        "MCP_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

From a checkout, use `"command": "node"` and `"args": ["/path/to/cautious-lamp/mcp-server/dist/index.js"]` instead.

#### Claude Desktop Configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or similar:

```json
{
  "mcpServers": {
    "design-system": {
      "command": "design-system-mcp",
      "env": {
        "MCP_API_BASE_URL": "http://localhost:3000/api/v1",
        "MCP_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Available Tools

### Tokens

- **`get_tokens`** - Retrieve all tokens with optional filters (category, type, tag)
- **`get_token`** - Get a specific token by name
- **`search_tokens`** - Search tokens by name or description

### Components

- **`get_components`** - Retrieve all components with optional status filter
- **`get_component`** - Get a specific component by ID with full details
- **`get_component_code`** - Get component code in specified format (vue/react/html)
- **`search_components`** - Search components by name or description

### Patterns

- **`get_patterns`** - Retrieve all patterns with optional filters (category, tags, search)
- **`get_pattern`** - Get a specific pattern by ID
- **`get_patterns_by_component`** - Get patterns that use a specific component

### Compliance

- **`get_compliance_rules`** - List all compliance rules
- **`scan_component`** - Run a compliance scan of one component (the backend scans just that component, `componentIds`; an id the key can't read is an error)
- **`export_rules`** - Export rules for linter integration

### Assets

- **`get_assets`** - Retrieve all assets for a workspace with optional type filter
- **`get_icons`** - Get all icons for a workspace with optional iconSet filter
- **`get_asset_by_id`** - Get a specific asset by workspace and asset ID
- **`search_assets`** - Search assets by name, description, or tags
- **`get_asset_types`** - List the asset types the backend accepts, read from `GET /api/v1/resources` (the item kinds list)

### Reviews

- **`get_reviews`** - List design reviews with an optional workflow state filter
- **`get_review`** - Get a specific review by ID (with password if protected)
- **`create_review`** - Create a new design review from a URL
- **`update_review`** - Approve/reject a workflow stage, move to client or art director review, resubmit, complete, or update sharing (`action` selects which)
- **`search_reviews`** - Search reviews by filename, title, description, or designer
- **`get_review_comments`** - Get the comments on a review, optionally for one version
- **`add_review_comment`** - Add a comment to a review

## Available Resources

### Documentation Resources

Markdown files are served as `design-system://docs/<path>` (without `.md`) from two places: the platform docs (`docs/` at the repository root) and the design system guides (`frontend/docs/`). When both have a file at the same path, `docs/` wins.

Examples:
- `design-system://docs/GETTING_STARTED` - Getting started guide (`docs/GETTING_STARTED.md`)
- `design-system://docs/API_REFERENCE` - API reference (`docs/API_REFERENCE.md`)
- `design-system://docs/index` - Design system guide index (`frontend/docs/index.md`)

Where the files are read from:
1. `MCP_DOCS_DIRS`, when set.
2. The repository the server runs from: it looks for `docs/` and `frontend/docs/` above its own files, so `node /path/to/mcp-server/dist/index.js` finds them from any working directory.
3. The copies in the installed package (`bundled-docs/`), which `npm pack` and `npm publish` make with `npm run bundle-docs`.

With none of these, the server lists no documentation resources.

### Design System Resources

Design system data resources provide JSON-formatted access to design system data:

- `design-system://tokens` - All design tokens
- `design-system://components` - All components
- `design-system://patterns` - All patterns
- `design-system://tokens/categories` - List of token categories
- `design-system://components/status` - Component status summary

## Development

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Project Structure

```
mcp-server/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── config.ts              # Configuration management
│   ├── api-client.ts          # HTTP client for backend API
│   ├── tools/                 # MCP tool implementations
│   │   ├── tokens.tool.ts
│   │   ├── components.tool.ts
│   │   ├── patterns.tool.ts
│   │   ├── compliance.tool.ts
│   │   ├── assets.tool.ts
│   │   └── reviews.tool.ts
│   └── resources/             # MCP resource implementations
│       ├── documentation.resource.ts
│       └── design-system.resource.ts
├── scripts/bundle-docs.js     # Copies the docs into bundled-docs/ for the published package
├── package.json
├── tsconfig.json
└── README.md
```

## API Integration

The MCP server connects to the following backend API endpoints:

- `GET /api/v1/tokens` - Token retrieval
- `GET /api/v1/components` - Component retrieval
- `GET /patterns-library/patterns` - Pattern retrieval
- `GET /api/v1/rules/export` - Compliance rules export
- `POST /api/v1/compliance/scan` - Compliance scanning (`scope: 'design-system'`, `componentIds: [id]`)
- `GET /api/v1/resources` - Workspace item kinds, with each kind's filter values (asset types)
- `GET /api/v1/workspaces/:id/resources/assets?filter=<type>` - Asset retrieval
- `GET /api/v1/workspaces/:id/resources/assets/:assetId` - One asset
- `GET /api/v1/workspaces/:id/resources/icons?filter=<iconSet>` - Icon retrieval
- `GET /api/v1/reviews` - Review list
- `GET /api/v1/review/:id` - Review retrieval
- `POST /api/v1/review/create-from-url` - Create review
- `POST /api/v1/review/:id/workflow/{approve,reject,move-to-client-review,move-to-art-director-review,resubmit}` - Workflow changes
- `POST /api/v1/review/:id/complete`, `POST /api/v1/review/:id/sharing` - Complete review, update sharing
- `GET /api/v1/review/:id/comments`, `POST /api/v1/review/:id/comments` - Review comments

The patterns library is mounted at the server root, so the server derives its URL from
`MCP_API_BASE_URL` by dropping the trailing `/api/vN`.

`test/unit/backend-contract.test.ts` checks every tool's requests against the routes declared in
`backend/src/**/*.controller.ts`, so a tool that drifts from the backend fails the tests.

Only `GET` requests are retried (on timeouts, network errors and 408/429/5xx). `POST`, `PUT` and
`DELETE` are sent once, so a timed-out create is never duplicated.

## Error Handling

The server includes comprehensive error handling:
- API errors are caught and returned with descriptive messages
- Tool arguments are validated (zod); missing or invalid arguments return an `isError` result
- Logs go to stderr only, since stdout carries the MCP JSON-RPC stream
- Resource access errors are handled gracefully

## Releasing

`.github/workflows/release.yml` publishes the package on a `mcp-server-v<version>` tag that matches `package.json`, or when the **Release** workflow is run with `package=mcp-server` (see "Publishing packages" in [the CLI README](../cli/README.md#publishing-packages)).

## License

MIT


