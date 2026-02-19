'use client';

interface TimeGridProps {
  startHour: number;
  endHour: number;
}

export default function TimeGrid({ startHour, endHour }: TimeGridProps) {
  const hours = [];
  for (let h = startHour; h <= endHour; h++) {
    hours.push(h);
  }

  return (
    <div className="flex flex-col relative" style={{ width: '60px' }}>
      {hours.map((hour) => (
        <div
          key={hour}
          className="h-[60px] flex items-start justify-end pr-2 text-xs text-text-muted shrink-0"
        >
          <span className="-mt-2">{String(hour).padStart(2, '0')}:00</span>
        </div>
      ))}
    </div>
  );
}
