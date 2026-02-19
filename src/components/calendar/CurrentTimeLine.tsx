'use client';

import { useEffect, useState } from 'react';

interface CurrentTimeLineProps {
  startHour: number;
  endHour: number;
}

export default function CurrentTimeLine({ startHour, endHour }: CurrentTimeLineProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startHour * 60;
  const endMinutes = endHour * 60;

  if (currentMinutes < startMinutes || currentMinutes > endMinutes) return null;

  const top = ((currentMinutes - startMinutes) / 60) * 60; // 60px per hour

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${top}px` }}
    >
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-danger -ml-1" />
        <div className="flex-1 h-[2px] bg-danger" />
      </div>
    </div>
  );
}
