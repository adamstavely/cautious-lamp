# Spacing

Our spacing system uses a consistent scale based on 4px increments for harmonious layouts.

## Spacing Scale

- **0**: 0px
- **1**: 4px
- **2**: 8px
- **3**: 12px
- **4**: 16px
- **5**: 20px
- **6**: 24px
- **8**: 32px
- **10**: 40px
- **12**: 48px
- **16**: 64px
- **20**: 80px
- **24**: 96px

## Usage Guidelines

### Padding

Use padding for internal spacing within components:

```css
.card {
  padding: 1rem; /* 16px */
}
```

### Margin

Use margin for external spacing between elements:

```css
.section {
  margin-bottom: 2rem; /* 32px */
}
```

### Gaps

Use gap for spacing in flex and grid layouts:

```css
.container {
  display: flex;
  gap: 1rem; /* 16px */
}
```

## Best Practices

- Use consistent spacing values from the scale
- Maintain visual rhythm throughout layouts
- Consider responsive spacing adjustments
- Use larger spacing for major sections

