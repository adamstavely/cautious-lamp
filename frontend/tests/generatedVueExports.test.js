// R25: the Vue exports inlined user data into <script setup> with plain
// JSON.stringify, so a "</script>" in a cell ended the block early and
// U+2028/2029 could break the literal. Data now goes through scriptSafeJson.
import { compileScript, parse } from '@vue/compiler-sfc';
import * as Vue from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { runModule, tableExports, timelineExports } from './helpers/generators.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const EVIL = 'evil </script><script>alert(1)</script> <!-- & \u2028line\u2029para';

/** Parses and compiles a generated SFC, returning its component (template inlined). */
async function compileVue(source, id) {
  const { descriptor, errors } = parse(source, { filename: `${id}.vue` });
  if (errors.length) throw new Error(errors.map((e) => e.message).join('; '));
  const script = compileScript(descriptor, { id, inlineTemplate: true });
  return (await runModule(script.content, { vue: Vue }, 'js')).default;
}

function mountCompiled(component) {
  const el = document.createElement('div');
  document.body.appendChild(el);
  const app = Vue.createApp(component);
  app.config.warnHandler = () => {};
  app.mount(el);
  return { el, app };
}

/** Undo the escapes scriptSafeJson adds, i.e. what plain JSON.stringify produced. */
const unescaped = (source) =>
  source.replace(/\\u003c/g, '<').replace(/\\u003e/g, '>').replace(/\\u0026/g, '&');

const mounted = [];
afterEach(() => {
  mounted.splice(0).forEach(({ app, el }) => {
    app.unmount();
    el.remove();
  });
});

describe('TableGenerator Vue export', () => {
  const generate = () =>
    tableExports((state) => {
      state.rows[0].Name = EVIL;
    }, ['vue']).then((out) => out.vue);

  it('contains only the real closing </script> tag', async () => {
    const source = await generate();
    // Any "</script" (any case) can end the block, so only the real one may appear.
    expect(source.match(/<\/script/gi)).toHaveLength(1);
    // ... and the data's "<!--" stays out of the script block.
    expect(source.slice(source.indexOf('<script'))).not.toContain('<!--');
    expect(source).not.toContain('\u2028');
    expect(source).not.toContain('\u2029');
  });

  it('compiles and renders the original value unchanged', async () => {
    const component = await compileVue(await generate(), 'table-export');
    expect(component.props.rows.default()[0].Name).toBe(EVIL);

    const view = mountCompiled(component);
    mounted.push(view);
    expect(view.el.textContent).toContain(EVIL);
    // The data stayed data: no script element was created from it.
    expect(view.el.querySelector('script')).toBeNull();
  });

  it('would break without the escaping (the failure this guards against)', async () => {
    const old = unescaped(await generate());
    await expect(compileVue(old, 'table-export-old')).rejects.toThrow();
  });
});

describe('TimelineGenerator Vue export', () => {
  const generate = () =>
    timelineExports((state) => {
      state.events[0].title = EVIL;
      state.events[0].description = 'desc \u2028 </SCRIPT > end';
    }, ['vue']).then((out) => out.vue);

  it('contains only the real closing </script> tag', async () => {
    const source = await generate();
    expect(source.match(/<\/script/gi)).toHaveLength(1);
    expect(source).not.toContain('\u2028');
  });

  it('compiles and renders the original values unchanged', async () => {
    const component = await compileVue(await generate(), 'timeline-export');
    const events = component.props.events.default();
    expect(events.find((e) => e.title === EVIL)?.description).toBe('desc \u2028 </SCRIPT > end');

    const view = mountCompiled(component);
    mounted.push(view);
    expect(view.el.textContent).toContain(EVIL);
    expect(view.el.querySelector('script')).toBeNull();
  });

  it('would break without the escaping (the failure this guards against)', async () => {
    const old = unescaped(await generate());
    await expect(compileVue(old, 'timeline-export-old')).rejects.toThrow();
  });
});
