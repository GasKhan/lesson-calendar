'use client';

import { DragState } from '@/hooks/useDragLesson';
import { minutesToTime, formatTime } from '@/lib/time';

interface DragGhostProps {
  dragState: DragState;
  startHour: number;
}

const PX_PER_HOUR = 60;

export default function DragGhost({ dragState, startHour }: DragGhostProps) {
  const { occurrence, currentDayIndex, currentTimeMinutes, conflicts } = dragState;
  const { lesson, duration } = occurrence;

  const offsetMinutes = currentTimeMinutes - startHour * 60;
  const top = (offsetMinutes / 60) * PX_PER_HOUR;
  const height = Math.max((duration / 60) * PX_PER_HOUR, 20);
  const bgColor = lesson.color || '#3b82f6';
  const hasConflict = conflicts.length > 0;
  const newTime = minutesToTime(currentTimeMinutes);

  return (
    <div
      className="absolute left-1 right-1 rounded-md px-2 py-1 z-30 pointer-events-none transition-[top] duration-75"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: bgColor + '33',
        borderLeft: `3px solid ${bgColor}`,
        outline: hasConflict ? '2px solid #ef4444' : '2px solid #10b981',
        outlineOffset: '-1px',
        opacity: 0.85,
      }}
      data-ghost-day={currentDayIndex}
    >
      <div className="text-xs font-medium truncate" style={{ color: bgColor }}>
        {lesson.title}
      </div>
      {height > 30 && (
        <div className="text-[10px] text-text-secondary truncate">
          {formatTime(newTime)} · {duration} мин
        </div>
      )}
      {hasConflict && (
        <div className="text-[10px] text-red-500 font-medium truncate">
          Конфликт!
        </div>
      )}
    </div>
  );
}
