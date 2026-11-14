// The React DataTable that TableGenerator exports.
// R23: selection was kept by row index in state that reset whenever the rows
//      prop changed identity, so a parent rerender or sort lost it.
// R24: filtering from a later page showed nothing, and shrinking the data or
//      raising the page size left the table on a page that no longer existed.
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { runModule, tableExports } from './helpers/generators.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const CONFIG = {
  enableSorting: true,
  enableFiltering: true,
  enablePagination: true,
  rowsPerPage: 2,
  selectionMode: 'multiple',
  stripedRows: true,
  hoverEffects: true,
};
const NAME_COLUMN = [{ name: 'Name', type: 'text', sortable: true, filterable: true }];
const EVIL = 'evil </script> \u2028 & <b>';

let DataTable;
let root;
let container;

beforeAll(async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const { react: source } = await tableExports((state) => {
    state.rows[0].Name = EVIL;
  }, ['react']);
  ({ DataTable } = await runModule(source, { react: React }));
});

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const $ = (selector) => [...container.querySelectorAll(selector)];
const checkboxes = () => $('tbody input[type=checkbox]');
const lastCells = () => $('tbody tr').map((tr) => tr.lastElementChild.textContent);
const button = (text) => $('button').find((b) => b.textContent.trim() === text);
const header = (text) => $('th').find((th) => th.textContent.includes(text));
const click = (el) => act(() => el.click());
const typeInto = (el, value) =>
  act(() => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
const render = (element) => act(() => root.render(element));

/** A host that rerenders on demand and passes the props `makeProps` builds on every render. */
function makeHost(makeProps) {
  const controls = {};
  function Host() {
    const [tick, setTick] = React.useState(0);
    controls.rerender = () => act(() => setTick((t) => t + 1));
    return React.createElement('section', { 'data-tick': tick }, React.createElement(DataTable, makeProps()));
  }
  return { Host, controls };
}

describe('generated React DataTable', () => {
  it('embeds the default rows from the generator unchanged', async () => {
    await render(React.createElement(DataTable, { config: { ...CONFIG, rowsPerPage: 10 } }));
    expect(container.textContent).toContain(EVIL);
  });

  it('shows no checkboxes with the default config (selection off)', async () => {
    await render(React.createElement(DataTable));
    expect($('tbody tr').length).toBeGreaterThan(0);
    expect(checkboxes()).toHaveLength(0);
  });

  describe('R23: selection', () => {
    it('survives parent rerenders with the default rows', async () => {
      const { Host, controls } = makeHost(() => ({ config: CONFIG }));
      await render(React.createElement(Host));
      await click(checkboxes()[0]);
      expect(checkboxes()[0].checked).toBe(true);
      await controls.rerender();
      await controls.rerender();
      expect(checkboxes()[0].checked).toBe(true);
    });

    it('survives a fresh rows array on every render, and follows its row when sorted', async () => {
      const { Host, controls } = makeHost(() => ({
        config: CONFIG,
        rows: [
          { id: 'a', Name: 'A' },
          { id: 'b', Name: 'B' },
          { id: 'c', Name: 'C' },
        ],
        columns: NAME_COLUMN,
      }));
      await render(React.createElement(Host));
      await click(checkboxes()[1]);
      await controls.rerender();
      expect(checkboxes().map((b) => b.checked)).toEqual([false, true]);

      // Sort descending: C, B on page 1, with B still the selected row.
      await click(header('Name'));
      await click(header('Name'));
      expect($('tbody tr').map((tr) => [tr.lastElementChild.textContent, tr.querySelector('input').checked])).toEqual([
        ['C', false],
        ['B', true],
      ]);
    });
  });

  describe('R24: paging', () => {
    const many = Array.from({ length: 7 }, (_, i) => ({ id: i, Name: `Row ${i}` }));
    let setRows;
    let setConfig;
    function Host() {
      const [rows, sr] = React.useState(many);
      const [config, sc] = React.useState(CONFIG);
      setRows = sr;
      setConfig = sc;
      return React.createElement(DataTable, { config, rows, columns: NAME_COLUMN });
    }
    const goToLastPage = async () => {
      for (let i = 0; i < 3; i += 1) await click(button('Next'));
      expect(lastCells()).toEqual(['Row 6']);
    };

    it('filtering from a later page shows the matches', async () => {
      await render(React.createElement(Host));
      await goToLastPage();
      await typeInto($('input[type=text]')[0], 'Row 1');
      expect(lastCells()).toEqual(['Row 1']);
    });

    it('shrinking the data clamps to the new last page', async () => {
      await render(React.createElement(Host));
      await goToLastPage();
      await act(() => setRows(many.slice(0, 3)));
      expect(lastCells()).toEqual(['Row 2']);
      expect(button('Next').disabled).toBe(true);
    });

    it('a larger page size clamps to the new last page', async () => {
      await render(React.createElement(Host));
      await goToLastPage();
      await act(() => setConfig({ ...CONFIG, rowsPerPage: 5 }));
      expect(lastCells()).toEqual(['Row 5', 'Row 6']);
      expect(button('Next').disabled).toBe(true);
    });
  });
});
