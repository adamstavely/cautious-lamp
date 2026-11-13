import { OpenReplayApiClient } from './openreplay-api.client';

describe('OpenReplayApiClient.getIntegrationCode', () => {
  it('keeps project keys and selectors from closing the script tag', () => {
    const client = new OpenReplayApiClient('https://api.openreplay.com', 'key');
    const code = client.getIntegrationCode('abc"</script><script>alert(1)</script>', undefined, {
      privacySettings: { maskTextSelector: ['</script><img src=x>'] },
    });
    expect(code.match(/<\/script>/g)).toHaveLength(1);
    expect(code).toContain('"abc\\"\\u003c/script>\\u003cscript>alert(1)\\u003c/script>"');
  });
});
