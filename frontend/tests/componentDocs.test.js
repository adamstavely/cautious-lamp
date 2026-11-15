// Component docs from real sources: props, emits and slots parsed from a Vue
// SFC with Vue's compiler (script setup, TypeScript, Options API), merged with
// a design-system component record, and rendered as Markdown.
import { describe, expect, it } from 'vitest';
import { componentMarkdown, docFromComponent, parseVueComponent } from '../src/utils/componentDocs.js';

const SETUP = `<template>
  <button :disabled="disabled" @click="$emit('click', $event)">
    <slot name="icon" :size="size" />
    <slot />
  </button>
</template>

<script setup>
/** A button for the main action. */
const props = defineProps({
  /** Visual style */
  variant: { type: String, default: 'primary' },
  size: [String, Number],
  disabled: { type: Boolean, required: true },
});
const emit = defineEmits(['focus']);
</script>`;

const TYPED = `<template><div><slot name="footer" /></div></template>
<script setup lang="ts">
defineOptions({ name: 'FancyCard' });
const props = withDefaults(defineProps<{
  /** Card title */
  title: string;
  elevated?: boolean;
}>(), { elevated: false });
const emit = defineEmits<{
  (e: 'open' | 'close'): void;
  (e: 'select', id: number): void;
}>();
</script>`;

const OPTIONS = `<template><div /></template>
<script>
export default {
  name: 'LegacyInput',
  props: { modelValue: { type: String, default: '' } },
  emits: ['update:modelValue'],
};
</script>`;

describe('parseVueComponent', () => {
  it('reads script-setup props, emits from the script and template, and slots with their props', () => {
    const doc = parseVueComponent(SETUP, 'UiButton.vue');
    expect(doc.name).toBe('UiButton');
    expect(doc.description).toBe('A button for the main action.');
    expect(doc.props).toEqual([
      { name: 'variant', type: 'String', required: false, default: "'primary'", description: 'Visual style' },
      { name: 'size', type: 'String | Number', required: false, default: null, description: '' },
      { name: 'disabled', type: 'Boolean', required: true, default: null, description: '' },
    ]);
    expect(doc.emits.map((e) => e.name)).toEqual(['focus', 'click']);
    expect(doc.slots).toEqual([
      { name: 'icon', props: ['size'], description: '' },
      { name: 'default', props: [], description: '' },
    ]);
  });

  it('reads TypeScript props with defaults, typed emits and defineOptions', () => {
    const doc = parseVueComponent(TYPED, 'Card.vue');
    expect(doc.name).toBe('FancyCard');
    expect(doc.props).toEqual([
      { name: 'title', type: 'string', required: true, default: null, description: 'Card title' },
      { name: 'elevated', type: 'boolean', required: false, default: 'false', description: '' },
    ]);
    expect(doc.emits.map((e) => [e.name, e.payload])).toEqual([
      ['open', ''],
      ['close', ''],
      ['select', 'id: number'],
    ]);
    expect(doc.slots.map((s) => s.name)).toEqual(['footer']);
  });

  it('reads the Options API', () => {
    const doc = parseVueComponent(OPTIONS, 'x.vue');
    expect(doc.name).toBe('LegacyInput');
    expect(doc.props.map((p) => [p.name, p.type, p.default])).toEqual([['modelValue', 'String', "''"]]);
    expect(doc.emits.map((e) => e.name)).toEqual(['update:modelValue']);
  });

  it('reports a source that is not a valid SFC instead of inventing docs', () => {
    const doc = parseVueComponent('<template><div></template>', 'Broken.vue');
    expect(doc.errors.length).toBeGreaterThan(0);
    expect(doc.props).toEqual([]);
  });
});

describe('docFromComponent and componentMarkdown', () => {
  it('uses the record’s props and description, and the source’s emits and slots', () => {
    const doc = docFromComponent({
      name: 'Button',
      description: 'Buttons trigger actions.',
      status: 'production',
      props: [{ name: 'variant', type: 'string', default: 'primary', options: ['primary', 'secondary'], description: 'Style' }],
      code: { vue: SETUP },
      examples: ['<Button>Save</Button>'],
      accessibility: { wcag: 'AA', notes: 'Keyboard operable' },
    });
    expect(doc.props[0]).toMatchObject({ name: 'variant', type: "'primary' | 'secondary'", default: '"primary"', description: 'Style' });
    expect(doc.props.map((p) => p.name)).toEqual(['variant', 'size', 'disabled']);
    const md = componentMarkdown(doc, { includeSlots: false });
    expect(md).toContain('# Button\n\nButtons trigger actions.');
    expect(md).toContain('| `variant` | `\'primary\' \\| \'secondary\'` | `"primary"` | No | Style |');
    expect(md).toContain('## Events');
    expect(md).not.toContain('## Slots');
    expect(md).toContain('- WCAG level: AA');
    expect(md).toContain('```vue\n<Button>Save</Button>\n```');
  });
});
