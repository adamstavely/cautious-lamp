# Component Scaffolding Wizard - Examples & Reasoning

## Overview

A Component Scaffolding Wizard is an interactive, step-by-step tool that guides developers through creating new design system components. It generates boilerplate code, ensures consistency, and follows best practices automatically.

## Why a Scaffolding Wizard?

### 1. **Consistency Across Components**
- Ensures all components follow the same structure
- Enforces naming conventions automatically
- Standardizes file organization
- Maintains code quality standards

### 2. **Reduces Boilerplate**
- Generates all necessary files automatically
- Creates component, test, story, and doc files
- Sets up proper imports and exports
- Configures TypeScript/PropTypes

### 3. **Best Practices Built-In**
- Enforces accessibility patterns
- Includes proper TypeScript types
- Sets up testing structure
- Adds documentation templates

### 4. **Faster Development**
- Reduces setup time from hours to minutes
- Eliminates copy-paste errors
- Provides templates for common patterns
- Auto-generates common component variants

### 5. **Onboarding New Developers**
- Guides new team members through component creation
- Teaches design system patterns
- Reduces learning curve
- Ensures quality from day one

## Interactive Wizard Flow

### Example: Creating a Button Component

```bash
$ ds scaffold component

┌─────────────────────────────────────────────────┐
│  Component Scaffolding Wizard                   │
│  Let's create a new component!                  │
└─────────────────────────────────────────────────┘

? Component name: Button
? Component category: (Use arrow keys)
  ❯ Form Controls
    Navigation
    Data Display
    Feedback
    Layout
    Utilities

? Framework: (Use arrow keys)
  ❯ Vue 3
    React
    Both

? Component type: (Use arrow keys)
  ❯ Primitive (basic UI element)
    Composite (combines primitives)
    Layout (container/wrapper)
    Utility (helper component)

? Description: A button component for user actions

? Variants: (Press <space> to select, <a> to toggle all)
  ❯◉ Primary
  ◉ Secondary
  ◉ Outline
  ◉ Ghost
  ◉ Danger
  ◉ Success

? Sizes: (Press <space> to select)
  ❯◉ Small
  ◉ Medium
  ◉ Large

? States: (Press <space> to select)
  ❯◉ Default
  ◉ Hover
  ◉ Active
  ◉ Disabled
  ◉ Loading

? Props: (Add props interactively)
  ? Add a prop? (Y/n) y
  ? Prop name: label
  ? Prop type: string
  ? Required? (Y/n) y
  ? Default value: (none)
  ? Description: Button label text
  
  ? Add another prop? (Y/n) y
  ? Prop name: onClick
  ? Prop type: function
  ? Required? (Y/n) n
  ? Default value: (none)
  ? Description: Click handler function
  
  ? Add another prop? (Y/n) n

? Accessibility features: (Press <space> to select)
  ❯◉ ARIA labels
  ◉ Keyboard navigation
  ◉ Focus management
  ◉ Screen reader support

? Include tests? (Y/n) y
  ? Test framework: (Use arrow keys)
    ❯ Vitest
      Jest
      Both

? Include Storybook stories? (Y/n) y

? Include documentation? (Y/n) y

? Generate component preview? (Y/n) y

Generating component files...
✓ Created src/components/Button/Button.vue
✓ Created src/components/Button/Button.test.ts
✓ Created src/components/Button/Button.stories.ts
✓ Created src/components/Button/README.md
✓ Created src/components/Button/index.ts
✓ Created src/components/Button/types.ts
✓ Created src/components/Button/styles.css

Component 'Button' created successfully! 🎉

Next steps:
  1. Review generated files
  2. Customize component logic
  3. Add component to design system: ds component add Button
  4. Test component: npm test Button
```

## Example Scenarios

### Scenario 1: Simple Primitive Component (Button)

**Input**:
- Name: Button
- Category: Form Controls
- Framework: Vue 3
- Variants: Primary, Secondary, Outline
- Sizes: Small, Medium, Large
- Props: label (string, required), onClick (function), disabled (boolean)

**Generated Files**:
```
Button/
├── Button.vue              # Main component
├── Button.test.ts         # Unit tests
├── Button.stories.ts      # Storybook stories
├── Button.types.ts        # TypeScript types
├── Button.styles.css      # Component styles
├── index.ts               # Exports
└── README.md              # Documentation
```

**Generated Component Structure**:
```vue
<template>
  <button
    :class="[
      'button',
      `button--${variant}`,
      `button--${size}`,
      { 'button--disabled': disabled }
    ]"
    :disabled="disabled"
    @click="handleClick"
    :aria-label="ariaLabel || label"
  >
    <span v-if="loading" class="button__loader"></span>
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type { ButtonProps, ButtonEmits } from './Button.types';

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'medium',
  disabled: false,
  loading: false
});

const emit = defineEmits<ButtonEmits>();

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>
```

