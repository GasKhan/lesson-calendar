import {
  Lesson,
  RescheduledOccurrence,
  CancelledOccurrence,
  DayOfWeek,
  TimeOfDay,
} from '@/types/models';
import { timeToMinutes, timeEndMinutes, intervalsOverlap } from './time';
import { getDayOfWeek, formatDate } from './dates';

export interface ConflictInfo {
  lessonId: string;
  lessonTitle: string;
}

/**
 * Check conflicts for a recurring lesson on a given day of week.
 * Excludes the lesson with `excludeId` (for editing).
 */
export function findRecurringConflicts(
  lessons: Lesson[],
  dayOfWeek: DayOfWeek,
  startTime: TimeOfDay,
  duration: number,
  excludeId?: string
): ConflictInfo[] {
  const s1 = timeToMinutes(startTime);
  const e1 = s1 + duration;

  return lessons
    .filter((l) => l.id !== excludeId && l.dayOfWeek === dayOfWeek)
    .filter((l) => {
      const s2 = timeToMinutes(l.startTime);
      const e2 = timeEndMinutes(l.startTime, l.duration);
      return intervalsOverlap(s1, e1, s2, e2);
    })
    .map((l) => ({ lessonId: l.id, lessonTitle: l.title }));
}

/**
 * Find conflicts for a rescheduled occurrence on a specific date.
 */
export function findDateConflicts(
  lessons: Lesson[],
  cancelledOccurrences: CancelledOccurrence[],
  rescheduledOccurrences: RescheduledOccurrence[],
  targetDate: Date,
  startTime: TimeOfDay,
  duration: number,
  excludeLessonId?: string,
  excludeOriginalDate?: string
): ConflictInfo[] {
  const dateStr = formatDate(targetDate);
  const targetDow = getDayOfWeek(targetDate);
  const s1 = timeToMinutes(startTime);
  const e1 = s1 + duration;
  const conflicts: ConflictInfo[] = [];

  // Check regular lessons on this day of week
  for (const lesson of lessons) {
    if (lesson.id === excludeLessonId) continue;
    if (lesson.dayOfWeek !== targetDow) continue;

    // Check if cancelled on this date
    const isCancelled = cancelledOccurrences.some(
      (c) => c.lessonId === lesson.id && c.date === dateStr
    );
    if (isCancelled) continue;

    // Check if rescheduled away from this date
    const rescheduledAway = rescheduledOccurrences.find(
      (r) => r.lessonId === lesson.id && r.originalDate === dateStr
    );
    if (rescheduledAway) continue;

    const s2 = timeToMinutes(lesson.startTime);
    const e2 = timeEndMinutes(lesson.startTime, lesson.duration);
    if (intervalsOverlap(s1, e1, s2, e2)) {
      conflicts.push({ lessonId: lesson.id, lessonTitle: lesson.title });
    }
  }

  // Check rescheduled lessons landing on this date
  for (const r of rescheduledOccurrences) {
    if (r.lessonId === excludeLessonId && r.originalDate === excludeOriginalDate) continue;
    if (r.newDate !== dateStr) continue;

    const lesson = lessons.find((l) => l.id === r.lessonId);
    if (!lesson) continue;

    const s2 = timeToMinutes(r.newStartTime);
    const e2 = s2 + (r.newDuration ?? lesson.duration);
    if (intervalsOverlap(s1, e1, s2, e2)) {
      conflicts.push({ lessonId: lesson.id, lessonTitle: `${lesson.title} (перенос)` });
    }
  }

  return conflicts;
}
