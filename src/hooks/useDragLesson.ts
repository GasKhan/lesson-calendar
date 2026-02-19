'use client';

import { useCallback, useRef, useState, Dispatch } from 'react';
import { LessonOccurrence } from './useLessonOccurrences';
import { AppState, TimeOfDay } from '@/types/models';
import { AppAction } from '@/types/actions';
import { ConflictInfo, findDateConflicts } from '@/lib/conflicts';
import { minutesToTime, formatTime } from '@/lib/time';
import { formatDate, parseDate } from '@/lib/dates';

export interface DragState {
  occurrence: LessonOccurrence;
  currentDayIndex: number;
  currentTimeMinutes: number;
  conflicts: ConflictInfo[];
}

const DRAG_THRESHOLD = 5;
const SNAP_MINUTES = 15;
const PX_PER_HOUR = 60;

function snapToGrid(minutes: number): number {
  return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
}

export function useDragLesson(
  state: AppState,
  dispatch: Dispatch<AppAction>,
  weekDates: Date[],
) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const justDroppedRef = useRef(false);

  // Internal refs to track drag mechanics (not triggering re-renders)
  const dragRef = useRef<{
    occurrence: LessonOccurrence;
    startMouseX: number;
    startMouseY: number;
    thresholdPassed: boolean;
    startDayIndex: number;
    startTimeMinutes: number;
    startHour: number;
  } | null>(null);

  const handleDragStart = useCallback(
    (occurrence: LessonOccurrence, event: React.PointerEvent, startHour: number) => {
      // Only left mouse button
      if (event.button !== 0) return;

      const dayIndex = weekDates.findIndex(
        (d) => formatDate(d) === occurrence.date,
      );
      if (dayIndex === -1) return;

      const startTimeMinutes =
        occurrence.startTime.hours * 60 + occurrence.startTime.minutes;

      dragRef.current = {
        occurrence,
        startMouseX: event.clientX,
        startMouseY: event.clientY,
        thresholdPassed: false,
        startDayIndex: dayIndex,
        startTimeMinutes,
        startHour,
      };
    },
    [weekDates],
  );

  const computeDayAndTime = useCallback(
    (clientX: number, clientY: number, startHour: number): { dayIndex: number; timeMinutes: number } | null => {
      const elements = document.elementsFromPoint(clientX, clientY);
      let dayIndex = -1;

      for (const el of elements) {
        const attr = (el as HTMLElement).getAttribute?.('data-day-index');
        if (attr !== null && attr !== undefined) {
          dayIndex = parseInt(attr, 10);
          break;
        }
      }

      if (dayIndex === -1) return null;

      // Find the column element to compute Y offset
      const columnEl = document.querySelector(`[data-day-index="${dayIndex}"] [data-time-slots]`);
      if (!columnEl) return null;

      const rect = columnEl.getBoundingClientRect();
      const offsetY = clientY - rect.top;
      const rawMinutes = startHour * 60 + (offsetY / PX_PER_HOUR) * 60;
      const timeMinutes = snapToGrid(rawMinutes);

      return { dayIndex, timeMinutes };
    },
    [],
  );

  const handleDragMove = useCallback(
    (event: React.PointerEvent) => {
      const ref = dragRef.current;
      if (!ref) return;

      if (!ref.thresholdPassed) {
        const dx = event.clientX - ref.startMouseX;
        const dy = event.clientY - ref.startMouseY;
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) {
          return;
        }
        ref.thresholdPassed = true;
      }

      const result = computeDayAndTime(event.clientX, event.clientY, ref.startHour);
      if (!result) return;

      const { dayIndex, timeMinutes } = result;

      // Clamp time to valid range
      const clampedMinutes = Math.max(0, Math.min(timeMinutes, 23 * 60 + 45));

      const targetDate = weekDates[dayIndex];
      if (!targetDate) return;

      const newStartTime = minutesToTime(clampedMinutes);

      // Determine originalDate for exclusion in conflict check
      const occ = ref.occurrence;
      const originalDate = occ.isRescheduled ? occ.originalDate! : occ.date;

      const conflicts = findDateConflicts(
        state.lessons,
        state.cancelledOccurrences,
        state.rescheduledOccurrences,
        targetDate,
        newStartTime,
        occ.duration,
        occ.lesson.id,
        originalDate,
      );

      setDragState({
        occurrence: ref.occurrence,
        currentDayIndex: dayIndex,
        currentTimeMinutes: clampedMinutes,
        conflicts,
      });
    },
    [weekDates, state, computeDayAndTime],
  );

  const handleDragEnd = useCallback(() => {
    const ref = dragRef.current;
    const currentDrag = dragState;
    dragRef.current = null;

    if (!ref || !ref.thresholdPassed || !currentDrag) {
      setDragState(null);
      return;
    }

    // Check if position actually changed
    const positionChanged =
      currentDrag.currentDayIndex !== ref.startDayIndex ||
      currentDrag.currentTimeMinutes !== ref.startTimeMinutes;

    if (!positionChanged || currentDrag.conflicts.length > 0) {
      setDragState(null);
      return;
    }

    const occ = ref.occurrence;
    const originalDate = occ.isRescheduled ? occ.originalDate! : occ.date;
    const newDate = formatDate(weekDates[currentDrag.currentDayIndex]);
    const newStartTime = minutesToTime(currentDrag.currentTimeMinutes);

    // If already rescheduled, unreschedule first
    if (occ.isRescheduled) {
      dispatch({
        type: 'UNRESCHEDULE_OCCURRENCE',
        payload: {
          lessonId: occ.lesson.id,
          originalDate,
        },
      });
    }

    // Check if moving back to original recurring slot
    const recurringDate = occ.isRescheduled ? occ.originalDate! : occ.date;
    const recurringTime = occ.lesson.startTime;
    const isBackToOriginal =
      newDate === recurringDate &&
      newStartTime.hours === recurringTime.hours &&
      newStartTime.minutes === recurringTime.minutes;

    if (!isBackToOriginal) {
      dispatch({
        type: 'RESCHEDULE_OCCURRENCE',
        payload: {
          lessonId: occ.lesson.id,
          originalDate,
          newDate,
          newStartTime,
          newDuration: occ.duration !== occ.lesson.duration ? occ.duration : undefined,
        },
      });
    }

    setDragState(null);

    // Suppress click event after drop
    justDroppedRef.current = true;
    requestAnimationFrame(() => {
      justDroppedRef.current = false;
    });
  }, [dragState, weekDates, dispatch]);

  const isDragging = dragState !== null;
  const justDropped = justDroppedRef;

  return {
    dragState,
    isDragging,
    justDropped,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
}
