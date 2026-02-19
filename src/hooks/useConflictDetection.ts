'use client';

import { useMemo } from 'react';
import { DayOfWeek, TimeOfDay } from '@/types/models';
import { useAppState } from '@/contexts/AppContext';
import { findRecurringConflicts, ConflictInfo } from '@/lib/conflicts';

export function useConflictDetection(
  dayOfWeek: DayOfWeek | null,
  startTime: TimeOfDay | null,
  duration: number,
  excludeId?: string
): ConflictInfo[] {
  const { lessons } = useAppState();

  return useMemo(() => {
    if (dayOfWeek === null || startTime === null || duration <= 0) return [];
    return findRecurringConflicts(lessons, dayOfWeek, startTime, duration, excludeId);
  }, [lessons, dayOfWeek, startTime, duration, excludeId]);
}
