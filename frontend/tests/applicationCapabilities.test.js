// The applications capability form sends session-replay privacy in the current
// shape (input mode, private mode, obscure flags), never the older
// maskAllInputs/maskAllText, reads applications saved with those, and keeps
// the OpenReplay project key and numeric project id apart.
import { describe, expect, it } from 'vitest';
import { capabilitiesForm, capabilitiesPayload, privacyForm } from '../src/components/applications/capabilities.js';

const app = (sessionReplay) => ({
  capabilities: {
    governance: { enabled: false, rules: [], scanSchedule: 'manual' },
    visualRegression: { enabled: false },
    sessionReplay,
  },
});

describe('session replay capability', () => {
  it('sends the current privacy fields and the project id for a new application', () => {
    const form = capabilitiesForm();
    Object.assign(form.sessionReplay, { enabled: true, openreplayProjectKey: 'abcKey12', openreplayProjectId: '42' });
    form.sessionReplay.privacySettings.defaultInputMode = 'ignored';
    form.sessionReplay.privacySettings.privateMode = true;

    const { sessionReplay } = capabilitiesPayload(form);
    expect(sessionReplay).toMatchObject({ enabled: true, openreplayProjectKey: 'abcKey12', openreplayProjectId: 42 });
    expect(sessionReplay.privacySettings).toEqual({
      defaultInputMode: 'ignored',
      privateMode: true,
      obscureTextEmails: true,
      obscureTextNumbers: false,
      obscureInputEmails: true,
      obscureInputNumbers: true,
      respectDoNotTrack: true,
    });
    expect(sessionReplay.privacySettings).not.toHaveProperty('maskAllInputs');
    expect(sessionReplay.privacySettings).not.toHaveProperty('maskAllText');
  });

  it('leaves the id out of a new application when none is typed', () => {
    const form = capabilitiesForm();
    Object.assign(form.sessionReplay, { enabled: true, openreplayProjectKey: 'abcKey12' });
    expect(capabilitiesPayload(form).sessionReplay).not.toHaveProperty('openreplayProjectId');
  });

  it('reads an application saved with the older privacy fields', () => {
    expect(privacyForm({ maskAllInputs: false, maskAllText: true, respectDoNotTrack: false })).toMatchObject({
      defaultInputMode: 'plain',
      privateMode: true,
      respectDoNotTrack: false,
    });
    // The current fields win over the older ones
    expect(privacyForm({ maskAllInputs: true, defaultInputMode: 'ignored' }).defaultInputMode).toBe('ignored');
  });

  it('sends nothing for an unchanged application, even one with older fields', () => {
    const saved = app({ enabled: true, projectId: 'sr_1', openreplayProjectKey: 'abcKey12', openreplayProjectId: 7, privacySettings: { maskAllInputs: true, maskAllText: false } });
    expect(capabilitiesPayload(capabilitiesForm(saved), saved)).toEqual({});
  });

  it('sends a changed or cleared project id, and changed privacy in the current shape', () => {
    const saved = app({ enabled: true, projectId: 'sr_1', openreplayProjectKey: 'abcKey12', openreplayProjectId: 7 });
    const form = capabilitiesForm(saved);
    expect(form.sessionReplay.openreplayProjectId).toBe('7');

    form.sessionReplay.openreplayProjectId = '8';
    expect(capabilitiesPayload(form, saved).sessionReplay).toEqual({ enabled: true, openreplayProjectKey: 'abcKey12', openreplayProjectId: 8 });

    form.sessionReplay.openreplayProjectId = '';
    expect(capabilitiesPayload(form, saved).sessionReplay.openreplayProjectId).toBeNull();

    form.sessionReplay.openreplayProjectId = '7';
    form.sessionReplay.privacySettings.obscureTextNumbers = true;
    const { sessionReplay } = capabilitiesPayload(form, saved);
    expect(sessionReplay).not.toHaveProperty('openreplayProjectId');
    expect(sessionReplay.privacySettings).toMatchObject({ defaultInputMode: 'obscured', obscureTextNumbers: true });
  });
});
