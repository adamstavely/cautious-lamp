import { BadRequestException } from '@nestjs/common';

export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface ScheduleTiming {
  frequency: Frequency;
  /** 0 (Sunday) to 6, weekly only */
  dayOfWeek?: number;
  /** 1 to 31, monthly only; months without that day run on their last day */
  dayOfMonth?: number;
  /** HH:mm, 24-hour, UTC */
  time: string;
}

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Throws a 400 describing the first problem with a schedule's timing */
export function assertValidTiming(timing: ScheduleTiming): void {
  if (!['daily', 'weekly', 'monthly'].includes(timing.frequency)) throw new BadRequestException('frequency must be daily, weekly or monthly');
  if (typeof timing.time !== 'string' || !TIME.test(timing.time)) throw new BadRequestException('time must be HH:mm (24-hour, UTC)');
  if (timing.frequency === 'weekly' && !(Number.isInteger(timing.dayOfWeek) && timing.dayOfWeek! >= 0 && timing.dayOfWeek! <= 6)) {
    throw new BadRequestException('A weekly schedule needs dayOfWeek from 0 (Sunday) to 6');
  }
  if (timing.frequency === 'monthly' && !(Number.isInteger(timing.dayOfMonth) && timing.dayOfMonth! >= 1 && timing.dayOfMonth! <= 31)) {
    throw new BadRequestException('A monthly schedule needs dayOfMonth from 1 to 31');
  }
}

const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

/**
 * The first run strictly after `from`, in UTC. Monthly schedules on the 29th
 * to 31st run on the last day of shorter months (never spill into the next).
 */
export function calculateNextRun(timing: ScheduleTiming, from: Date = new Date()): Date {
  assertValidTiming(timing);
  const [hours, minutes] = timing.time.split(':').map(Number);
  const at = (year: number, month: number, day: number) => new Date(Date.UTC(year, month, day, hours, minutes, 0, 0));
  const y = from.getUTCFullYear();
  const m = from.getUTCMonth();
  const d = from.getUTCDate();

  if (timing.frequency === 'daily') {
    const today = at(y, m, d);
    return today > from ? today : at(y, m, d + 1);
  }
  if (timing.frequency === 'weekly') {
    const ahead = (timing.dayOfWeek! - from.getUTCDay() + 7) % 7;
    const candidate = at(y, m, d + ahead);
    return candidate > from ? candidate : at(y, m, d + ahead + 7);
  }
  const thisMonth = at(y, m, Math.min(timing.dayOfMonth!, daysInMonth(y, m)));
  if (thisMonth > from) return thisMonth;
  const nextYear = m === 11 ? y + 1 : y;
  const nextMonth = (m + 1) % 12;
  return at(nextYear, nextMonth, Math.min(timing.dayOfMonth!, daysInMonth(nextYear, nextMonth)));
}
