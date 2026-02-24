'use client';

import { useMemo } from 'react';
import {
  Lesson,
  CancelledOccurrence,
  RescheduledOccurrence,
  TimeOfDay,
} from '@/types/models';
import { formatDate, getDayOfWeek } from '@/lib/dates';

export interface LessonOccurrence {
  lesson: Lesson;
  date: string; // "YYYY-MM-DD"
  startTime: TimeOfDay;
  duration: number;
  scheduleSlotIndex: number; // which slot in lesson.schedule
  isRescheduled: boolean;
  originalDate?: string;
  isCancelled: boolean;
  isRescheduledAway: boolean;
  rescheduledToDate?: string;
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

      // Regular lessons on this day — check all schedule slots
      for (const lesson of lessons) {
        for (let si = 0; si < lesson.schedule.length; si++) {
          const slot = lesson.schedule[si];
          if (slot.dayOfWeek !== dow) continue;

          const isCancelled = cancelledOccurrences.some(
            (c) => c.lessonId === lesson.id && c.date === dateStr
          );

          const rescheduledAway = rescheduledOccurrences.find(
            (r) => r.lessonId === lesson.id && r.originalDate === dateStr
          );

          if (isCancelled) continue;

          if (rescheduledAway) {
            occurrences.push({
              lesson,
              date: dateStr,
              startTime: slot.startTime,
              duration: slot.duration,
              scheduleSlotIndex: si,
              isRescheduled: false,
              isCancelled: false,
              isRescheduledAway: true,
              rescheduledToDate: rescheduledAway.newDate,
            });
            continue;
          }

          occurrences.push({
            lesson,
            date: dateStr,
            startTime: slot.startTime,
            duration: slot.duration,
            scheduleSlotIndex: si,
            isRescheduled: false,
            isCancelled: false,
            isRescheduledAway: false,
          });
        }
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
          duration: r.newDuration ?? lesson.schedule[0]?.duration ?? 60,
          scheduleSlotIndex: 0,
          isRescheduled: true,
          originalDate: r.originalDate,
          isCancelled: false,
          isRescheduledAway: false,
        });
      }
    }

    return occurrences;
  }, [lessons, cancelledOccurrences, rescheduledOccurrences, weekDates]);
}
