# Getting Started: Design Tokens

Design tokens are the foundational values of your design system - colors, spacing, typography, shadows, and more.

## What are Design Tokens?

Design tokens are:
- **Color values**: Primary, secondary, neutral colors
- **Spacing**: Margins, padding, gaps
- **Typography**: Font families, sizes, weights, line heights
- **Shadows**: Elevation and depth
- **Border radius**: Corner rounding
- **And more**: Any design value that should be consistent

## Creating Tokens

Tokens belong to a workspace and are workspace items: `/workspaces/:id/resources/tokens`. Creating, changing and deleting them needs the editor role in the workspace, and the workspace routes need a person's access token (`$TOKEN`, from `POST /auth/login`): API keys can't be workspace members. See [GETTING_STARTED.md](./GETTING_STARTED.md#7-create-an-api-key) for getting a token.

### Via API

```bash
curl -X POST http://localhost:3000/api/v1/workspaces/WORKSPACE_ID/resources/tokens \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "color.primary",
    "value": "#0066CC",
    "type": "color",
    "category": "colors"
  }'
```

### Via UI

1. Navigate to your workspace
2. Go to the Tokens section
3. Click "Create Token"
4. Select token type (color, spacing, typography, etc.)
5. Enter name and value
6. Save

## Token Types

### Colors

```json
{
  "name": "color.primary",
  "value": "#0066CC",
  "type": "color",
  "category": "colors"
}
```

### Spacing

```json
{
  "name": "spacing.small",
  "value": "8px",
  "type": "spacing",
  "category": "spacing"
}
```

### Typography

```json
{
  "name": "typography.fontFamily.primary",
  "value": "Inter, sans-serif",
  "type": "typography",
  "category": "typography"
}
```

### Shadows

```json
{
  "name": "shadow.elevation.1",
  "value": "0 1px 3px rgba(0,0,0,0.12)",
  "type": "shadow",
  "category": "shadows"
}
```

## Token Organization

### Naming Convention

Use a hierarchical naming structure:

- `color.primary`
- `color.primary.hover`
- `color.primary.active`
- `spacing.small`
- `spacing.medium`
- `spacing.large`

### Categories

Organize tokens by category:
- Colors
- Spacing
- Typography
- Shadows
- Border Radius
- Custom

## Token Sync

Synchronize tokens with external tools:

### Style Dictionary

Export the tokens the workspace can read (its own, ones shared with it, and global ones) as a [Style Dictionary](https://styledictionary.com) source file:

```bash
curl http://localhost:3000/api/v1/workspaces/WORKSPACE_ID/resources/tokens/export/style-dictionary \
  -H "Authorization: Bearer $TOKEN" > tokens/workspace.json
```

Dotted names become nested groups, and a token's `description` becomes its `comment`:

```json
{
  "color": {
    "primary": {
      "DEFAULT": { "value": "#0066CC", "type": "color" },
      "hover": { "value": "#0055AA", "type": "color" }
    }
  },
  "spacing": {
    "small": { "value": "8px", "type": "spacing" }
  }
}
```

- A token whose name is also a group (`color.primary` next to `color.primary.hover`) goes under `DEFAULT` in that group.
- If two tokens have the same name, the workspace's own wins over a shared or global one.
- `?filter=colors` exports one category.

Point Style Dictionary's `source` at the file and build your platforms from it.

### Figma and Penpot

Pull tokens from a Figma or Penpot file on the **Token sync** page (`/tokens/sync`): save a connection with an access token, pull, review the diff and apply the changes you choose. See [Token and design sync](./TOKEN_SYNC.md).

### Adobe XD

Not supported: Adobe has discontinued the XD plugin and cloud document APIs a sync would read from.

## Managing Tokens

### List Tokens

Returns an array of the workspace's tokens, tokens shared with it, and global tokens:

```bash
curl http://localhost:3000/api/v1/workspaces/WORKSPACE_ID/resources/tokens \
  -H "Authorization: Bearer $TOKEN"
```

### Filter Tokens

`?filter=` matches the token's `category`:

```bash
curl "http://localhost:3000/api/v1/workspaces/WORKSPACE_ID/resources/tokens?filter=colors" \
  -H "Authorization: Bearer $TOKEN"
```

### Update Token

`PATCH` with only the fields to change:

```bash
curl -X PATCH http://localhost:3000/api/v1/workspaces/WORKSPACE_ID/resources/tokens/TOKEN_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "#0077DD"
  }'
```

## Using Tokens in Components

Reference tokens in component code:

```html
<button style="background-color: var(--color-primary); padding: var(--spacing-medium);">
  Click me
</button>
```

## Best Practices

1. **Use semantic names**: `color.primary` not `color.blue`
2. **Create aliases**: Reference tokens from other tokens
3. **Version tokens**: Track changes over time
4. **Document usage**: Explain when to use each token
5. **Sync regularly**: Keep tokens in sync with design tools
6. **Test accessibility**: Ensure color contrast meets WCAG standards

## Next Steps

- [Component Creation Guide](./GETTING_STARTED_COMPONENTS.md) - Use tokens in components
- [Token Sync Documentation](./TOKEN_SYNC.md) - Learn about token synchronization
- [Color Palette Guide](./docs/colors.md) - Detailed color token management

