# Design System Guidelines Documentation

This directory contains the VitePress documentation for the Design System Guidelines.

## Development

To run the documentation in development mode:

```bash
npm run docs:dev
```

This will start the VitePress dev server on `http://localhost:5175/guidelines/`

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

Add or edit markdown files in this directory, then add each new page to `sidebar` (and `nav` if it belongs there) in `.vitepress/config.js`: VitePress doesn't list pages on its own. Routing and local search pick new pages up automatically.

## Integration

This site is standalone: the main app doesn't embed it. The app's Guidelines pages render their own copies of these topics from `public/docs` with `MarkdownViewer`. The illustrations under `/svgs/` are shared: the site resolves them from the app's `public/svgs` (see the alias in `.vitepress/config.js`).

CI runs `npm run docs:build`, which fails on dead links and missing images.
