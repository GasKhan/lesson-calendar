'use client';

import Button from '../ui/Button';
import { formatDate } from '@/lib/dates';

interface WeekNavigatorProps {
  weekDates: Date[];
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function WeekNavigator({ weekDates, onPrev, onNext, onToday }: WeekNavigatorProps) {
  const start = weekDates[0];
  const end = weekDates[6];

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ];

  const label =
    start.getMonth() === end.getMonth()
      ? `${start.getDate()} – ${end.getDate()} ${monthNames[start.getMonth()]} ${start.getFullYear()}`
      : `${start.getDate()} ${monthNames[start.getMonth()]} – ${end.getDate()} ${monthNames[end.getMonth()]} ${end.getFullYear()}`;

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <Button variant="secondary" size="sm" onClick={onPrev}>
        &larr;
      </Button>
      <Button variant="ghost" size="sm" onClick={onToday}>
        Сегодня
      </Button>
      <Button variant="secondary" size="sm" onClick={onNext}>
        &rarr;
      </Button>
      <span className="text-sm font-medium text-text-primary ml-2">{label}</span>
    </div>
  );
}
