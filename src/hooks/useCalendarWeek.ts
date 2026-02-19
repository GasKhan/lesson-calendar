'use client';

import { useState, useMemo, useCallback } from 'react';
import { getWeekDates, addDays } from '@/lib/dates';

export function useCalendarWeek() {
  const [referenceDate, setReferenceDate] = useState(() => new Date());

  const weekDates = useMemo(() => getWeekDates(referenceDate), [referenceDate]);

  const goToPreviousWeek = useCallback(() => {
    setReferenceDate((d) => addDays(d, -7));
  }, []);

  const goToNextWeek = useCallback(() => {
    setReferenceDate((d) => addDays(d, 7));
  }, []);

  const goToToday = useCallback(() => {
    setReferenceDate(new Date());
  }, []);

  return {
    weekDates,
    referenceDate,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
  };
}
