import { nextTick } from 'vue';

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const resolve = (target) => (typeof target === 'string' ? document.querySelector(target) : target?.$el ?? target);

/**
 * Where focus goes when the control that had it removes itself (a row's Remove
 * button, an item deleted from a dialog): without this, focus falls to the page
 * and keyboard and screen reader users start again from the top (WCAG 2.4.3).
 *
 * Call it after removing item `index`. Once the DOM has updated, focus moves to
 * the row now at that position, else the one before it, else `fallback` (an
 * Add button, the list's heading). Within a row it prefers an element marked
 * `data-focus-after-remove` (usually the row's own Remove button), else the
 * row's first control, else the row itself.
 *
 * `list` is the element (or a component, or a selector) whose rows match
 * `rows` (direct children by default).
 */
export async function focusAfterRemoval(list, index, { rows = ':scope > *', fallback = null } = {}) {
  await nextTick();
  const container = resolve(list);
  const items = container ? [...container.querySelectorAll(rows)] : [];
  const row = items[Math.min(index, items.length - 1)];
  const target = row
    ? row.querySelector('[data-focus-after-remove]') ?? row.querySelector(FOCUSABLE) ?? row
    : resolve(fallback);
  if (!target) return;
  if (target === row && !target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus();
}

/** Moves focus to an element once the DOM has updated (a dialog's next step, a revealed result) */
export async function focusSoon(target) {
  await nextTick();
  const el = resolve(target);
  if (!el) return;
  if (!el.matches(FOCUSABLE) && !el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus();
}
