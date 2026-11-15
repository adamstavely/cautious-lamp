# Getting Started: Components

Components are the building blocks of your design system. This guide shows you how to create and manage components.

## What is a Component?

A component is a reusable UI element with:
- **Props**: Configurable properties
- **Variants**: Different visual states
- **Documentation**: Usage guidelines and examples
- **Code**: Implementation code
- **Accessibility**: WCAG compliance information

## Creating a Component

### Via API

`POST /components` needs the `component:create` permission. Give a `workspaceId` to put the component in a workspace (you need the editor role there); without one it joins the shared library. `id` is a kebab-case id, unique across the platform. A signed-in person's token works for both; an API key with `component:create` (unscoped keys have it) can add library components only, because keys can't be workspace members.

```bash
curl -X POST http://localhost:3000/api/v1/components \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "promo-button",
    "name": "Promo button",
    "description": "Button for promotional calls to action",
    "status": "in-progress",
    "workspaceId": "WORKSPACE_ID",
    "props": [
      { "name": "variant", "type": "string", "default": "primary", "options": ["primary", "secondary", "outline"] },
      { "name": "size", "type": "string", "default": "medium", "options": ["small", "medium", "large"] }
    ],
    "code": {
      "html": "<button class=\"btn btn-primary\">Shop now</button>"
    }
  }'
```

`status` is `production`, `in-progress`, `planned` or `deprecated`; `code` takes `vue`, `react` and `html`.

### Via UI

1. Navigate to your workspace
2. Go to the Components section
3. Click "Create Component"
4. Fill in component details
5. Add props and variants
6. Add code implementation
7. Save

## Component Structure

### Basic Information

- **Name**: Component name (e.g., "Button", "Card")
- **Description**: What the component does
- **Category**: Organize by category (forms, layout, navigation, etc.)

### Props

Define configurable properties:

```json
{
  "name": "disabled",
  "type": "boolean",
  "default": false,
  "description": "Whether the button is disabled"
}
```

### Variants

Create visual variants:

- Primary, Secondary, Tertiary
- Small, Medium, Large
- Default, Hover, Active, Disabled

### Code

Add implementation code:

- HTML/CSS
- React/Vue/Angular
- Documentation examples

## Managing Components

### List a workspace's components

Returns `{ components, count }`: the workspace's own components, ones other workspaces shared with it, and global ones. `?status=` filters by status. Workspace routes need a person's token.

```bash
curl "http://localhost:3000/api/v1/workspaces/WORKSPACE_ID/components?status=production" \
  -H "Authorization: Bearer $TOKEN"
```

### Share a component with other workspaces

Only for the workspace's own components:

```bash
curl -X PUT http://localhost:3000/api/v1/workspaces/WORKSPACE_ID/components/COMPONENT_ID/sharing \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "workspaceIds": ["OTHER_WORKSPACE_ID"] }'
```

### Get component details

```bash
curl http://localhost:3000/api/v1/components/COMPONENT_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Change a component

A component's status, deprecation, dependencies and variants each have a route (`component:edit`, and the editor role in the component's workspace):

```bash
curl -X PUT http://localhost:3000/api/v1/components/COMPONENT_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "status": "production" }'
```

See [AUTH.md](./AUTH.md#components-and-workspaces) and [API_REFERENCE.md](./API_REFERENCE.md#design-system-components-and-tokens).

## Component Requests

Request new components through the component request workflow:

1. Navigate to Component Requests
2. Click "Request Component"
3. Fill in details:
   - Component name
   - Description
   - Use cases
   - Priority
4. Submit request
5. Track status (pending, in-progress, completed)

## Component Scaffolding

Use the component scaffolding wizard to generate component boilerplate:

1. Navigate to Component Scaffolding
2. Select component type
3. Configure options
4. Generate code
5. Copy to your project

## Best Practices

1. **Start simple**: Begin with basic components (Button, Input)
2. **Document thoroughly**: Include usage examples and guidelines
3. **Use consistent naming**: Follow your naming conventions
4. **Version components**: Track changes over time
5. **Test accessibility**: Ensure WCAG compliance
6. **Reuse patterns**: Build complex components from simpler ones

## Next Steps

- [Token Setup Guide](./GETTING_STARTED_TOKENS.md) - Use tokens in components
- [Patterns guidance](../frontend/public/docs/patterns.md) - Combine components into patterns (in the app at `/patterns`)
- [Component Request Workflow](./COMPONENT_REQUEST_WORKFLOW_ANALYSIS.md) - Learn about the request process

