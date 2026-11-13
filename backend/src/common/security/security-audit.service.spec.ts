import { AuditService } from '../../audit/audit.service';
import { SecurityAuditService } from './security-audit.service';

describe('SecurityAuditService', () => {
  it('flags a suspicious event once instead of looping on its own warning', async () => {
    const log = jest.fn().mockResolvedValue(undefined);
    const service = new SecurityAuditService({ log } as unknown as AuditService);

    await service.logSecurityEvent({
      type: 'token_rotation',
      severity: 'low',
      description: 'Token rotated',
      userAgent: 'privilege escalation',
    });

    // The original event plus one suspicious-activity event, and no more
    expect(log).toHaveBeenCalledTimes(2);
    expect(log.mock.calls[1][0].resourceId).toBe('suspicious_activity');
  });
});
