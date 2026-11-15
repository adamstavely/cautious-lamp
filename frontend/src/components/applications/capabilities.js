/**
 * Form state for an application's capabilities, and the PATCH/registration
 * payload built from it (docs/WORKSPACES.md, "Applications").
 *
 * Tokens (argosToken, openreplayApiKey) are write-only: the server passes them
 * to the visual-regression / session-replay project and never returns them,
 * so the form starts them empty and only sends them when typed.
 *
 * Session-replay privacy settings use the session-replay project's shape
 * (components/session-replay/captureSettings.js). Applications saved before it
 * may hold the older `maskAllInputs` / `maskAllText`; the form reads those as
 * the input mode and private mode, and only ever sends the current fields.
 */
import { captureForm } from '../session-replay/captureSettings.js';

/** The privacy fields the applications form edits (selectors are edited on the session-replay project) */
export const PRIVACY_FIELDS = ['defaultInputMode', 'privateMode', 'obscureTextEmails', 'obscureTextNumbers', 'obscureInputEmails', 'obscureInputNumbers', 'respectDoNotTrack'];

/** Stored privacy settings, either shape, as the form's fields with defaults filled in */
export const privacyForm = (stored = {}) => {
  const { maskAllInputs, maskAllText, ...current } = stored ?? {};
  if (typeof maskAllInputs === 'boolean' && current.defaultInputMode === undefined) current.defaultInputMode = maskAllInputs ? 'obscured' : 'plain';
  if (typeof maskAllText === 'boolean' && current.privateMode === undefined) current.privateMode = maskAllText;
  const form = captureForm({ privacySettings: current });
  return Object.fromEntries(PRIVACY_FIELDS.map((key) => [key, form[key]]));
};

/** The numeric OpenReplay project id as typed, or null when the field is empty */
const projectIdOf = (value) => {
  const text = String(value ?? '').trim();
  return text === '' ? null : Number(text);
};

export const capabilitiesForm = (app = null) => {
  const caps = app?.capabilities ?? {};
  return {
    governance: {
      enabled: caps.governance?.enabled === true,
      rules: [...(caps.governance?.rules ?? [])],
      // 'on-commit' was never run and is no longer accepted; it behaves as manual
      scanSchedule: ['daily', 'weekly'].includes(caps.governance?.scanSchedule) ? caps.governance.scanSchedule : 'manual',
    },
    visualRegression: {
      enabled: caps.visualRegression?.enabled === true,
      argosProjectId: caps.visualRegression?.argosProjectId ?? '',
      argosBaseUrl: caps.visualRegression?.argosBaseUrl ?? '',
      argosBranch: caps.visualRegression?.argosBranch ?? '',
      argosToken: '',
      linked: !!caps.visualRegression?.projectId,
    },
    sessionReplay: {
      enabled: caps.sessionReplay?.enabled === true,
      openreplayProjectKey: caps.sessionReplay?.openreplayProjectKey ?? '',
      openreplayProjectId: caps.sessionReplay?.openreplayProjectId != null ? String(caps.sessionReplay.openreplayProjectId) : '',
      openreplayBaseUrl: caps.sessionReplay?.openreplayBaseUrl ?? '',
      openreplayApiKey: '',
      linked: !!caps.sessionReplay?.projectId,
      privacySettings: privacyForm(caps.sessionReplay?.privacySettings),
    },
  };
};

/** Copies `keys` of `form` that are non-empty and differ from `original` */
const changed = (form, original, keys) => {
  const out = {};
  for (const key of keys) {
    const value = typeof form[key] === 'string' ? form[key].trim() : form[key];
    if (value === '' || value === undefined) continue;
    if (original && original[key] === value) continue;
    out[key] = value;
  }
  return out;
};

/**
 * The capabilities payload. With `app`, only what changed is sent (so saving
 * one capability doesn't touch another's linked project).
 */
export const capabilitiesPayload = (form, app = null) => {
  const caps = app?.capabilities ?? null;
  const payload = {};

  const gov = form.governance;
  const govBefore = caps?.governance;
  if (
    !caps ||
    gov.enabled !== (govBefore?.enabled === true) ||
    gov.scanSchedule !== (govBefore?.scanSchedule ?? 'manual') ||
    JSON.stringify([...gov.rules].sort()) !== JSON.stringify([...(govBefore?.rules ?? [])].sort())
  ) {
    payload.governance = gov.enabled ? { enabled: true, rules: gov.rules, scanSchedule: gov.scanSchedule } : { enabled: false };
  }

  const vr = form.visualRegression;
  const vrBefore = caps?.visualRegression;
  const vrFields = vr.enabled ? changed(vr, vrBefore, ['argosProjectId', 'argosBaseUrl', 'argosBranch', 'argosToken']) : {};
  if (!caps || vr.enabled !== (vrBefore?.enabled === true) || Object.keys(vrFields).length) {
    payload.visualRegression = { enabled: vr.enabled, ...vrFields };
    // Enabling needs the project id even if it was stored before
    if (vr.enabled && !payload.visualRegression.argosProjectId && vr.argosProjectId.trim()) {
      payload.visualRegression.argosProjectId = vr.argosProjectId.trim();
    }
  }

  const sr = form.sessionReplay;
  const srBefore = caps?.sessionReplay;
  const srFields = sr.enabled ? changed(sr, srBefore, ['openreplayProjectKey', 'openreplayBaseUrl', 'openreplayApiKey']) : {};
  const privacyBefore = privacyForm(srBefore?.privacySettings);
  const privacyChanged = PRIVACY_FIELDS.some((key) => sr.privacySettings[key] !== privacyBefore[key]);
  const projectId = projectIdOf(sr.openreplayProjectId);
  const projectIdChanged = projectId !== (srBefore?.openreplayProjectId ?? null);
  if (!caps || sr.enabled !== (srBefore?.enabled === true) || Object.keys(srFields).length || (sr.enabled && (privacyChanged || projectIdChanged))) {
    payload.sessionReplay = { enabled: sr.enabled, ...srFields };
    if (sr.enabled && !payload.sessionReplay.openreplayProjectKey && sr.openreplayProjectKey.trim()) {
      payload.sessionReplay.openreplayProjectKey = sr.openreplayProjectKey.trim();
    }
    // null clears a stored id; a new application only sends one that was typed
    if (sr.enabled && (caps ? projectIdChanged : projectId !== null)) payload.sessionReplay.openreplayProjectId = projectId;
    if (sr.enabled && (!caps || privacyChanged)) {
      payload.sessionReplay.privacySettings = Object.fromEntries(PRIVACY_FIELDS.map((key) => [key, sr.privacySettings[key]]));
    }
  }
  return payload;
};
