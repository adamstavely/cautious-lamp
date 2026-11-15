# App & Interactive Tools Strategy

## Overview

This document outlines the strategy for building tools that help designers and enable non-designers to be more self-service, specifically focused on apps and interactives.

## Philosophy: Generators vs Components

### When to Build a Generator
Generators make sense when:
- **Many visual variations** - Multiple distinct styles that need visual configuration
- **Complex configurations** - Many options that benefit from a visual builder
- **Code generation value** - Helps non-designers create something complex
- **One-off creations** - Things that are created once and customized (like charts, badges)

### When to Build a Component
Components make sense when:
- **Standard UI patterns** - Common, reusable patterns that should be in the design system
- **Simple configurations** - Props-based configuration is sufficient
- **Reusable across projects** - Things that will be used repeatedly
- **Design system integration** - Should be part of the core component library

## Current implementation status

Checked against the code at `main` (`69076bb`), 15 November 2026.

### Built as generators
1. **Chart Builder** (`/tools/chart-builder`) - many chart types, complex data configurations
2. **Badge Generator** (`/components/badge-generator`) - multiple styles and states
3. **Progress Generator** (`/components/progress-generator`) - linear, circular and step indicators; React, Vue or CSS export
4. **Loading Spinner Generator** (`/components/loading-generator`) - spinner, dots, bars, skeleton and pulse; React, Vue or CSS export
5. **Timeline Generator** (`/tools/timeline-generator`) - React, Vue or SVG export
6. **Table Generator** (`/tools/table-generator`) - React, Vue or HTML export
7. **Map Maker** (`/tools/map-maker`) - thematic maps, described under item 12 below

The Button and Color picker pages (`/components/buttons`, `/components/color-picker`) have a props playground that copies Vue, React, React Native or HTML; that is the nearest thing to a component configurator.

### Under review
- **Progress Indicators** - Standard UI pattern, but has multiple visual types (linear, circular, steps)
- **Loading Spinners** - Standard UI pattern, but has multiple visual styles (spinner, dots, bars, skeleton, pulse)

**Decision Needed:** Should these be:
- A) Design system components with a "Component Configurator" tool that shows variants
- B) Generators that output code using design system components
- C) Keep as generators but refactor to use design system components

## Recommended App/Interactive Generators

Not built unless marked: Form, Button, Card, Dashboard Layout, Modal/Dialog, Navigation, Accordion, Tabs, Flowchart/Diagram and Calendar generators. Table, Timeline and Map are built (see above).

### High Priority - Complex Visual Builders

1. **Form Builder**
   - Drag-and-drop form fields
   - Multiple input types (text, email, select, checkbox, radio, date, file)
   - Validation rules configuration
   - Form layout options (single/two column)
   - Export as React/Vue component or HTML
   - **Rationale:** Complex forms with many fields and validation rules benefit from visual builder

2. **Button Generator**
   - Visual button builder with all states
   - Hover, active, disabled, loading states
   - Icon support, multiple sizes
   - Export as React/Vue component with all variants
   - **Rationale:** Many visual variations and states, helps create complete button system

3. **Card Component Generator**
   - Drag-and-drop card builder
   - Sections: header, body, footer, image, actions
   - Configure spacing, borders, shadows
   - Multiple card styles (elevated, outlined, filled)
   - Export as component code
   - **Rationale:** Flexible layouts and compositions, many visual variations

4. **Dashboard Layout Generator**
   - Create dashboard layouts visually
   - Drag-and-drop widgets (charts, tables, metrics)
   - Grid system for alignment
   - Responsive configuration
   - Export as React/Vue component
   - **Rationale:** Complex multi-widget layouts that benefit from visual builder

5. **Modal/Dialog Generator**
   - Create modal dialogs visually
   - Configure sizes, positions, animations
   - Header, body, footer sections
   - Backdrop and close button options
   - Export as component
   - **Rationale:** Many size/position/animation combinations

6. **Navigation Generator**
   - Create navigation menus (horizontal, vertical, sidebar)
   - Configure links, dropdowns, icons
   - Mobile menu support
   - Export as component
   - **Rationale:** Different menu types and structures, complex configurations

7. **Table/DataTable Generator** (built: `/tools/table-generator`)
   - Create data tables visually
   - Configure columns, sorting, filtering
   - Pagination options
   - Row actions and selection
   - Export as component
   - **Rationale:** Complex tables with many configuration options

8. **Accordion Generator**
   - Create collapsible accordion sections
   - Configure expand/collapse behavior
   - Icon positioning
   - Multiple styles
   - Export as component
   - **Rationale:** Multiple visual styles and behaviors

