/**
 * The session-replay project's privacy and capture settings as a flat form
 * (selectors one per line), and back. Defaults match the server's
 * (backend/src/session-replay/capture-settings.ts): private by default.
 */

export const INPUT_MODE_OPTIONS = [
  { value: 'obscured', label: 'Obscure what people type' },
  { value: 'ignored', label: "Don't record inputs" },
  { value: 'plain', label: 'Record inputs as typed' },
];

const DEFAULTS = {
  defaultInputMode: 'obscured',
  privateMode: false,
  obscureTextEmails: true,
  obscureTextNumbers: false,
  obscureInputEmails: true,
  obscureInputNumbers: true,
  respectDoNotTrack: true,
  captureConsole: true,
  captureNetwork: true,
  captureNetworkPayload: false,
  captureIFrames: true,
};

const PRIVACY_FLAGS = ['privateMode', 'obscureTextEmails', 'obscureTextNumbers', 'obscureInputEmails', 'obscureInputNumbers', 'respectDoNotTrack'];
const CAPTURE_FLAGS = ['captureConsole', 'captureNetwork', 'captureNetworkPayload', 'captureIFrames'];

const lines = (list) => (Array.isArray(list) ? list.join('\n') : '');
const fromLines = (text) =>
  String(text ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

/** Form state from a project (or the defaults for a new one) */
export function captureForm(project = {}) {
  const privacy = project.privacySettings ?? {};
  const config = project.config ?? {};
  const form = { defaultInputMode: privacy.defaultInputMode ?? DEFAULTS.defaultInputMode };
  for (const key of PRIVACY_FLAGS) form[key] = typeof privacy[key] === 'boolean' ? privacy[key] : DEFAULTS[key];
  for (const key of CAPTURE_FLAGS) form[key] = typeof config[key] === 'boolean' ? config[key] : DEFAULTS[key];
  form.maskTextSelector = lines(privacy.maskTextSelector);
  form.blockSelector = lines(privacy.blockSelector);
  return form;
}

/** `privacySettings` and `config` for the API */
export function capturePayload(form) {
  const privacySettings = { defaultInputMode: form.defaultInputMode };
  for (const key of PRIVACY_FLAGS) privacySettings[key] = !!form[key];
  privacySettings.maskTextSelector = fromLines(form.maskTextSelector);
  privacySettings.blockSelector = fromLines(form.blockSelector);
  const config = {};
  for (const key of CAPTURE_FLAGS) config[key] = !!form[key];
  // Bodies are only captured along with requests
  if (!config.captureNetwork) config.captureNetworkPayload = false;
  return { privacySettings, config };
}
