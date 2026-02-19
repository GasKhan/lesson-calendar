'use client';

import { LessonOccurrence } from '@/hooks/useLessonOccurrences';
import { DragState } from '@/hooks/useDragLesson';
import LessonBlock from './LessonBlock';
import DragGhost from './DragGhost';
import { formatDate, isSameDay, DAY_NAMES } from '@/lib/dates';
import { DayOfWeek } from '@/types/models';

interface DayColumnProps {
  date: Date;
  dayIndex: DayOfWeek;
  occurrences: LessonOccurrence[];
  startHour: number;
  endHour: number;
  onLessonClick: (occurrence: LessonOccurrence) => void;
  onSlotClick: (dayOfWeek: DayOfWeek, hour: number) => void;
  onDragStart?: (occurrence: LessonOccurrence, event: React.PointerEvent) => void;
  dragState: DragState | null;
}

export default function DayColumn({
  date,
  dayIndex,
  occurrences,
  startHour,
  endHour,
  onLessonClick,
  onSlotClick,
  onDragStart,
  dragState,
}: DayColumnProps) {
  const isToday = isSameDay(date, new Date());
  const hours = [];
  for (let h = startHour; h <= endHour; h++) {
    hours.push(h);
  }

  const dateStr = formatDate(date);
  const dayOccurrences = occurrences.filter((o) => o.date === dateStr);

  const isDragOver = dragState !== null && dragState.currentDayIndex === dayIndex;

  return (
    <div className="flex-1 min-w-0" data-day-index={dayIndex}>
      {/* Day header */}
      <div
        className={`sticky top-0 z-10 text-center py-2 border-b border-border-light bg-bg-secondary
          ${isToday ? 'bg-accent-light' : ''}`}
      >
        <div className="text-xs text-text-muted">{DAY_NAMES[dayIndex]}</div>
        <div
          className={`text-sm font-medium ${
            isToday
              ? 'w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center mx-auto'
              : 'text-text-primary'
          }`}
        >
          {date.getDate()}
        </div>
      </div>

      {/* Time slots */}
      <div
        className={`relative border-r border-border-light ${isDragOver ? 'bg-accent/5' : ''}`}
        data-time-slots
      >
        {hours.map((hour) => (
          <div
            key={hour}
            className="h-[60px] border-b border-border-light hover:bg-bg-secondary/50 cursor-pointer shrink-0"
            onClick={() => onSlotClick(dayIndex, hour)}
          />
        ))}

        {/* Lesson blocks */}
        {dayOccurrences.map((occ, idx) => {
          const isDragSource =
            dragState !== null &&
            dragState.occurrence.lesson.id === occ.lesson.id &&
            dragState.occurrence.date === occ.date;

          return (
            <LessonBlock
              key={`${occ.lesson.id}-${occ.date}-${idx}`}
              occurrence={occ}
              startHour={startHour}
              onClick={() => onLessonClick(occ)}
              onDragStart={onDragStart}
              isDragSource={isDragSource}
            />
          );
        })}

        {/* Drag ghost in this column */}
        {dragState && dragState.currentDayIndex === dayIndex && (
          <DragGhost dragState={dragState} startHour={startHour} />
        )}
      </div>
    </div>
  );
}
