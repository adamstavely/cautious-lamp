/** [major, minor, patch] from "2.1.0" / "v2.1.0-beta.1", or null */
export const parseVersion = (version) => {
  const match = typeof version === 'string' ? version.trim().match(/^v?(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/) : null;
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
};

/** -1, 0 or 1. Pre-release suffixes are ignored; an invalid version sorts first. */
export const compareVersions = (a, b) => {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) return pa ? 1 : pb ? -1 : 0;
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1;
  }
  return 0;
};

export const isSemver = (version) => parseVersion(version) !== null;