### Scenario 2: Composite Component (Card)

**Input**:
- Name: Card
- Category: Layout
- Framework: React
- Variants: Default, Elevated, Outlined
- Props: title (string), children (ReactNode), footer (ReactNode), onClick (function)

**Generated Files**:
```
Card/
├── Card.tsx               # Main component
├── Card.test.tsx          # Unit tests
├── Card.stories.tsx       # Storybook stories
├── Card.types.ts          # TypeScript types
├── Card.module.css        # Component styles
├── index.ts               # Exports
└── README.md              # Documentation
```

**Generated Component Structure**:
```tsx
import React from 'react';
import styles from './Card.module.css';
import type { CardProps } from './Card.types';

export const Card: React.FC<CardProps> = ({
  title,
  children,
  footer,
  variant = 'default',
  onClick,
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.card} ${styles[`card--${variant}`]} ${className || ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {title && (
        <div className={styles.card__header}>
          <h3 className={styles.card__title}>{title}</h3>
        </div>
      )}
      <div className={styles.card__body}>{children}</div>
      {footer && <div className={styles.card__footer}>{footer}</div>}
    </div>
  );
};
```

### Scenario 3: Form Component (Input)

**Input**:
- Name: Input
- Category: Form Controls
- Framework: Both (Vue & React)
- Variants: Text, Email, Password, Number
- States: Default, Error, Success, Disabled
- Props: value, onChange, label, placeholder, error, helperText

**Generated Files**:
```
Input/
├── Input.vue              # Vue component
├── Input.tsx              # React component
├── Input.test.ts          # Unit tests (both)
├── Input.stories.ts       # Storybook stories
├── Input.types.ts         # TypeScript types
├── Input.styles.css       # Shared styles
├── index.ts               # Exports
└── README.md              # Documentation
```

## Advanced Features

### 1. **Template Library**

Pre-built templates for common component patterns:

```bash
? Use a template? (Y/n) y
? Select template: (Use arrow keys)
  ❯ Form Input
    Navigation Item
    Data Table
    Modal/Dialog
    Toast/Notification
    Empty State
    Loading State
    Error State
```

**Example: Form Input Template**
- Pre-configured with validation
- Error handling built-in
- Accessibility features included
- Common props pre-defined

### 2. **Pattern Recognition**

Wizard suggests patterns based on component name:

```bash
Component name: Modal
✓ Detected pattern: Overlay/Dialog
  Suggested props: isOpen, onClose, title, children
  Suggested variants: Default, Fullscreen, Centered
  Suggested accessibility: Focus trap, Escape key handler
```

### 3. **Component Composition**

Wizard helps compose complex components from primitives:

```bash
? Component composition: (Use arrow keys)
  ❯ Standalone component
    Composed from primitives
      → Select primitives: [Button, Input, Card]
      → Define composition logic
```

### 4. **Design Token Integration**

Automatically uses design tokens:

```bash
✓ Detected color tokens: primary, secondary, error
✓ Detected spacing tokens: sm, md, lg
✓ Detected typography tokens: body, heading
✓ Generated component using design tokens
```

### 5. **Accessibility Checklist**

Interactive accessibility setup:

```bash
? Accessibility features:
  ✓ ARIA labels
  ✓ Keyboard navigation (Arrow keys, Enter, Escape)
  ✓ Focus management
  ✓ Screen reader announcements
  ✓ Color contrast compliance
  ✓ Touch target sizes (min 44x44px)
```

### 6. **Testing Scaffold**

Generates comprehensive test structure:

```bash
? Test coverage: (Use arrow keys)
  ❯ Basic (rendering, props)
    Standard (interactions, events)
    Comprehensive (edge cases, accessibility)
    Custom (specify test cases)
```

**Generated Tests Include**:
- Component rendering
- Prop validation
- Event handling
- Accessibility checks
- Edge cases
- Snapshot tests

### 7. **Documentation Generation**

Auto-generates documentation:

```bash
? Documentation format: (Press <space> to select)
  ❯◉ Markdown README
  ◉ JSDoc comments
  ◉ Storybook docs
  ◉ API reference
```

**Generated Documentation**:
- Component description
- Props table
- Usage examples
- Variants showcase
- Accessibility notes
- Migration guide (if updating)

### 8. **Integration with Design System**

Automatically registers component:

```bash
✓ Component created successfully!
? Register with design system? (Y/n) y
  → Uploading component metadata...
  → Creating component entry...
  → Generating component ID...
  ✓ Component registered: button-v1.0.0
```

