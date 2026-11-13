# Design System CLI

Command-line interface for the Design System API.

## Installation

```bash
npm install -g @designsystem/cli
```

## Configuration

Set your API key:

```bash
ds config set apiKey YOUR_API_KEY
```

Or use environment variables (these override `~/.designsystem/config.json`):

```bash
export DS_API_KEY=YOUR_API_KEY
export DS_API_URL=https://your-host/api/v1   # default: http://localhost:3000/api/v1
export DS_API_TIMEOUT=30000                   # request timeout in ms (optional)
```

Valid config keys are `apiKey` and `baseURL`. The API key is never printed in
full (`ds config get apiKey` and `ds config list` show a masked value).

## Usage

### Tokens

```bash
# List all tokens
ds tokens

# Filter tokens by category
ds tokens --category colors

# Filter tokens by type
ds tokens --type color

# Get a specific token
ds token color.primary

# Output as JSON
ds tokens --format json
```

### Components

```bash
# List all components
ds components

# Filter by status
ds components --status production

# Get a specific component
ds component button

# Show React code
ds component button --code react

# Output as JSON
ds components --format json
```

### Health Check

```bash
ds health
```

## Commands

- `ds tokens` - List tokens
- `ds token <name>` - Get a specific token
- `ds components` - List components
- `ds component <id>` - Get a specific component
- `ds health` - Check API health
- `ds config set|get|unset <key>` / `ds config list` - Manage configuration
- `ds compliance` / `ds scan -a <appId>` - Run compliance scans
- `ds register -n <name> [-r <repo>] [-v <version>]` / `ds applications` - Manage applications
- `ds validate [-t tokens|components|all] [-f file.json]` - Validate tokens/components
- `ds scaffold component|token -n <name> [--framework vue|react] [-d <dir>] [--force] [--dry-run]` -
  Write a component (`src/components/<name>/`) or token (`tokens/<name>.json`) into `<dir>` (default: cwd)
- `ds migrate -c <id> [--framework vue|react|html] [-d <dir>] [--force] [--dry-run]` -
  Write the component's current source from the API into `<dir>/src/components/<id>/`

`scaffold` and `migrate` never overwrite existing files unless `--force` is given.

