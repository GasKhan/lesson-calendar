import { TimeOfDay } from '@/types/models';

export function timeToMinutes(time: TimeOfDay): number {
  return time.hours * 60 + time.minutes;
}

export function minutesToTime(minutes: number): TimeOfDay {
  return {
    hours: Math.floor(minutes / 60),
    minutes: minutes % 60,
  };
}

export function formatTime(time: TimeOfDay): string {
  return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`;
}

export function parseTime(str: string): TimeOfDay {
  const [h, m] = str.split(':').map(Number);
  return { hours: h, minutes: m };
}

export function timeEndMinutes(start: TimeOfDay, durationMinutes: number): number {
  return timeToMinutes(start) + durationMinutes;
}

export function intervalsOverlap(
  s1: number,
  e1: number,
  s2: number,
  e2: number
): boolean {
  return s1 < e2 && s2 < e1;
}
