// window.confirm() is replaced by confirmDialog(): the app's own native modal
// dialog, which matches the design system, can be styled and read properly,
// and returns focus like every other dialog.
import { createApp, h, nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import ConfirmHost from '../src/components/ConfirmHost.vue';
import { answerConfirm, confirmDialog } from '../src/composables/useConfirm.js';
import { readSource } from './helpers/appRoutes.js';

let app;
let el;
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close() {
    this.open = false;
  };
  el = document.createElement('div');
  document.body.appendChild(el);
  app = createApp({ render: () => h(ConfirmHost) });
  app.component('AppIcon', { render: () => null });
  app.mount(el);
});
afterEach(() => {
  answerConfirm(false);
  app.unmount();
  el.remove();
});

const button = (label) => [...el.querySelectorAll('button')].find((b) => b.textContent.trim() === label);

describe('confirmDialog', () => {
  it('shows the question and resolves true when confirmed', async () => {
    const answer = confirmDialog({ title: 'Delete this banner?', message: 'It will stop showing to everyone.', confirmLabel: 'Delete banner', danger: true });
    await nextTick();
    expect(el.querySelector('dialog').open).toBe(true);
    expect(el.textContent).toContain('Delete this banner?');
    expect(el.textContent).toContain('It will stop showing to everyone.');
    button('Delete banner').click();
    expect(await answer).toBe(true);
  });

  it('resolves false on Cancel, and a newer question cancels the older one', async () => {
    const first = confirmDialog({ title: 'First?' });
    const second = confirmDialog({ title: 'Second?' });
    expect(await first).toBe(false);
    await nextTick();
    button('Cancel').click();
    expect(await second).toBe(false);
  });

  it('is the only way pages confirm: no window.confirm or alert left in the app', () => {
    for (const file of ['src/views/Admin.vue', 'src/views/PerformanceAnalysis.vue', 'src/views/ChartBuilder.vue', 'src/views/VisualRegressionProject.vue', 'src/components/visual-regression/VrBaselines.vue', 'src/components/visual-regression/VrSharing.vue']) {
      expect(readSource(file)).not.toMatch(/(window\.)?\bconfirm\(|\balert\(/);
    }
  });
});