9. **Tabs Generator**
   - Create tab navigation visually
   - Configure tab styles and positions
   - Icon support
   - Export as component
   - **Rationale:** Various tab styles and configurations

10. **Interactive Timeline Generator** (built: `/tools/timeline-generator`)
    - Create visual timelines
    - Add events with dates, descriptions, icons
    - Multiple styles (vertical, horizontal)
    - Export as component or SVG
    - **Rationale:** Custom content, many visual variations

11. **Flowchart/Diagram Generator**
    - Visual flowchart builder
    - Drag-and-drop shapes
    - Connect shapes with arrows
    - Export as SVG or component
    - **Rationale:** Custom diagrams, visual creation needed

12. **Map Maker** (built: `/tools/map-maker`, `frontend/src/views/MapMaker.vue`)
    - Thematic maps drawn with d3-geo from bundled TopoJSON (`frontend/public/maps`), not a tiled slippy map: no Leaflet, street or satellite tiles, pan and zoom, or drawing tools.
    - **Map types:** choropleth (regions coloured by value), proportional symbols (circles sized by value), dot map (places, with optional categories) and flow map (movement between places, sized by volume).
    - **Areas:** the world (Equal Earth or Mercator), six continents, US states, US counties, and any country's first-level regions from Natural Earth admin-1. Open a country by clicking it, from the keyboard, or from a select; focus moves to Back and returns to the country (#35). Remote regions can be fitted in or left out.
    - **Data:** paste or upload CSV/TSV, or edit rows in place. A match report lists skipped rows, places off the map, and did-you-mean fixes for region names and postal, ISO or FIPS codes. Each map type has sample data and a CSV download.
    - **Colour:** sequential or diverging palettes from the app's colour tokens, with a midpoint for diverging; 3 to 7 equal-interval or quantile classes, or custom breaks.
    - **Output:** a legend, a Table tab with the map's data as an accessible table, and PNG or SVG export. There is no React, Vue or HTML component export.
    - Built in #35 (`483269b`) on the earlier drill-down page; map logic is in tested utils (`utils/csv.js`, `mapImport.js`, `regionMatch.js`, `mapScales.js`, `mapAreas.js`).
    - **Rationale:** lets non-designers turn a table of numbers into an accessible thematic map without GIS tools.

13. **Interactive Calendar Generator**
    - Create calendar components
    - Configure views (month, week, day)
    - Event display options
    - Export as component
    - **Rationale:** Complex calendar configurations

## Should Be Design System Components (Not Generators)

These are standard UI patterns that should be reusable components:

- **Tooltip/Popover** - Standard component with props (position, trigger, content)
- **Slider/Range** - Standard form component with props (min, max, step, value)
- **Progress Indicators** - ⚠️ *Under review* - Standard pattern but has multiple visual types
- **Loading Spinners** - ⚠️ *Under review* - Standard pattern but has multiple visual styles

## Hybrid Approach: Component Configurators

For standard components that have many variants, consider building **Component Configurators** instead of generators:

- Show all available variants
- Configure props visually
- Generate code snippets using design system components
- Live preview of component with different props
- Help non-designers understand how to use components

**Example:** Progress Configurator
- Shows linear, circular, and step variants
- Configure value, colors, size, label
- Generates: `<Progress type="linear" value={65} variant="success" />`
- Uses the actual design system component

## Implementation Recommendations

### Phase 1: Clarify Current Generators
1. Decide on Progress/Loading Spinner approach (generator vs component vs configurator)
2. If keeping as generators, refactor to use design system components where possible
3. Document the decision and rationale

### Phase 2: High-Value Generators
1. Form Builder - High impact, enables non-developers
2. Button Generator - Complete button system generation
3. Card Component Generator - Quick card creation
4. Modal/Dialog Generator - Common pattern with many variations

### Phase 3: Layout & Navigation
5. Dashboard Layout Generator
6. Navigation Generator
7. Table/DataTable Generator (built)

### Phase 4: Interactive Components
8. Accordion Generator
9. Tabs Generator
10. Interactive Timeline Generator (built)
11. Flowchart/Diagram Generator

## Questions to Resolve

1. **Progress/Loading Spinners:** Generator, Component, or Configurator?
2. **Badge Generator:** Should badges be design system components that the generator uses?
3. **Code Generation:** Should generators output code that uses design system components, or standalone code?
4. **Component Configurators:** Should we build a separate category of "configurators" for standard components?

## Notes

- All generators should follow the Chart Builder pattern: configuration panel + live preview
- Export options should include React, Vue, and CSS
- Consider dark mode support for all generators
- Responsive previews are important for layout generators
- Template libraries help users get started quickly

