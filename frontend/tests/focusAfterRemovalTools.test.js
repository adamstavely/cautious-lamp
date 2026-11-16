// A row's Remove button takes focus with it when the row goes; the tools move
// focus to the row now in its place (or the one before), else the list's Add
// button, so keyboard and screen reader users keep their place (WCAG 2.4.3).
import { h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BoxShadowGenerator from '../src/views/BoxShadowGenerator.vue';
import TableGenerator from '../src/views/TableGenerator.vue';
import MapRowEditor from '../src/components/maps/MapRowEditor.vue';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const flush = async () => {
  for (let i = 0; i < 4; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

const button = (label) => document.querySelector(`[aria-label="${label}"]`);
const byText = (text) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === text);

const click = async (el) => {
  el.focus();
  el.click();
  await flush();
};

let page;
afterEach(() => {
  page?.unmount();
  page = null;
});

describe('Box shadow generator', () => {
  it('moves focus to the next shadow, the one before, then the last shadow\'s first field', async () => {
    page = await mountView(BoxShadowGenerator);
    byText('Add shadow').click();
    byText('Add shadow').click();
    await flush();
    expect(page.state.shadows).toHaveLength(3);

    await click(button('Remove shadow 1'));
    expect(page.state.shadows).toHaveLength(2);
    expect(document.activeElement).toBe(button('Remove shadow 1'));

    await click(button('Remove shadow 2'));
    expect(page.state.shadows).toHaveLength(1);
    // The last shadow can't be removed (its button is disabled), so focus goes to its first field
    expect(document.activeElement.tagName).toBe('INPUT');
    expect(document.activeElement.closest('.space-y-4')).not.toBeNull();
  });
});

describe('Table generator', () => {
  it('moves focus to the next row\'s Remove button, or the previous one after the last row', async () => {
    page = await mountView(TableGenerator);
    const count = page.state.rows.length;

    await click(button('Remove row 2'));
    expect(page.state.rows).toHaveLength(count - 1);
    expect(document.activeElement).toBe(button('Remove row 2'));

    await click(button(`Remove row ${count - 1}`));
    expect(page.state.rows).toHaveLength(count - 2);
    expect(document.activeElement).toBe(button(`Remove row ${count - 2}`));

    await click(button('Remove column 1'));
    expect(document.activeElement).toBe(button('Remove column 1'));
  });
});

describe('Map row editor', () => {
  it('moves focus to the Add button once the last row is removed', async () => {
    const Host = {
      setup() {
        const rows = ref([{ name: 'Paris' }]);
        return () => h(MapRowEditor, {
          modelValue: rows.value,
          'onUpdate:modelValue': (next) => { rows.value = next; },
          columns: [{ key: 'name', label: 'Name', type: 'text' }],
          legend: 'Places',
          itemLabel: 'Place',
        });
      },
    };
    page = await mountView(Host);

    await click(button('Remove place 1'));
    expect(button('Remove place 1')).toBeNull();
    expect(document.activeElement).toBe(byText('Add place'));
  });
});
