# Component Scaffolding Wizard - Enhancement Plan

## Executive Summary

The current Component Scaffolding Wizard generates only ~15-20% of code for complex components (like ColorPicker, DatePicker, DataTable). This document outlines the enhancements needed to make it capable of handling extremely complex components and generating production-ready code.

## Current Limitations

### What Works
- ✅ Basic component structure generation
- ✅ Props, Events, Methods definitions
- ✅ Basic Stencil.js decorators
- ✅ Test skeleton generation
- ✅ Documentation generation

### What Doesn't Work
- ❌ Complex internal state management
- ❌ Utility function generation
- ❌ Event handler implementation
- ❌ Lifecycle hooks
- ❌ Complex render methods (canvas, calendar grids, etc.)
- ❌ Custom styling/CSS
- ❌ TypeScript interfaces/types
- ❌ Real-world functionality

## Enhancement Roadmap

### Phase 1: Advanced Prop Types & Validation

#### 1.1 Object/Array Prop Support
**Current:** Only basic types (string, number, boolean, enum)

**Needed:**
- Object prop definitions with nested properties
- Array prop definitions with item types
- Default value generation for complex types
- TypeScript interface generation for object props

**Example:**
```typescript
// User should be able to define:
{
  name: 'position',
  type: 'object',
  properties: {
    left: { type: 'number', default: 0 },
    top: { type: 'number', default: 0 }
  },
  default: { left: 0, top: 0 }
}
```

**Implementation:**
- Add "Object" and "Array" prop type options
- Create nested prop editor UI
- Generate TypeScript interfaces
- Generate proper default values

#### 1.2 Prop Validation
**Needed:**
- Min/max values for numbers
- Pattern validation for strings
- Custom validation rules
- Required/optional handling
- Validation error messages

**Implementation:**
- Add validation rules editor
- Generate Stencil.js `@Prop()` decorator with validation
- Generate validation utility functions

### Phase 2: Internal State Management

#### 2.1 State Definition Step
**Current:** No state management

**Needed:**
- Step in wizard to define internal state
- Support for:
  - Reactive refs (`@State()` in Stencil)
  - Computed properties
  - Watchers
  - Internal state initialization

**UI Requirements:**
- Add "State Management" step (Step 2.5 or Step 3)
- State variable editor:
  - Name
  - Type
  - Initial value
  - Reactive/Computed flag
  - Watch dependencies

**Code Generation:**
```typescript
@State() currentDate: Date = new Date();
@State() isOpen: boolean = false;
@State() selectedRange: { start: Date, end: Date } = null;

@Watch('currentDate')
handleDateChange(newDate: Date) {
  // Generated handler
}
```

#### 2.2 Computed Properties
**Needed:**
- Generate computed properties from state
- Support for complex computed logic
- Type inference

**Example:**
```typescript
@Computed()
get formattedDate(): string {
  return this.formatDate(this.currentDate);
}
```

### Phase 3: Utility Functions

#### 3.1 Utility Function Generator
**Current:** No utility generation

**Needed:**
- Step to define utility functions
- Code templates for common utilities:
  - Date calculations
  - Color conversions
  - Formatting functions
  - Validation functions
  - Data transformations

**UI Requirements:**
- Add "Utilities" step
- Function editor:
  - Function name
  - Parameters
  - Return type
  - Template selection (or custom code)
  - Description

**Templates Needed:**
- Date utilities (getDaysInMonth, formatDate, parseDate)
- Color utilities (hexToRgb, rgbToHex, hslToRgb)
- String utilities (format, parse, validate)
- Number utilities (clamp, round, format)
- Array utilities (filter, map, reduce patterns)

**Code Generation:**
```typescript
private hexToRgb(hex: string): { r: number, g: number, b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}
```

### Phase 4: Event Handlers

#### 4.1 Event Handler Generator
**Current:** Events defined but no handlers

