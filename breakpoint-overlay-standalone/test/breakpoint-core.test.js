import { describe, expect, it, vi } from 'vitest';
import {
  autoInitOptions,
  formatBreakpointRange,
  isBreakpointActive,
  isEditableTarget,
  matchesHotkey,
  mediaQueryFor,
  parseHotkey,
} from '../src/breakpoint-core.mjs';

const key = (overrides) => ({ key: '', code: '', altKey: false, ctrlKey: false, shiftKey: false, metaKey: false, ...overrides });

const scriptWith = (attrs) => {
  const script = document.createElement('script');
  for (const [name, value] of Object.entries(attrs)) script.setAttribute(name, value);
  return script;
};

describe('breakpoints', () => {
  it('matches min-width, max-width and ranges inclusively', () => {
    expect(isBreakpointActive({ minWidth: 768 }, 768)).toBe(true);
    expect(isBreakpointActive({ minWidth: 768 }, 767)).toBe(false);
    expect(isBreakpointActive({ maxWidth: 767 }, 767)).toBe(true);
    expect(isBreakpointActive({ minWidth: 768, maxWidth: 1023 }, 1023)).toBe(true);
    expect(isBreakpointActive({ minWidth: 768, maxWidth: 1023 }, 1024)).toBe(false);
    expect(isBreakpointActive({}, 500)).toBe(false);
  });

  it('formats ranges and media queries', () => {
    expect(formatBreakpointRange({ minWidth: 768, maxWidth: 1023 })).toBe('768px - 1023px');
    expect(formatBreakpointRange({ maxWidth: 767 })).toBe('≤ 767px');
    expect(mediaQueryFor({ minWidth: 768 })).toBe('@media (min-width: 768px)');
    expect(mediaQueryFor({ maxWidth: 767 })).toBe('@media (max-width: 767px)');
    expect(mediaQueryFor({ minWidth: 768, maxWidth: 1023 })).toBe('@media (min-width: 768px) and (max-width: 1023px)');
  });
});

describe('hotkeys', () => {
  it('needs the exact modifiers', () => {
    const parsed = parseHotkey('alt+shift+o');
    expect(matchesHotkey(key({ key: 'O', code: 'KeyO', altKey: true, shiftKey: true }), parsed)).toBe(true);
    expect(matchesHotkey(key({ key: 'O', code: 'KeyO', altKey: true, shiftKey: true, ctrlKey: true }), parsed)).toBe(false);
    expect(matchesHotkey(key({ key: 'o', code: 'KeyO', altKey: true }), parsed)).toBe(false);
  });

  it('falls back to event.code for letters and digits (Alt changes event.key on a Mac)', () => {
    expect(matchesHotkey(key({ key: 'Ø', code: 'KeyO', altKey: true, shiftKey: true }), parseHotkey('alt+shift+o'))).toBe(true);
    expect(matchesHotkey(key({ key: '¡', code: 'Digit1', altKey: true }), parseHotkey('alt+1'))).toBe(true);
  });

  it('accepts modifier aliases', () => {
    expect(parseHotkey('Cmd+Control+K')).toEqual({ modifiers: { alt: false, ctrl: true, shift: false, meta: true }, key: 'k' });
  });

  it('treats an empty hotkey as disabled', () => {
    expect(parseHotkey('')).toBeNull();
    expect(parseHotkey('  ')).toBeNull();
    expect(matchesHotkey(key({ key: 'o', altKey: true, shiftKey: true }), null)).toBe(false);
  });

  it('ignores fields people type in', () => {
    expect(isEditableTarget(document.createElement('input'))).toBe(true);
    expect(isEditableTarget(document.createElement('textarea'))).toBe(true);
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    expect(isEditableTarget(editable)).toBe(true);
    expect(isEditableTarget(document.createElement('div'))).toBe(false);
  });
});

describe('auto-init attributes', () => {
  it('reads the hotkey, debounce and breakpoints', () => {
    expect(autoInitOptions(scriptWith({ 'data-hotkey': 'ctrl+b', 'data-debounce-ms': '50', 'data-breakpoints': '[{"id":"m","maxWidth":767}]' }))).toEqual({
      hotkey: 'ctrl+b',
      debounceMs: 50,
      breakpoints: [{ id: 'm', maxWidth: 767 }],
    });
  });

  it('disables the shortcut with data-hotkey=""', () => {
    expect(autoInitOptions(scriptWith({ 'data-hotkey': '' }))).toEqual({ hotkey: '' });
  });

  it('uses the defaults for missing or invalid attributes', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(autoInitOptions(scriptWith({ 'data-breakpoints': 'not json', 'data-debounce-ms': 'soon' }))).toEqual({});
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
