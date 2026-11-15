import { BadRequestException } from '@nestjs/common';
import { JSDOM } from 'jsdom';

/** How the tracker records what people type: as typed, as asterisks, or not at all */
export const INPUT_MODES = ['plain', 'obscured', 'ignored'] as const;
export type InputMode = (typeof INPUT_MODES)[number];

/** The tracker's `defaultInputMode` (0 plain, 1 obscured, 2 ignored) */
export const INPUT_MODE_VALUE: Record<InputMode, 0 | 1 | 2> = { plain: 0, obscured: 1, ignored: 2 };

export const MAX_SELECTORS = 20;
export const MAX_SELECTOR_LENGTH = 200;

/**
 * What the OpenReplay tracker may record. Each field maps onto a tracker option
 * (docs.openreplay.com/en/sdk/constructor); see openreplay-snippet.ts.
 */
export interface PrivacySettings {
  /** defaultInputMode */
  defaultInputMode: InputMode;
  /** privateMode: masks all text unless an element is marked data-openreplay-unmask */
  privateMode: boolean;
  obscureTextEmails: boolean;
  obscureTextNumbers: boolean;
  obscureInputEmails: boolean;
  obscureInputNumbers: boolean;
  /** Elements whose text is obscured (domSanitizer level 1) */
  maskTextSelector: string[];
  /** Elements left out of the recording (domSanitizer level 2) */
  blockSelector: string[];
  respectDoNotTrack: boolean;
}

export interface CaptureConfig {
  /** Off: consoleMethods [] */
  captureConsole: boolean;
  /** Off: network.disabled */
  captureNetwork: boolean;
  /** network.capturePayload: request and response bodies, which can hold personal data */
  captureNetworkPayload: boolean;
  /** captureIFrames (same-origin frames) */
  captureIFrames: boolean;
}

/** Private by default: inputs and emails obscured, no request bodies, Do Not Track respected */
export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  defaultInputMode: 'obscured',
  privateMode: false,
  obscureTextEmails: true,
  obscureTextNumbers: false,
  obscureInputEmails: true,
  obscureInputNumbers: true,
  maskTextSelector: [],
  blockSelector: [],
  respectDoNotTrack: true,
};

export const DEFAULT_CAPTURE_CONFIG: CaptureConfig = {
  captureConsole: true,
  captureNetwork: true,
  captureNetworkPayload: false,
  captureIFrames: true,
};

/**
 * Settings in the current shape. Projects saved before these settings existed
 * (and the applications form) use `maskAllInputs` and `maskAllText`: they
 * become `defaultInputMode` (obscured or plain) and `privateMode`, unless the
 * new field is also given.
 */
export function translateLegacyPrivacy(raw: Record<string, any> | undefined | null): Record<string, any> {
  const { maskAllInputs, maskAllText, ...input } = raw ?? {};
  if (typeof maskAllInputs === 'boolean' && input.defaultInputMode === undefined) {
    input.defaultInputMode = maskAllInputs ? 'obscured' : 'plain';
  }
  if (typeof maskAllText === 'boolean' && input.privateMode === undefined) input.privateMode = maskAllText;
  return input;
}

/** Stored or submitted privacy settings (either shape), with defaults filled in */
export function normalizePrivacySettings(raw: Record<string, any> | undefined | null): PrivacySettings {
  const input = translateLegacyPrivacy(raw);
  const settings: PrivacySettings = { ...DEFAULT_PRIVACY_SETTINGS };
  if (INPUT_MODES.includes(input.defaultInputMode)) settings.defaultInputMode = input.defaultInputMode;
  for (const key of ['privateMode', 'obscureTextEmails', 'obscureTextNumbers', 'obscureInputEmails', 'obscureInputNumbers', 'respectDoNotTrack'] as const) {
    if (typeof input[key] === 'boolean') settings[key] = input[key];
  }
  settings.maskTextSelector = selectorList(input.maskTextSelector);
  settings.blockSelector = selectorList(input.blockSelector);
  return settings;
}

export function normalizeCaptureConfig(raw: Record<string, any> | undefined | null): CaptureConfig {
  const input = raw ?? {};
  const config: CaptureConfig = { ...DEFAULT_CAPTURE_CONFIG };
  for (const key of Object.keys(DEFAULT_CAPTURE_CONFIG) as Array<keyof CaptureConfig>) {
    if (typeof input[key] === 'boolean') config[key] = input[key];
  }
  return config;
}

function selectorList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((s): s is string => typeof s === 'string').map((s) => s.trim()).filter(Boolean);
}

let selectorDocument: Document | undefined;

/**
 * Throws 400 for a selector the browser would reject, since the generated
 * snippet runs each one through `Element.matches`.
 */
export function assertValidSelectors(settings: PrivacySettings): void {
  selectorDocument ??= new JSDOM('<!doctype html><body></body>').window.document;
  for (const [field, selectors] of [
    ['maskTextSelector', settings.maskTextSelector],
    ['blockSelector', settings.blockSelector],
  ] as const) {
    if (selectors.length > MAX_SELECTORS) throw new BadRequestException(`${field} can have at most ${MAX_SELECTORS} selectors`);
    for (const selector of selectors) {
      if (selector.length > MAX_SELECTOR_LENGTH) {
        throw new BadRequestException(`${field}: each selector can be at most ${MAX_SELECTOR_LENGTH} characters`);
      }
      try {
        selectorDocument.body.matches(selector);
      } catch {
        throw new BadRequestException(`${field}: "${selector}" is not a valid CSS selector`);
      }
    }
  }
}
