'use client';

import { useAppState, useAppDispatch } from '@/contexts/AppContext';
import { useCalendarWeek } from '@/hooks/useCalendarWeek';
import { useLessonOccurrences, LessonOccurrence } from '@/hooks/useLessonOccurrences';
import { useDragLesson } from '@/hooks/useDragLesson';
import { DayOfWeek } from '@/types/models';
import TimeGrid from './TimeGrid';
import DayColumn from './DayColumn';
import WeekNavigator from './WeekNavigator';
import CurrentTimeLine from './CurrentTimeLine';

interface WeeklyCalendarProps {
  onLessonClick: (occurrence: LessonOccurrence) => void;
  onSlotClick: (dayOfWeek: DayOfWeek, hour: number) => void;
}

export default function WeeklyCalendar({ onLessonClick, onSlotClick }: WeeklyCalendarProps) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { lessons, cancelledOccurrences, rescheduledOccurrences, settings } = state;
  const { weekDates, goToPreviousWeek, goToNextWeek, goToToday } = useCalendarWeek();
  const occurrences = useLessonOccurrences(
    lessons,
    cancelledOccurrences,
    rescheduledOccurrences,
    weekDates
  );

  const { calendarStartHour, calendarEndHour } = settings;

  const {
    dragState,
    isDragging,
    justDropped,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useDragLesson(state, dispatch, weekDates);

  const onDragStartWrapped = (occurrence: LessonOccurrence, event: React.PointerEvent) => {
    handleDragStart(occurrence, event, calendarStartHour);
  };

  const wrappedLessonClick = (occurrence: LessonOccurrence) => {
    if (justDropped.current) return;
    onLessonClick(occurrence);
  };

  return (
    <div className="flex flex-col h-full">
      <WeekNavigator
        weekDates={weekDates}
        onPrev={goToPreviousWeek}
        onNext={goToNextWeek}
        onToday={goToToday}
      />

      <div className="flex-1 overflow-auto">
        <div className="flex min-w-[700px]">
          <TimeGrid startHour={calendarStartHour} endHour={calendarEndHour} />

          <div
            className={`flex flex-1 relative ${isDragging ? 'select-none' : ''}`}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
          >
            {weekDates.map((date, i) => (
              <DayColumn
                key={i}
                date={date}
                dayIndex={i as DayOfWeek}
                occurrences={occurrences}
                startHour={calendarStartHour}
                endHour={calendarEndHour}
                onLessonClick={wrappedLessonClick}
                onSlotClick={onSlotClick}
                onDragStart={onDragStartWrapped}
                dragState={dragState}
              />
            ))}
            <CurrentTimeLine startHour={calendarStartHour} endHour={calendarEndHour} />
          </div>
        </div>
      </div>
    </div>
  );
}