**Needed:**
- Generate event handler functions
- Support for:
  - Click handlers
  - Keyboard handlers
  - Drag handlers
  - Form handlers
  - Canvas/mouse handlers

**UI Requirements:**
- Add "Event Handlers" step
- Handler editor:
  - Handler name
  - Event type (click, keydown, mousedown, etc.)
  - Target element
  - Handler template
  - Custom logic

**Templates Needed:**
- Click handlers
- Keyboard navigation (arrows, enter, escape)
- Drag and drop handlers
- Canvas interaction handlers
- Form submission handlers
- Focus/blur handlers

**Code Generation:**
```typescript
private handleGradientClick(event: MouseEvent) {
  const rect = this.gradientCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  // Generated logic
}

@Listen('keydown')
handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    this.close();
  }
}
```

### Phase 5: Lifecycle Hooks

#### 5.1 Lifecycle Hook Generator
**Current:** No lifecycle support

**Needed:**
- Generate lifecycle hooks:
  - `componentWillLoad()`
  - `componentDidLoad()`
  - `componentWillUpdate()`
  - `componentDidUpdate()`
  - `componentDidUnload()`
  - `@Watch()` decorators

**UI Requirements:**
- Add "Lifecycle" step
- Hook editor:
  - Hook type
  - Purpose (initialization, cleanup, etc.)
  - Generated code template

**Code Generation:**
```typescript
componentWillLoad() {
  // Initialize component
  this.setColorFromHex(this.initialColor);
}

componentDidLoad() {
  // Setup after render
  this.drawGradientCanvas();
  this.drawHueCanvas();
}

@Watch('initialColor')
handleInitialColorChange(newColor: string) {
  this.setColorFromHex(newColor);
}
```

### Phase 6: Complex Render Methods

#### 6.1 Visual Render Method Builder
**Current:** Basic div with slot

**Needed:**
- Visual builder for render method
- Support for:
  - Canvas elements
  - Complex layouts (grids, calendars)
  - Conditional rendering
  - Loops/iterations
  - Nested components

**UI Requirements:**
- Visual render method editor
- Drag-and-drop JSX elements
- Property bindings
- Event bindings
- Conditional logic
- Loop generation

**Code Generation:**
```typescript
render() {
  return (
    <div class="date-picker">
      <div class="calendar-header">
        <button onClick={() => this.prevMonth()}>←</button>
        <span>{this.getMonthName()}</span>
        <button onClick={() => this.nextMonth()}>→</button>
      </div>
      <div class="calendar-grid">
        {this.getCalendarDays().map(day => (
          <div
            class={`day ${day.isSelected ? 'selected' : ''}`}
            onClick={() => this.selectDate(day.date)}
          >
            {day.day}
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 6.2 Canvas Rendering Support
**Needed:**
- Canvas element generation
- Canvas drawing function templates
- Canvas event handlers
- Canvas ref management

**Templates:**
- Gradient canvas
- Hue slider canvas
- Chart canvas
- Image manipulation canvas

### Phase 7: Pre-built Component Templates

#### 7.1 Full Component Templates
**Current:** Basic templates (Button, Input, Card, Modal) with only props

**Needed:**
- Complete, working component templates:
  - **DatePicker** - Full calendar with navigation, validation
  - **ColorPicker** - Canvas-based color selection
  - **DataTable** - Sorting, filtering, pagination
  - **TimePicker** - Time selection with validation
  - **RangePicker** - Date range selection
  - **Autocomplete** - Search with suggestions
  - **Slider** - Range slider with steps
  - **Accordion** - Collapsible sections
  - **Tabs** - Tab navigation
  - **Tooltip** - Positioned tooltips
  - **Popover** - Positioned popovers

**Requirements:**
- Full implementation (not skeleton)
- All utilities included
- All handlers included
- Working functionality
- Customizable props/events
- Well-documented

**Implementation:**
- Create template library
- Each template includes:
  - Complete component code
  - All utility functions
  - All event handlers
  - All lifecycle hooks
  - CSS styling
  - Tests
  - Documentation

### Phase 8: Visual Design Integration

#### 8.1 Component Composition Integration
**Current:** Separate tools

**Needed:**
- Integrate Component Composition tool
- Visual design → Component generation
- Extract structure from visual design
- Auto-populate wizard from visual

**Workflow:**
1. Design component visually in Composition tool
2. Click "Generate Stencil Component"
3. Wizard opens with pre-filled data:
   - Component structure from visual
   - Props from visual props
   - Events from interactions
4. User completes remaining steps
5. Generate full Stencil.js component

**Implementation:**
- Extract component tree from Composition
- Map visual props to Stencil props
- Generate render method from visual structure
- Preserve visual hierarchy

#### 8.2 Visual Render Method Builder
**Needed:**
- Visual editor for render method
- Drag-and-drop JSX elements
- Property bindings
- Event bindings
- Conditional rendering
- Loops

### Phase 9: Advanced Features

#### 9.1 TypeScript Support
**Needed:**
- Generate TypeScript interfaces
- Type definitions for props
- Type definitions for events
- Generic type support
- Union types
- Utility types

**Code Generation:**
```typescript
interface DatePickerProps {
  value: Date | string;
  min?: Date | string;
  max?: Date | string;
  format?: string;
}

