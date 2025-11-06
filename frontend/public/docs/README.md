# Design System Guidelines Documentation

This directory contains the VitePress documentation for the Design System Guidelines.

## Development

To run the documentation in development mode:

```bash
npm run docs:dev
```

This will start the VitePress dev server on `http://localhost:5174/guidelines/`

## Building

To build the documentation for production:

```bash
npm run docs:build
```

The built files will be output to `docs/.vitepress/dist/`

## Preview

To preview the built documentation:

```bash
npm run docs:preview
```

## Structure

- `index.md` - Homepage
- `colors.md` - Color guidelines
- `typography.md` - Typography guidelines
- `components/` - Component documentation
- `patterns/` - Design patterns
- `.vitepress/config.js` - VitePress configuration

## Adding Content

Simply add or edit markdown files in this directory. VitePress will automatically:
- Generate navigation from the sidebar configuration
- Create searchable content
- Handle routing

## Integration

The Guidelines view in the main app (`src/views/Guidelines.vue`) embeds the VitePress documentation via iframe. In development, it connects to the VitePress dev server. In production, it should serve the built static files.

