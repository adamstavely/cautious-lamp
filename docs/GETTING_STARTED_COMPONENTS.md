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

```bash
curl -X POST http://localhost:3000/api/v1/workspaces/WORKSPACE_ID/components \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Button",
    "description": "Primary button component",
    "category": "forms",
    "props": [
      {
        "name": "variant",
        "type": "string",
        "default": "primary",
        "options": ["primary", "secondary", "outline"]
      },
      {
        "name": "size",
        "type": "string",
        "default": "medium",
        "options": ["small", "medium", "large"]
      }
    ],
    "code": "<button class=\"btn btn-{{variant}} btn-{{size}}\">{{children}}</button>"
  }'
```

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

### List Components

```bash
curl http://localhost:3000/api/v1/workspaces/WORKSPACE_ID/components \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Get Component Details

```bash
curl http://localhost:3000/api/v1/workspaces/WORKSPACE_ID/components/COMPONENT_ID \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Update Component

```bash
curl -X PUT http://localhost:3000/api/v1/workspaces/WORKSPACE_ID/components/COMPONENT_ID \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description"
  }'
```

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
- [Patterns Library](./GETTING_STARTED_PATTERNS.md) - Combine components into patterns
- [Component Request Workflow](./COMPONENT_REQUEST_WORKFLOW_ANALYSIS.md) - Learn about the request process

