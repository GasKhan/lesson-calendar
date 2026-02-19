'use client';

import { LessonOccurrence } from '@/hooks/useLessonOccurrences';
import { formatTime } from '@/lib/time';
import { LessonType } from '@/types/models';

interface LessonBlockProps {
  occurrence: LessonOccurrence;
  startHour: number;
  onClick: () => void;
  onDragStart?: (occurrence: LessonOccurrence, event: React.PointerEvent) => void;
  isDragSource?: boolean;
}

export default function LessonBlock({ occurrence, startHour, onClick, onDragStart, isDragSource }: LessonBlockProps) {
  const { lesson, startTime, duration, isRescheduled } = occurrence;
  const startMinutes = startTime.hours * 60 + startTime.minutes;
  const offsetMinutes = startMinutes - startHour * 60;
  const top = (offsetMinutes / 60) * 60; // 60px per hour
  const height = Math.max((duration / 60) * 60, 20);

  const bgColor = lesson.color || '#3b82f6';
  const isFree = lesson.type === LessonType.Free;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || !onDragStart) return;
    onDragStart(occurrence, e);
  };

  return (
    <button
      onClick={onClick}
      onPointerDown={handlePointerDown}
      className="absolute left-1 right-1 rounded-md px-2 py-1 text-left overflow-hidden
        cursor-pointer transition-opacity hover:opacity-90 z-10 touch-none"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: bgColor + '22',
        borderLeft: `3px solid ${bgColor}`,
        opacity: isDragSource ? 0.3 : undefined,
      }}
      title={`${lesson.title} ${formatTime(startTime)}`}
    >
      <div className="text-xs font-medium truncate" style={{ color: bgColor }}>
        {lesson.title}
        {isRescheduled && ' (перенос)'}
      </div>
      {height > 30 && (
        <div className="text-[10px] text-text-secondary truncate">
          {formatTime(startTime)} · {duration} мин
          {isFree && ' · бесплатно'}
        </div>
      )}
    </button>
  );
}
