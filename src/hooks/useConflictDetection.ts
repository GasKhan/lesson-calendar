'use client';

import { useMemo } from 'react';
import { ScheduleSlot } from '@/types/models';
import { useAppState } from '@/contexts/AppContext';
import { findRecurringConflicts, ConflictInfo } from '@/lib/conflicts';

export function useConflictDetection(
  schedule: ScheduleSlot[],
  excludeId?: string
): ConflictInfo[] {
  const { lessons } = useAppState();

  return useMemo(() => {
    const all: ConflictInfo[] = [];
    const seen = new Set<string>();
    for (const slot of schedule) {
      if (slot.duration <= 0) continue;
      const conflicts = findRecurringConflicts(
        lessons, slot.dayOfWeek, slot.startTime, slot.duration, excludeId
      );
      for (const c of conflicts) {
        if (!seen.has(c.lessonId)) {
          seen.add(c.lessonId);
          all.push(c);
        }
      }
    }
    return all;
  }, [lessons, schedule, excludeId]);
}
