import { CaptureConfig, INPUT_MODE_VALUE, PrivacySettings } from './capture-settings';
import { openReplayIngestPoint } from './openreplay-url';

/**
 * The tracker version the script tag loads. static.openreplay.com does not
 * host every npm release, so this is one it does; OPENREPLAY_TRACKER_SCRIPT_URL
 * overrides the whole URL (a self-hosted copy, or another version).
 */
export const OPENREPLAY_TRACKER_VERSION = '19.0.0';
/** The npm install pins the same major version */
export const OPENREPLAY_TRACKER_NPM_RANGE = '^19';

export function trackerScriptUrl(): string {
  return process.env.OPENREPLAY_TRACKER_SCRIPT_URL?.trim() || `https://static.openreplay.com/${OPENREPLAY_TRACKER_VERSION}/openreplay.js`;
}

export interface SnippetInput {
  projectKey: string;
  /** The project's OpenReplay base URL; the ingest point is derived from it */
  baseUrl: string;
  privacy: PrivacySettings;
  capture: CaptureConfig;
}

export interface IntegrationSnippets {
  /** `<script>` for the page's <head>: OpenReplay's own loader snippet */
  script: string;
  /** `npm i` command for the package install */
  npmInstall: string;
  /** Module code for the package install */
  npm: string;
}

/**
 * A JS literal that is safe inside an inline <script>: JSON, with `<`, U+2028
 * and U+2029 escaped so a value can't close the tag or break the line.
 */
export function scriptLiteral(value: unknown, indent?: number): string {
  return JSON.stringify(value, null, indent)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * The tracker's constructor options as `[name, JS source]` pairs. Values are
 * literals except `domSanitizer`, a function that applies the selectors:
 * 2 (hidden) for blocked elements, 1 (obscured) for masked ones.
 */
export function trackerOptionEntries({ projectKey, baseUrl, privacy, capture }: SnippetInput): Array<[string, string]> {
  const entries: Array<[string, string]> = [['projectKey', scriptLiteral(projectKey)]];
  const ingestPoint = openReplayIngestPoint(baseUrl);
  if (ingestPoint) entries.push(['ingestPoint', scriptLiteral(ingestPoint)]);
  entries.push(
    ['defaultInputMode', String(INPUT_MODE_VALUE[privacy.defaultInputMode])],
    ['obscureTextEmails', String(privacy.obscureTextEmails)],
    ['obscureTextNumbers', String(privacy.obscureTextNumbers)],
    ['obscureInputEmails', String(privacy.obscureInputEmails)],
    ['obscureInputNumbers', String(privacy.obscureInputNumbers)],
    ['privateMode', String(privacy.privateMode)],
    ['respectDoNotTrack', String(privacy.respectDoNotTrack)],
    ['captureIFrames', String(capture.captureIFrames)],
  );
  if (!capture.captureConsole) entries.push(['consoleMethods', '[]']);
  entries.push([
    'network',
    capture.captureNetwork ? `{ capturePayload: ${capture.captureNetworkPayload} }` : '{ disabled: true }',
  ]);
  if (privacy.blockSelector.length || privacy.maskTextSelector.length) {
    entries.push(['domSanitizer', domSanitizerSource(privacy)]);
  }
  return entries;
}

function domSanitizerSource(privacy: PrivacySettings): string {
  const lines = ['function (node) {'];
  if (privacy.blockSelector.length) {
    lines.push(`  if (node.matches(${scriptLiteral(privacy.blockSelector.join(', '))})) return 2;`);
  }
  if (privacy.maskTextSelector.length) {
    lines.push(`  if (node.matches(${scriptLiteral(privacy.maskTextSelector.join(', '))})) return 1;`);
  }
  lines.push('  return 0;', '}');
  return lines.join('\n');
}

function objectSource(entries: Array<[string, string]>, indent: string): string {
  const body = entries.map(([key, value]) => `${indent}  ${key}: ${value.split('\n').join(`\n${indent}  `)},`).join('\n');
  return `{\n${body}\n${indent}}`;
}

/**
 * OpenReplay's loader snippet (as its dashboard generates it): it queues calls
 * on `window.OpenReplay` and appends openreplay.js, which reads the queue and
 * starts the tracker with `initOpts`.
 */
export function scriptSnippet(input: SnippetInput): string {
  const initOpts = objectSource(trackerOptionEntries(input), '  ');
  return `<!-- OpenReplay session replay -->
<script>
  var initOpts = ${initOpts};
  // Sessions are listed by user: set userID once you know who is signed in (or call OpenReplay.setUserID later)
  var startOpts = { userID: "" };
  (function(A,s,a,y,e,r){
    r=window.OpenReplay=[e,r,y,[s-1, e]];
    s=document.createElement('script');s.src=A;s.async=!a;
    document.getElementsByTagName('head')[0].appendChild(s);
    r.start=function(v){r.push([0])};
    r.stop=function(v){r.push([1])};
    r.setUserID=function(id){r.push([2,id])};
    r.setUserAnonymousID=function(id){r.push([3,id])};
    r.setMetadata=function(k,v){r.push([4,k,v])};
    r.event=function(k,p,i){r.push([5,k,p,i])};
    r.issue=function(k,p){r.push([6,k,p])};
    r.isActive=function(){return false};
    r.getSessionToken=function(){};
  })(${scriptLiteral(trackerScriptUrl())},1,0,initOpts,startOpts);
</script>`;
}

/** The same options for the `@openreplay/tracker` package */
export function npmSnippet(input: SnippetInput): string {
  return `import OpenReplay from '@openreplay/tracker';

const tracker = new OpenReplay(${objectSource(trackerOptionEntries(input), '')});

tracker.start();

// Sessions are listed by user: call this once you know who is signed in
// tracker.setUserID(user.id);
`;
}

export function integrationSnippets(input: SnippetInput): IntegrationSnippets {
  return {
    script: scriptSnippet(input),
    npmInstall: `npm i @openreplay/tracker@${OPENREPLAY_TRACKER_NPM_RANGE}`,
    npm: npmSnippet(input),
  };
}