## Wizard Modes

### 1. **Interactive Mode** (Default)
Step-by-step guided experience:
```bash
ds scaffold component --interactive
```

### 2. **Quick Mode**
Minimal prompts, sensible defaults:
```bash
ds scaffold component Button --quick
```

### 3. **Template Mode**
Use pre-built template:
```bash
ds scaffold component --template form-input
```

### 4. **Config Mode**
Use configuration file:
```bash
ds scaffold component --config component.config.json
```

### 5. **CLI Mode**
All options via flags:
```bash
ds scaffold component Button \
  --framework vue \
  --category form-controls \
  --variants primary,secondary \
  --sizes sm,md,lg \
  --props label:string,onClick:function \
  --tests \
  --stories
```

## Configuration File Example

```json
{
  "component": {
    "name": "Button",
    "category": "form-controls",
    "framework": "vue",
    "description": "A button component for user actions",
    "variants": ["primary", "secondary", "outline"],
    "sizes": ["sm", "md", "lg"],
    "states": ["default", "hover", "active", "disabled", "loading"],
    "props": [
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Button label text"
      },
      {
        "name": "onClick",
        "type": "function",
        "required": false,
        "description": "Click handler function"
      }
    ],
    "accessibility": {
      "ariaLabels": true,
      "keyboardNavigation": true,
      "focusManagement": true
    },
    "tests": {
      "framework": "vitest",
      "coverage": "comprehensive"
    },
    "stories": true,
    "documentation": true
  }
}
```

## Benefits Summary

### For Developers
- ✅ **Faster**: Create components in minutes, not hours
- ✅ **Consistent**: All components follow same structure
- ✅ **Quality**: Best practices built-in
- ✅ **Learning**: Teaches design system patterns

### For Teams
- ✅ **Standardization**: Everyone follows same conventions
- ✅ **Onboarding**: New developers productive faster
- ✅ **Maintainability**: Easier to understand and modify
- ✅ **Documentation**: Always up-to-date

### For Design System
- ✅ **Consistency**: All components structured similarly
- ✅ **Quality**: Accessibility and best practices enforced
- ✅ **Documentation**: Auto-generated and maintained
- ✅ **Testing**: Test structure included from start

## Real-World Examples

### Angular CLI Component Generator
```bash
ng generate component button
```
- Generates component files
- Sets up module imports
- Creates test files
- Follows Angular conventions

### React Create Component
```bash
create-react-component Button
```
- Generates component structure
- Sets up TypeScript
- Creates test files
- Adds Storybook stories

### Vue CLI Component Generator
```bash
vue generate component Button
```
- Generates Vue component
- Sets up composition API
- Creates test files
- Adds documentation

## Integration Points

### 1. **Design System API**
- Register new component automatically
- Upload component metadata
- Generate component ID
- Create component entry

### 2. **Version Control**
- Initialize git repository
- Create initial commit
- Set up branch protection
- Configure CI/CD

### 3. **Package Management**
- Update package.json
- Add dependencies
- Configure exports
- Set up build scripts

### 4. **Documentation System**
- Generate component docs
- Add to component library
- Create usage examples
- Update navigation

### 5. **Testing Infrastructure**
- Configure test runner
- Set up test utilities
- Create test fixtures
- Configure coverage

## Advanced Use Cases

### 1. **Migrating Existing Components**
```bash
ds scaffold migrate --from old-component --to new-component
```
- Analyzes old component
- Generates new structure
- Creates migration guide
- Updates references

### 2. **Generating Component Variants**
```bash
ds scaffold variant --component Button --variant icon-only
```
- Creates variant from base component
- Maintains consistency
- Reuses existing code
- Updates documentation

### 3. **Component Templates from Design**
```bash
ds scaffold from-design --figma-file abc123 --component Card
```
- Imports design specs
- Generates component structure
- Matches design tokens
- Creates initial styles

### 4. **Multi-Framework Components**
```bash
ds scaffold component Button --frameworks vue,react,svelte
```
- Generates for multiple frameworks
- Maintains API consistency
- Shares design tokens
- Unified documentation

## Conclusion

A Component Scaffolding Wizard transforms component creation from a manual, error-prone process into a guided, consistent experience. It:

- **Saves Time**: Reduces setup from hours to minutes
- **Ensures Quality**: Enforces best practices automatically
- **Maintains Consistency**: All components follow same structure
- **Improves Onboarding**: New developers productive faster
- **Reduces Errors**: Eliminates copy-paste mistakes
- **Enhances Documentation**: Auto-generates and maintains docs

The wizard would be an invaluable tool for maintaining a high-quality, consistent design system while reducing the cognitive load on developers.

