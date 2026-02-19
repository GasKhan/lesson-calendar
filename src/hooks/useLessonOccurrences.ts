'use client';

import { useMemo } from 'react';
import {
  Lesson,
  CancelledOccurrence,
  RescheduledOccurrence,
  TimeOfDay,
  DayOfWeek,
} from '@/types/models';
import { formatDate, getDayOfWeek } from '@/lib/dates';

export interface LessonOccurrence {
  lesson: Lesson;
  date: string; // "YYYY-MM-DD"
  startTime: TimeOfDay;
  duration: number;
  isRescheduled: boolean;
  originalDate?: string;
  isCancelled: boolean;
}

export function useLessonOccurrences(
  lessons: Lesson[],
  cancelledOccurrences: CancelledOccurrence[],
  rescheduledOccurrences: RescheduledOccurrence[],
  weekDates: Date[]
): LessonOccurrence[] {
  return useMemo(() => {
    const occurrences: LessonOccurrence[] = [];

    for (const date of weekDates) {
      const dateStr = formatDate(date);
      const dow = getDayOfWeek(date);

      // Regular lessons on this day
      for (const lesson of lessons) {
        if (lesson.dayOfWeek !== dow) continue;

        const isCancelled = cancelledOccurrences.some(
          (c) => c.lessonId === lesson.id && c.date === dateStr
        );

        const rescheduledAway = rescheduledOccurrences.find(
          (r) => r.lessonId === lesson.id && r.originalDate === dateStr
        );

        if (rescheduledAway) continue; // moved to another date
        if (isCancelled) continue; // cancelled

        occurrences.push({
          lesson,
          date: dateStr,
          startTime: lesson.startTime,
          duration: lesson.duration,
          isRescheduled: false,
          isCancelled: false,
        });
      }

      // Rescheduled lessons landing on this date
      for (const r of rescheduledOccurrences) {
        if (r.newDate !== dateStr) continue;
        const lesson = lessons.find((l) => l.id === r.lessonId);
        if (!lesson) continue;

        occurrences.push({
          lesson,
          date: dateStr,
          startTime: r.newStartTime,
          duration: r.newDuration ?? lesson.duration,
          isRescheduled: true,
          originalDate: r.originalDate,
          isCancelled: false,
        });
      }
    }

    return occurrences;
  }, [lessons, cancelledOccurrences, rescheduledOccurrences, weekDates]);
}
