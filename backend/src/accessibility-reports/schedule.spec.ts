import { BadRequestException } from '@nestjs/common';
import { calculateNextRun } from './schedule';

const at = (iso: string) => new Date(iso);
const next = (timing: Parameters<typeof calculateNextRun>[0], from: string) => calculateNextRun(timing, at(from)).toISOString();

describe('calculateNextRun (UTC)', () => {
  it('daily: later today, or tomorrow once the time has passed (or is now)', () => {
    expect(next({ frequency: 'daily', time: '09:00' }, '2026-03-10T08:59:00Z')).toBe('2026-03-10T09:00:00.000Z');
    expect(next({ frequency: 'daily', time: '09:00' }, '2026-03-10T09:00:00Z')).toBe('2026-03-11T09:00:00.000Z');
    expect(next({ frequency: 'daily', time: '23:30' }, '2026-12-31T23:45:00Z')).toBe('2027-01-01T23:30:00.000Z');
  });

  it('weekly: the next matching weekday, never in the past', () => {
    // 2026-03-10 is a Tuesday
    expect(next({ frequency: 'weekly', dayOfWeek: 2, time: '09:00' }, '2026-03-10T08:00:00Z')).toBe('2026-03-10T09:00:00.000Z');
    // Same weekday, time already passed: next week (the old code returned today's past time)
    expect(next({ frequency: 'weekly', dayOfWeek: 2, time: '09:00' }, '2026-03-10T10:00:00Z')).toBe('2026-03-17T09:00:00.000Z');
    expect(next({ frequency: 'weekly', dayOfWeek: 1, time: '09:00' }, '2026-03-10T10:00:00Z')).toBe('2026-03-16T09:00:00.000Z');
    expect(next({ frequency: 'weekly', dayOfWeek: 0, time: '00:00' }, '2026-03-14T23:59:00Z')).toBe('2026-03-15T00:00:00.000Z');
  });

  it('monthly: clamps to the last day of short months instead of overflowing', () => {
    expect(next({ frequency: 'monthly', dayOfMonth: 31, time: '06:00' }, '2026-02-10T00:00:00Z')).toBe('2026-02-28T06:00:00.000Z');
    expect(next({ frequency: 'monthly', dayOfMonth: 31, time: '06:00' }, '2028-02-10T00:00:00Z')).toBe('2028-02-29T06:00:00.000Z');
    expect(next({ frequency: 'monthly', dayOfMonth: 31, time: '06:00' }, '2026-01-31T07:00:00Z')).toBe('2026-02-28T06:00:00.000Z');
    expect(next({ frequency: 'monthly', dayOfMonth: 30, time: '06:00' }, '2026-04-30T07:00:00Z')).toBe('2026-05-30T06:00:00.000Z');
    expect(next({ frequency: 'monthly', dayOfMonth: 1, time: '06:00' }, '2026-12-15T00:00:00Z')).toBe('2027-01-01T06:00:00.000Z');
    expect(next({ frequency: 'monthly', dayOfMonth: 15, time: '06:00' }, '2026-03-15T05:00:00Z')).toBe('2026-03-15T06:00:00.000Z');
  });

  it.each([
    [{ frequency: 'daily', time: '9:00' }],
    [{ frequency: 'daily', time: '24:00' }],
    [{ frequency: 'daily', time: 'noon' }],
    [{ frequency: 'weekly', time: '09:00' }],
    [{ frequency: 'weekly', dayOfWeek: 7, time: '09:00' }],
    [{ frequency: 'monthly', dayOfMonth: 0, time: '09:00' }],
    [{ frequency: 'monthly', dayOfMonth: 32, time: '09:00' }],
    [{ frequency: 'hourly', time: '09:00' }],
  ])('rejects invalid timing %j instead of producing NaN', (timing) => {
    expect(() => calculateNextRun(timing as any, new Date())).toThrow(BadRequestException);
  });
});