interface DatePickerEvents {
  change: CustomEvent<Date>;
  open: CustomEvent<void>;
}
```

#### 9.2 CSS/Styling Generation
**Needed:**
- Generate component CSS
- Support for:
  - CSS variables
  - Dark mode styles
  - Responsive styles
  - Animations
  - Transitions

**UI Requirements:**
- CSS editor step
- Visual style editor
- Theme support
- Dark mode toggle

#### 9.3 Accessibility Features
**Needed:**
- ARIA attribute generation
- Keyboard navigation templates
- Focus management
- Screen reader support
- WCAG compliance helpers

**Code Generation:**
```typescript
render() {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="picker-title"
      tabindex="-1"
      onKeyDown={(e) => this.handleKeydown(e)}
    >
      {/* Component content */}
    </div>
  );
}
```

#### 9.4 Testing Generation
**Current:** Basic test skeleton

**Needed:**
- Comprehensive test generation:
  - Unit tests for all methods
  - Event emission tests
  - Prop change tests
  - Accessibility tests
  - Integration tests
  - Visual regression test setup

**Code Generation:**
```typescript
describe('DatePicker', () => {
  it('emits change event when date is selected', async () => {
    const page = await newSpecPage({
      components: [DatePicker],
      html: `<date-picker></date-picker>`,
    });
    const component = page.rootInstance;
    const spy = jest.fn();
    page.doc.addEventListener('change', spy);
    await component.selectDate(new Date('2024-01-15'));
    expect(spy).toHaveBeenCalled();
  });
});
```

### Phase 10: Code Quality & Best Practices

#### 10.1 Code Quality Features
**Needed:**
- ESLint configuration
- TypeScript strict mode
- Code formatting (Prettier)
- Import organization
- Comment generation
- JSDoc comments

#### 10.2 Performance Optimization
**Needed:**
- Lazy loading support
- Memoization helpers
- Virtual scrolling templates
- Debounce/throttle utilities
- Performance monitoring hooks

#### 10.3 Documentation Generation
**Current:** Basic markdown

**Needed:**
- Comprehensive documentation:
  - Usage examples
  - API reference
  - Props table
  - Events table
  - Methods table
  - Accessibility guide
  - Performance notes
  - Migration guides

## Implementation Priority

### High Priority (Must Have)
1. **Pre-built Full Templates** - Makes wizard immediately useful
2. **Visual Design Integration** - Major workflow improvement
3. **Internal State Management** - Essential for complex components
4. **Utility Function Generator** - Reduces manual work significantly

### Medium Priority (Should Have)
5. **Event Handler Generator** - Important for interactivity
6. **Lifecycle Hooks** - Needed for initialization
7. **Complex Render Method Builder** - Enables complex UIs
8. **Advanced Prop Types** - Supports complex data structures

### Low Priority (Nice to Have)
9. **TypeScript Support** - Enhances developer experience
10. **CSS/Styling Generation** - Completes the component
11. **Advanced Testing** - Improves quality
12. **Code Quality Features** - Best practices

## Technical Requirements

### Backend Enhancements
- Enhanced `ComponentScaffoldingService`:
  - Template library management
  - Complex code generation logic
  - State management generation
  - Utility function generation
  - Event handler generation
  - Lifecycle hook generation
  - Render method generation

### Frontend Enhancements
- Enhanced wizard UI:
  - Additional steps for state, utilities, handlers, lifecycle
  - Visual render method builder
  - Template selection UI
  - Code preview with syntax highlighting
  - Integration with Composition tool

### Template Library
- Create template repository:
  - Full component implementations
  - Utility function templates
  - Event handler templates
  - Lifecycle hook patterns
  - Render method patterns

## Success Metrics

### Code Generation Coverage
- **Current:** ~15-20% for complex components
- **Target:** ~80-90% for complex components
- **Simple components:** 100% (already achievable)

### Developer Productivity
- **Current:** Minimal time savings
- **Target:** 50-70% time reduction for component creation

### Component Quality
- **Current:** Manual implementation required
- **Target:** Production-ready code generation

## Example: Complete DatePicker Generation

### What Would Be Generated

**Props (✅ Current):**
```typescript
@Prop() value: Date | string;
@Prop() min?: Date | string;
@Prop() max?: Date | string;
@Prop() format: string = 'MM/DD/YYYY';
@Prop() locale: string = 'en-US';
@Prop() showTime: boolean = false;
@Prop() range: boolean = false;
```

**State (🆕 New):**
```typescript
@State() currentDate: Date = new Date();
@State() viewMode: 'month' | 'year' | 'decade' = 'month';
@State() selectedRange: { start: Date, end: Date } | null = null;
@State() isOpen: boolean = false;
```

**Utilities (🆕 New):**
```typescript
private getDaysInMonth(year: number, month: number): number { }
private getFirstDayOfMonth(year: number, month: number): number { }
private formatDate(date: Date, format: string): string { }
private parseDate(dateString: string): Date | null { }
private isDateValid(date: Date): boolean { }
private isDateInRange(date: Date): boolean { }
```

**Event Handlers (🆕 New):**
```typescript
private handleDateClick(date: Date): void { }
private handlePrevMonth(): void { }
private handleNextMonth(): void { }
private handleKeydown(event: KeyboardEvent): void { }
```

**Lifecycle (🆕 New):**
```typescript
componentWillLoad() {
  this.currentDate = this.parseDate(this.value) || new Date();
}

@Watch('value')
handleValueChange(newValue: Date | string) {
  this.currentDate = this.parseDate(newValue) || new Date();
}
```

**Render Method (🆕 New):**
```typescript
render() {
  return (
    <div class="date-picker">
      {/* Complete calendar UI */}
    </div>
  );
}
```

## Conclusion

To make the Component Scaffolding Wizard truly useful for complex components, we need to implement:

1. **Full component templates** - Not skeletons, complete implementations
2. **State management** - Internal state, computed properties, watchers
3. **Utility functions** - Code templates for common utilities
4. **Event handlers** - Generated handler functions
5. **Lifecycle hooks** - Initialization and cleanup
6. **Complex render methods** - Visual builder for complex UIs
7. **Visual design integration** - Connect with Composition tool

With these enhancements, the wizard would generate ~80-90% of code for complex components, making it a truly valuable tool for component creation.

