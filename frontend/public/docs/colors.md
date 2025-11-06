# Colors

Our color system is built on a foundation of semantic colors and a comprehensive palette that supports both light and dark modes.

## Color Palette

### Primary Colors

- **Indigo 600** (`#4f46e5`): Primary brand color
- **Indigo 500** (`#6366f1`): Used in dark mode
- **Indigo 400** (`#818cf8`): Hover states and accents

### Semantic Colors

- **Success**: Green shades for positive actions and states
- **Error**: Red shades for errors and destructive actions
- **Warning**: Orange/yellow shades for warnings
- **Info**: Blue shades for informational messages

## Usage Guidelines

### Light Mode

- Use indigo-600 for primary actions and brand elements
- Maintain sufficient contrast ratios (WCAG AA minimum)
- Use semantic colors consistently across the application

### Dark Mode

- Use indigo-500 for primary actions in dark mode
- Ensure text remains readable on dark backgrounds
- Adjust opacity and saturation for better visibility

## Accessibility

All color combinations must meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- UI components: 3:1 contrast ratio

## Examples

```css
/* Primary button */
.btn-primary {
  background-color: #4f46e5;
  color: white;
}

/* Dark mode */
.dark .btn-primary {
  background-color: #6366f1;
}
```

