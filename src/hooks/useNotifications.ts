'use client';

import { useEffect, useRef } from 'react';
import { AppState, TimeOfDay } from '@/types/models';
import { getDayOfWeek, formatDate } from '@/lib/dates';
import { timeToMinutes } from '@/lib/time';
import { showNotification, canNotify } from '@/lib/notifications';
import { NOTIFICATION_POLL_INTERVAL_MS } from '@/constants/defaults';

export function useNotifications(state: AppState) {
  const sentRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!state.settings.notificationsEnabled || !canNotify()) return;

    const check = () => {
      const now = new Date();
      const today = formatDate(now);
      const dow = getDayOfWeek(now);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const beforeMin = state.settings.notificationMinutesBefore;

      for (const lesson of state.lessons) {
        if (lesson.dayOfWeek !== dow) continue;

        // Skip if cancelled
        const isCancelled = state.cancelledOccurrences.some(
          (c) => c.lessonId === lesson.id && c.date === today
        );
        if (isCancelled) continue;

        // Check if rescheduled away
        const rescheduled = state.rescheduledOccurrences.find(
          (r) => r.lessonId === lesson.id && r.originalDate === today
        );
        if (rescheduled) continue;

        const lessonMinutes = timeToMinutes(lesson.startTime);
        const windowStart = lessonMinutes - beforeMin;

        if (currentMinutes >= windowStart && currentMinutes < lessonMinutes) {
          const key = `${lesson.id}-${today}`;
          if (!sentRef.current.has(key)) {
            sentRef.current.add(key);
            const mins = lessonMinutes - currentMinutes;
            showNotification(
              lesson.title,
              `Начало через ${mins} мин.`
            );
          }
        }
      }

      // Also check rescheduled lessons landing today
      for (const r of state.rescheduledOccurrences) {
        if (r.newDate !== today) continue;
        const lesson = state.lessons.find((l) => l.id === r.lessonId);
        if (!lesson) continue;

        const lessonMinutes = timeToMinutes(r.newStartTime);
        const windowStart = lessonMinutes - beforeMin;

        if (currentMinutes >= windowStart && currentMinutes < lessonMinutes) {
          const key = `reschedule-${r.id}-${today}`;
          if (!sentRef.current.has(key)) {
            sentRef.current.add(key);
            const mins = lessonMinutes - currentMinutes;
            showNotification(
              `${lesson.title} (перенос)`,
              `Начало через ${mins} мин.`
            );
          }
        }
      }
    };

    check();
    const interval = setInterval(check, NOTIFICATION_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [state]);
}
