// Hand-written declarations for src/index.js and BreakpointOverlay.vue (the
// sources are JavaScript, so there is nothing for a declaration emitter to type).
import type { DefineComponent } from 'vue';

export interface Breakpoint {
  id: string;
  label: string;
  minWidth?: number;
  maxWidth?: number;
}

export interface BreakpointOverlayProps {
  /** Default: Tailwind's sm/md/lg/xl/2xl */
  breakpoints?: Breakpoint[];
  /** modifier+...+key, default 'alt+shift+o'; '' disables the shortcut */
  hotkey?: string;
  /** Resize debounce in ms, default 150 */
  debounceMs?: number;
}

/** Sent when a ruler marker is clicked: its media query has been copied to the clipboard if `copied` */
export interface BreakpointSelection {
  breakpoint: Breakpoint;
  /** e.g. '@media (min-width: 768px)' */
  mediaQuery: string;
  copied: boolean;
}

export interface BreakpointOverlayOptions extends BreakpointOverlayProps {
  /** Called when a ruler marker is clicked (the component's `select` event) */
  onSelect?: (selection: BreakpointSelection) => void;
  /** Where the overlay is mounted, default document.body */
  container?: HTMLElement;
}

export interface BreakpointOverlayHandle {
  destroy(): void;
}

export declare function initBreakpointOverlay(options?: BreakpointOverlayOptions): BreakpointOverlayHandle;

export declare const BreakpointOverlay: DefineComponent<
  BreakpointOverlayProps & { onSelect?: (selection: BreakpointSelection) => void }
>;
export default BreakpointOverlay;

declare global {
  interface Window {
    /** Set when the UMD script is loaded with `data-auto-init` */
    breakpointOverlay?: BreakpointOverlayHandle;
  }
}
