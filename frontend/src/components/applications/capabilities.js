/**
 * Form state for an application's capabilities, and the PATCH/registration
 * payload built from it (docs/WORKSPACES.md, "Applications").
 *
 * Tokens (argosToken, openreplayApiKey) are write-only: the server passes them
 * to the visual-regression / session-replay project and never returns them,
 * so the form starts them empty and only sends them when typed.
 */
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
      openreplayBaseUrl: caps.sessionReplay?.openreplayBaseUrl ?? '',
      openreplayApiKey: '',
      linked: !!caps.sessionReplay?.projectId,
      privacySettings: {
        maskAllInputs: caps.sessionReplay?.privacySettings?.maskAllInputs === true,
        maskAllText: caps.sessionReplay?.privacySettings?.maskAllText === true,
        respectDoNotTrack: caps.sessionReplay?.privacySettings?.respectDoNotTrack === true,
      },
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
  const privacyBefore = srBefore?.privacySettings ?? {};
  const privacyChanged = Object.entries(sr.privacySettings).some(([key, value]) => value !== (privacyBefore[key] === true));
  if (!caps || sr.enabled !== (srBefore?.enabled === true) || Object.keys(srFields).length || (sr.enabled && privacyChanged)) {
    payload.sessionReplay = { enabled: sr.enabled, ...srFields };
    if (sr.enabled && !payload.sessionReplay.openreplayProjectKey && sr.openreplayProjectKey.trim()) {
      payload.sessionReplay.openreplayProjectKey = sr.openreplayProjectKey.trim();
    }
    if (sr.enabled && (!caps || privacyChanged)) payload.sessionReplay.privacySettings = { ...sr.privacySettings };
  }
  return payload;
};
