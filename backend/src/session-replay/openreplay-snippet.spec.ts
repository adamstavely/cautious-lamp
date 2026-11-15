import { JSDOM, VirtualConsole } from 'jsdom';
import { DEFAULT_CAPTURE_CONFIG, DEFAULT_PRIVACY_SETTINGS, normalizeCaptureConfig, normalizePrivacySettings } from './capture-settings';
import { SnippetInput, integrationSnippets, npmSnippet, scriptSnippet } from './openreplay-snippet';

const PAGE = `<!doctype html><html><head>%SNIPPET%</head><body>
  <div class="card"><span class="secret">4111</span><div class="ad">Ad</div><p>Plain</p></div>
</body></html>`;

/** A stand-in for the tracker: records what it was built with and asked to do */
const STUB_TRACKER = `
  window.trackerCalls = [];
  window.StubTracker = function (options) {
    window.trackerOptions = options;
    this.start = function (opts) { window.trackerCalls.push(['start', opts]); return Promise.resolve({ success: true }); };
    this.stop = function () { window.trackerCalls.push(['stop']); };
    this.setUserID = function (id) { window.trackerCalls.push(['setUserID', id]); };
    this.setUserAnonymousID = function () {};
    this.setMetadata = function () {};
    this.event = function () {};
    this.issue = function () {};
  };`;

/**
 * What openreplay.js does when it loads (OpenReplay's snippet/src/init.js):
 * read the queue the loader left on window.OpenReplay, build the tracker, replay the calls.
 */
const OPENREPLAY_JS = `
  (function () {
    var stack = window.OpenReplay;
    var projectKey = stack.shift();
    var sessionToken = stack.shift();
    var stackOpts = stack.shift();
    var options = Object.assign({ projectKey: projectKey, sessionToken: sessionToken }, stackOpts, { __is_snippet: true });
    var tracker = window.OpenReplay = new window.StubTracker(options);
    while (stack.length) {
      var s = stack.shift();
      if (s[0] === 0) tracker.start(s[1]);
      if (s[0] === 1) tracker.stop();
      if (s[0] === 2) tracker.setUserID(s[1]);
    }
  })();`;

function input(overrides: Partial<SnippetInput> = {}): SnippetInput {
  return {
    projectKey: 'abc123',
    baseUrl: 'https://api.openreplay.com',
    privacy: { ...DEFAULT_PRIVACY_SETTINGS },
    capture: { ...DEFAULT_CAPTURE_CONFIG },
    ...overrides,
  };
}

/** Runs the page with the script snippet in jsdom; throws on any script error */
function runScriptSnippet(snippet: string) {
  const errors: unknown[] = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => errors.push(error));
  const dom = new JSDOM(PAGE.replace('%SNIPPET%', snippet), { runScripts: 'dangerously', virtualConsole });
  const window = dom.window as any;
  const loader = window.document.querySelector('script[src]');
  window.eval(STUB_TRACKER);
  window.eval(OPENREPLAY_JS);
  if (errors.length) throw errors[0];
  return { window, loader };
}

/** Runs the npm snippet as a module would, with the package import pointing at the stub */
function runNpmSnippet(code: string) {
  const dom = new JSDOM(PAGE.replace('%SNIPPET%', ''), { runScripts: 'outside-only' });
  const window = dom.window as any;
  window.eval(STUB_TRACKER);
  const imported = "import OpenReplay from '@openreplay/tracker';";
  expect(code).toContain(imported);
  window.eval(`(function () { ${code.replace(imported, 'var OpenReplay = window.StubTracker;')} })();`);
  return window;
}

describe('OpenReplay integration code', () => {
  it('loads openreplay.js and starts the tracker with the project key, without errors', () => {
    const { window, loader } = runScriptSnippet(scriptSnippet(input()));
    expect(loader.getAttribute('src')).toMatch(/^https:\/\/static\.openreplay\.com\/[\d.]+\/openreplay\.js$/);
    expect(loader.async).toBe(true);
    expect(window.trackerOptions).toMatchObject({ projectKey: 'abc123', defaultInputMode: 1, respectDoNotTrack: true });
    // The cloud is the tracker's default ingest point
    expect(window.trackerOptions.ingestPoint).toBeUndefined();
    expect(window.trackerCalls).toEqual([['start', { userID: '' }]]);
  });

  it('applies the privacy and capture settings in both installs', () => {
    const privacy = normalizePrivacySettings({
      defaultInputMode: 'ignored',
      privateMode: true,
      obscureTextNumbers: true,
      obscureInputEmails: false,
      respectDoNotTrack: false,
      maskTextSelector: ['.secret'],
      blockSelector: ['.ad', '[data-private]'],
    });
    const capture = normalizeCaptureConfig({ captureConsole: false, captureNetwork: true, captureNetworkPayload: true, captureIFrames: false });
    const settings = input({ baseUrl: 'https://replay.example.com', privacy, capture });
    const expected = {
      projectKey: 'abc123',
      ingestPoint: 'https://replay.example.com/ingest',
      defaultInputMode: 2,
      privateMode: true,
      obscureTextEmails: true,
      obscureTextNumbers: true,
      obscureInputEmails: false,
      obscureInputNumbers: true,
      respectDoNotTrack: false,
      captureIFrames: false,
      consoleMethods: [],
      network: { capturePayload: true },
    };

    const { window } = runScriptSnippet(scriptSnippet(settings));
    expect(window.trackerOptions).toMatchObject(expected);
    const npmWindow = runNpmSnippet(npmSnippet(settings));
    expect(npmWindow.trackerOptions).toMatchObject(expected);
    expect(npmWindow.trackerCalls).toEqual([['start', undefined]]);

    // The selectors become a domSanitizer: 2 hides an element, 1 obscures its text
    for (const win of [window, npmWindow]) {
      const sanitize = win.trackerOptions.domSanitizer;
      const doc = win.document;
      expect(sanitize(doc.querySelector('.ad'))).toBe(2);
      expect(sanitize(doc.querySelector('.secret'))).toBe(1);
      expect(sanitize(doc.querySelector('p'))).toBe(0);
    }
  });

  it('turns network capture off entirely when asked', () => {
    const { window } = runScriptSnippet(scriptSnippet(input({ capture: normalizeCaptureConfig({ captureNetwork: false }) })));
    expect(window.trackerOptions.network).toEqual({ disabled: true });
    expect(window.trackerOptions.domSanitizer).toBeUndefined();
    expect(window.trackerOptions.consoleMethods).toBeUndefined();
  });

  it('keeps project keys and selectors from closing the script tag', () => {
    const hostile = 'abc"</script><script>alert(1)</script>';
    const code = scriptSnippet(
      input({ projectKey: hostile, privacy: normalizePrivacySettings({ maskTextSelector: ['</script><img src=x>'] }) }),
    );
    expect(code.match(/<\/script>/g)).toHaveLength(1);
    expect(code).toContain('"abc\\"\\u003c/script>\\u003cscript>alert(1)\\u003c/script>"');
  });

  it('offers the npm install for the same tracker major version', () => {
    expect(integrationSnippets(input()).npmInstall).toBe('npm i @openreplay/tracker@^19');
  });

  it('uses OPENREPLAY_TRACKER_SCRIPT_URL for the script when set', () => {
    process.env.OPENREPLAY_TRACKER_SCRIPT_URL = 'https://cdn.example.com/openreplay.js';
    try {
      expect(scriptSnippet(input())).toContain('"https://cdn.example.com/openreplay.js",1,0,initOpts,startOpts');
    } finally {
      delete process.env.OPENREPLAY_TRACKER_SCRIPT_URL;
    }
  });
});
