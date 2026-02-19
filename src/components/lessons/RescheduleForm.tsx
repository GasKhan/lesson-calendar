'use client';

import { useState } from 'react';
import { Lesson, TimeOfDay } from '@/types/models';
import { useAppState, useAppDispatch } from '@/contexts/AppContext';
import { findDateConflicts } from '@/lib/conflicts';
import { parseDate } from '@/lib/dates';
import Button from '../ui/Button';
import Input from '../ui/Input';
import TimePicker from '../ui/TimePicker';

interface RescheduleFormProps {
  lesson: Lesson;
  originalDate: string;
  onClose: () => void;
}

export default function RescheduleForm({ lesson, originalDate, onClose }: RescheduleFormProps) {
  const dispatch = useAppDispatch();
  const { lessons, cancelledOccurrences, rescheduledOccurrences } = useAppState();

  const [newDate, setNewDate] = useState(originalDate);
  const [newStartTime, setNewStartTime] = useState<TimeOfDay>(lesson.startTime);
  const [newDuration, setNewDuration] = useState(lesson.duration);

  const targetDate = parseDate(newDate);
  const conflicts = findDateConflicts(
    lessons,
    cancelledOccurrences,
    rescheduledOccurrences,
    targetDate,
    newStartTime,
    newDuration,
    lesson.id,
    originalDate
  );
  const hasConflicts = conflicts.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasConflicts) return;

    dispatch({
      type: 'RESCHEDULE_OCCURRENCE',
      payload: {
        lessonId: lesson.id,
        originalDate,
        newDate,
        newStartTime,
        newDuration: newDuration !== lesson.duration ? newDuration : undefined,
      },
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-text-secondary">
        Перенос урока &laquo;{lesson.title}&raquo; с {originalDate}
      </p>

      <Input
        label="Новая дата"
        type="date"
        value={newDate}
        onChange={(e) => setNewDate(e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <TimePicker
          label="Новое время"
          value={newStartTime}
          onChange={setNewStartTime}
        />
        <Input
          label="Длительность (мин)"
          type="number"
          min={15}
          max={480}
          step={15}
          value={String(newDuration)}
          onChange={(e) => setNewDuration(Number(e.target.value))}
        />
      </div>

      {hasConflicts && (
        <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-sm text-danger">
          Конфликт:
          <ul className="mt-1 list-disc list-inside">
            {conflicts.map((c) => (
              <li key={c.lessonId}>{c.lessonTitle}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onClose}>
          Отмена
        </Button>
        <Button type="submit" disabled={hasConflicts}>
          Перенести
        </Button>
      </div>
    </form>
  );
}
