// Hand-written declarations for src/index.js and LoupeTool.vue (the sources
// are JavaScript, so there is nothing for a declaration emitter to type).
import type { DefineComponent } from 'vue';

export interface LoupeToolProps {
  /** Design System API base URL, default 'http://localhost:3000/api/v1' */
  apiUrl?: string;
  /** Sent as `Authorization: Bearer <apiKey>` when set */
  apiKey?: string;
}

export interface LoupeToolOptions extends LoupeToolProps {
  /** Where the tool is mounted, default document.body */
  container?: HTMLElement;
}

export interface LoupeToolHandle {
  destroy(): void;
}

export declare function initLoupeTool(options?: LoupeToolOptions): LoupeToolHandle;

export declare const LoupeTool: DefineComponent<LoupeToolProps>;
export default LoupeTool;

declare global {
  interface Window {
    /** Set when the UMD script is loaded with `data-auto-init` */
    loupeTool?: LoupeToolHandle;
  }
}
