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

## Current Implementation Status

### ✅ Built as Generators
1. **Chart Builder** - Many chart types, complex data configurations
2. **Badge Generator** - Multiple styles (rounded, pill, ribbon, medal, tag), many states
3. **Progress Generator** - ⚠️ *Question: Should this be a component?*
4. **Loading Spinner Generator** - ⚠️ *Question: Should this be a component?*

### 🤔 Under Review
- **Progress Indicators** - Standard UI pattern, but has multiple visual types (linear, circular, steps)
- **Loading Spinners** - Standard UI pattern, but has multiple visual styles (spinner, dots, bars, skeleton, pulse)

**Decision Needed:** Should these be:
- A) Design system components with a "Component Configurator" tool that shows variants
- B) Generators that output code using design system components
- C) Keep as generators but refactor to use design system components

## Recommended App/Interactive Generators

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

7. **Table/DataTable Generator**
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

10. **Interactive Timeline Generator**
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

12. **Interactive Map Generator** ✅ *Implemented*
    - Create interactive maps with visual builder
    - **Map Configuration:**
      - Center coordinates (lat/lng input or map click)
      - Initial zoom level (1-18)
      - Multiple map styles (street, satellite, terrain, dark theme)
      - Map dimensions and responsive options
    - **Marker Management:**
      - Add markers by clicking map or entering coordinates
      - Custom marker icons (default, custom image, emoji)
      - Marker colors, sizes, and labels
      - Drag-and-drop repositioning
      - Delete and edit markers
      - Marker clustering option for large datasets
    - **Region/Area Drawing:**
      - Draw polygons, circles, and rectangles
      - Custom fill colors and opacity
      - Border colors and widths
      - Region labels and descriptions
      - Edit and delete regions
    - **Tooltips & Popups:**
      - Configure popup content (HTML/text)
      - Popup positioning options
      - Auto-open on load option
      - Custom styling and formatting
    - **Controls & Interactions:**
      - Zoom controls (show/hide, position)
      - Attribution control
      - Fullscreen control
      - Scale control
      - Enable/disable dragging, zoom, double-click zoom
      - Touch interactions for mobile
    - **Export Options:**
      - React component with Leaflet integration
      - Vue component with Vue-Leaflet integration
      - Standalone HTML with embedded Leaflet
      - All dependencies included in export
    - **Rationale:** Complex configurations, custom content, many visual variations, helps non-developers create interactive maps

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
7. Table/DataTable Generator

### Phase 4: Interactive Components
8. Accordion Generator
9. Tabs Generator
10. Interactive Timeline Generator
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

