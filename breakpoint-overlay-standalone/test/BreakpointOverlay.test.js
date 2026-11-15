import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { initBreakpointOverlay } from '../src/index.js';

const press = (init, target = window) => {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
};

const flush = async () => {
  await Promise.resolve();
  await nextTick();
};

describe('BreakpointOverlay', () => {
  let overlay;
  let writeText;

  beforeEach(() => {
    window.innerWidth = 900;
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  });

  afterEach(() => {
    overlay?.destroy();
    overlay = undefined;
    document.body.style.overflow = '';
  });

  it('shows the active breakpoint in the badge', () => {
    overlay = initBreakpointOverlay();
    expect(document.querySelector('.badge-label').textContent).toBe('Small');
  });

  it('toggles on the hotkey and stops the event reaching the page', async () => {
    overlay = initBreakpointOverlay();
    const pageListener = vi.fn();
    document.body.addEventListener('keydown', pageListener);

    const event = press({ key: 'O', code: 'KeyO', altKey: true, shiftKey: true }, document.body);
    await nextTick();

    expect(event.defaultPrevented).toBe(true);
    expect(pageListener).not.toHaveBeenCalled();
    expect(document.querySelector('.breakpoint-overlay')).not.toBeNull();
    document.body.removeEventListener('keydown', pageListener);
  });

  it('closes on Escape and gives the page its scrolling back', async () => {
    overlay = initBreakpointOverlay();
    press({ key: 'o', code: 'KeyO', altKey: true, shiftKey: true });
    await nextTick();
    expect(document.body.style.overflow).toBe('hidden');

    press({ key: 'Escape', code: 'Escape' });
    await nextTick();
    expect(document.querySelector('.breakpoint-overlay')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });

  it('ignores the hotkey when it is disabled', async () => {
    overlay = initBreakpointOverlay({ hotkey: '' });
    const event = press({ key: 'o', code: 'KeyO', altKey: true, shiftKey: true });
    await nextTick();
    expect(event.defaultPrevented).toBe(false);
    expect(document.querySelector('.breakpoint-overlay')).toBeNull();
  });

  it('copies a ruler marker\'s media query and reports the selection', async () => {
    const onSelect = vi.fn();
    overlay = initBreakpointOverlay({ breakpoints: [{ id: 'md', label: 'Medium', minWidth: 768 }], onSelect });
    press({ key: 'o', code: 'KeyO', altKey: true, shiftKey: true });
    await nextTick();

    document.querySelector('.ruler-marker').click();
    await flush();

    expect(writeText).toHaveBeenCalledWith('@media (min-width: 768px)');
    expect(onSelect).toHaveBeenCalledWith({
      breakpoint: { id: 'md', label: 'Medium', minWidth: 768 },
      mediaQuery: '@media (min-width: 768px)',
      copied: true,
    });
    expect(document.querySelector('.ruler-status').textContent).toBe('Copied @media (min-width: 768px)');
  });

  it('shows the query to copy by hand when the clipboard is unavailable', async () => {
    writeText.mockRejectedValue(new Error('denied'));
    const onSelect = vi.fn();
    overlay = initBreakpointOverlay({ breakpoints: [{ id: 'm', label: 'Mobile', maxWidth: 767 }], onSelect });
    press({ key: 'o', code: 'KeyO', altKey: true, shiftKey: true });
    await nextTick();

    document.querySelector('.ruler-marker-max').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await flush();

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ mediaQuery: '@media (max-width: 767px)', copied: false }));
    expect(document.querySelector('.ruler-status').textContent).toBe("Couldn't copy to the clipboard: @media (max-width: 767px)");
  });
});
