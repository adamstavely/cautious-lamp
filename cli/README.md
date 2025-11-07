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

Or use environment variable:

```bash
export DS_API_KEY=YOUR_API_KEY
```

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
- `ds config set <key> <value>` - Set configuration
- `ds config get <key>` - Get configuration

