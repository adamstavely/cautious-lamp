import { nextTick } from 'vue';
import TableGenerator from '../../src/views/TableGenerator.vue';
import TimelineGenerator from '../../src/views/TimelineGenerator.vue';
import { mountView } from './mountView.js';

/**
 * Mounts a generator view, lets `edit` change its state, and returns the
 * generated source for each export format asked for.
 */
async function exportsFrom(view, edit, formats) {
  const page = await mountView(view);
  try {
    edit?.(page.state);
    const out = {};
    for (const format of formats) {
      page.state.selectedExportFormat = format;
      await nextTick();
      out[format] = page.state.generatedCode;
    }
    return out;
  } finally {
    page.unmount();
  }
}

export const tableExports = (edit, formats = ['react', 'vue']) => exportsFrom(TableGenerator, edit, formats);
export const timelineExports = (edit, formats = ['react', 'vue']) => exportsFrom(TimelineGenerator, edit, formats);

// Node's own Uint8Array: the jsdom environment replaces the global one, and
// esbuild refuses to run unless TextEncoder output is an instance of it.
const NodeUint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
let esbuild;

/** esbuild's transformSync, run with Node's typed arrays and TextEncoder in place. */
async function transformWithEsbuild(source, options) {
  const { TextDecoder, TextEncoder } = await import('node:util');
  const saved = [globalThis.Uint8Array, globalThis.TextEncoder, globalThis.TextDecoder];
  Object.assign(globalThis, { Uint8Array: NodeUint8Array, TextEncoder, TextDecoder });
  try {
    esbuild ??= await import('esbuild');
    return esbuild.transformSync(source, options);
  } finally {
    [globalThis.Uint8Array, globalThis.TextEncoder, globalThis.TextDecoder] = saved;
  }
}

/**
 * Compiles TS/TSX/JS module source to CommonJS with the esbuild Vite already
 * ships, and runs it with `modules` as the only importable packages.
 */
export async function runModule(source, modules, loader = 'tsx') {
  const { code } = await transformWithEsbuild(source, { loader, format: 'cjs', jsx: 'transform' });
  const require = (name) => {
    if (!(name in modules)) throw new Error(`generated code imports unexpected module "${name}"`);
    return modules[name];
  };
  const module = { exports: {} };
  new Function('module', 'exports', 'require', code)(module, module.exports, require);
  return module.exports;
}
