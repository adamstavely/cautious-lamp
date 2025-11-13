# Getting Started: Workspaces

Workspaces are the top-level containers for organizing your design system resources.

## What is a Workspace?

A workspace is a collection of:
- Design tokens
- Components
- Patterns
- Assets (fonts, icons, illustrations)
- Applications
- Integrations (Argos, OpenReplay)

## Creating a Workspace

### Via API

```bash
curl -X POST http://localhost:3000/api/v1/workspaces \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Design System",
    "description": "Main design system workspace"
  }'
```

### Via UI

1. Navigate to the Workspaces page
2. Click "Create Workspace"
3. Enter workspace name and description
4. Click "Create"

## Workspace Configuration

### Basic Settings

- **Name**: Display name for the workspace
- **Description**: Optional description
- **Team**: Associate with a team (if using team features)

### Design Tokens

Configure design tokens in your workspace:

See [GETTING_STARTED_TOKENS.md](./GETTING_STARTED_TOKENS.md) for detailed token setup.

### Applications

Register applications that use your design system:

```bash
curl -X POST http://localhost:3000/api/v1/applications \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Marketing Site",
    "repository": "https://github.com/company/marketing-site",
    "version": "1.0.0",
    "designSystemVersion": "2.0.0"
  }'
```

## Managing Workspaces

### List Workspaces

```bash
curl http://localhost:3000/api/v1/workspaces \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Get Workspace Details

```bash
curl http://localhost:3000/api/v1/workspaces/WORKSPACE_ID \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Update Workspace

```bash
curl -X PUT http://localhost:3000/api/v1/workspaces/WORKSPACE_ID \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "description": "Updated description"
  }'
```

## Workspace Resources

### Components

Manage components within a workspace. See [GETTING_STARTED_COMPONENTS.md](./GETTING_STARTED_COMPONENTS.md).

### Patterns

Create and manage design patterns. Patterns are reusable combinations of components.

### Assets

Upload and manage:
- Fonts
- Icons
- Illustrations
- Stock photos
- Logos

### Integrations

Configure external service integrations:
- **Argos**: Visual regression testing
- **OpenReplay**: Session replay and analytics

## Best Practices

1. **One workspace per design system**: Keep related resources together
2. **Use descriptive names**: Make workspace purpose clear
3. **Organize by team**: Create separate workspaces for different teams if needed
4. **Version your tokens**: Track token changes over time
5. **Register applications**: Track which applications use your design system

## Next Steps

- [Component Creation Guide](./GETTING_STARTED_COMPONENTS.md)
- [Token Setup Guide](./GETTING_STARTED_TOKENS.md)
- [Visual Regression Setup](./GETTING_STARTED_VISUAL_REGRESSION.md)

