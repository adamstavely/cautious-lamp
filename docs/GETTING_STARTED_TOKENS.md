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

### Via API

```bash
curl -X POST http://localhost:3000/api/v1/workspaces/WORKSPACE_ID/tokens \
  -H "Authorization: Bearer YOUR_API_KEY" \
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

Export tokens in Style Dictionary format:

```bash
curl http://localhost:3000/api/v1/workspaces/WORKSPACE_ID/tokens/export/style-dictionary \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Figma

Sync tokens with Figma using the Figma plugin.

### Adobe XD

Sync tokens with Adobe XD using the XD plugin.

## Managing Tokens

### List Tokens

```bash
curl http://localhost:3000/api/v1/workspaces/WORKSPACE_ID/tokens \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Filter Tokens

```bash
curl "http://localhost:3000/api/v1/workspaces/WORKSPACE_ID/tokens?category=colors&type=color" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Update Token

```bash
curl -X PUT http://localhost:3000/api/v1/workspaces/WORKSPACE_ID/tokens/TOKEN_ID \
  -H "Authorization: Bearer YOUR_API_KEY" \
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

