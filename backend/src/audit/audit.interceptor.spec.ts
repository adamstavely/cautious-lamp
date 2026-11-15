import { redactSecrets } from './audit.interceptor';

describe('audit log redaction', () => {
  it('redacts credentials at any depth, including names built from token or api key', () => {
    const body = {
      name: 'App',
      password: 'p',
      capabilities: {
        visualRegression: { enabled: true, argosProjectId: 'proj', argosToken: 'SECRET-A' },
        sessionReplay: { enabled: true, openreplayApiKey: 'SECRET-B', openreplay_api_key: 'SECRET-C' },
      },
      integrations: [{ type: 'slack', webhookSecret: 'SECRET-D', clientSecret: 'SECRET-E' }],
      headers: { Authorization: 'Bearer SECRET-F' },
    };
    const redacted = JSON.stringify(redactSecrets(body));
    for (const secret of ['SECRET-A', 'SECRET-B', 'SECRET-C', 'SECRET-D', 'SECRET-E', 'SECRET-F', '"p"']) {
      expect(redacted).not.toContain(secret);
    }
    expect(redacted).toContain('"argosProjectId":"proj"');
    expect(redacted).toContain('"name":"App"');
  });

  it('keeps empty values (nothing to hide) and leaves the original untouched', () => {
    const body = { argosToken: '', nested: { apiKey: null } };
    expect(redactSecrets(body)).toEqual({ argosToken: '', nested: { apiKey: null } });
    const secret = { token: 'x' };
    redactSecrets(secret);
    expect(secret.token).toBe('x');
  });
});
