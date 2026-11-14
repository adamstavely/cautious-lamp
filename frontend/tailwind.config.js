/**
 * Semantic names for the design tokens in src/styles/tokens.css (Trench Coat's
 * clean look with the app's accent). Reskinned pages use these and the
 * components in src/components/ui: never raw colours, arbitrary values or
 * dark: variants, because every token already follows the theme
 * (scripts/check-styles.mjs enforces this).
 *
 * All names are new, so pages not yet reskinned are unaffected.
 *
 * @type {import('tailwindcss').Config}
 */
const tc = (name) => `var(--tc-${name})`;
const app = (name) => `var(--app-${name})`;
const status = (tone) => ({
  DEFAULT: tc(`status-${tone}-fg`),
  bg: tc(`status-${tone}-bg`),
  solid: tc(`status-${tone}-solid`),
  border: tc(`status-${tone}-border`),
});

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: tc('surface-base'),
          raised: tc('surface-raised'),
          sunken: tc('surface-sunken'),
          tray: tc('surface-tray'),
          'on-tray': tc('surface-on-tray'),
          control: tc('surface-control'),
          overlay: tc('surface-overlay'),
          inverse: tc('surface-inverse'),
        },
        ink: {
          strong: tc('text-strong'),
          DEFAULT: tc('text-primary'),
          secondary: tc('text-secondary'),
          muted: tc('text-muted'),
          disabled: tc('text-disabled'),
          'on-accent': app('text-on-accent'),
          'on-inverse': tc('text-on-inverse'),
        },
        line: {
          faint: tc('border-default'),
          DEFAULT: tc('border-strong'),
          control: tc('border-control'),
          'control-hover': tc('border-control-hover'),
          selected: tc('border-selected'),
        },
        fill: {
          subtle: tc('fill-subtle'),
          DEFAULT: tc('fill-default'),
          strong: tc('fill-strong'),
          hover: tc('fill-hover'),
          selected: tc('fill-selected'),
        },
        accent: {
          DEFAULT: tc('accent'),
          hover: tc('accent-hover'),
          text: tc('accent-text'),
          subtle: tc('accent-subtle'),
          highlight: tc('accent-highlight'),
          border: app('accent-border'),
        },
        success: status('success'),
        warning: status('warning'),
        danger: status('danger'),
        info: status('info'),
        chart: {
          1: tc('chart-1'),
          2: tc('chart-2'),
          3: tc('chart-3'),
          4: tc('chart-4'),
          5: tc('chart-5'),
          6: tc('chart-6'),
          neutral: tc('chart-neutral'),
        },
      },
      fontFamily: {
        ui: tc('font-sans'),
        code: tc('font-mono'),
      },
      borderRadius: {
        control: tc('radius-md'),
        field: tc('radius-lg'),
        tile: tc('radius-xl'),
        card: tc('radius-2xl'),
        pill: tc('radius-full'),
      },
      boxShadow: {
        control: tc('shadow-control'),
        raised: tc('shadow-raised'),
        overlay: tc('shadow-overlay'),
        'card-hover': app('shadow-card-hover'),
      },
      outlineColor: {
        focus: tc('focus-ring'),
      },
      gridTemplateColumns: {
        // Text beside an illustration or a side column that sizes to its content
        'content-aside': '1fr auto',
        'aside-content': 'auto 1fr',
      },
      spacing: {
        'drawer-closed': app('drawer-closed'),
        'drawer-open': app('drawer-open'),
        // A tool's working area (a map, a chart canvas) and an embedded page (a replay, a heatmap)
        workspace: app('workspace-height'),
        embed: app('embed-height'),
      },
    },
  },
  plugins: [],
};
