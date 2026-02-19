'use client';

import { useState, useEffect } from 'react';
import { Lesson, DayOfWeek, LessonType, TimeOfDay } from '@/types/models';
import { useAppState, useAppDispatch } from '@/contexts/AppContext';
import { useConflictDetection } from '@/hooks/useConflictDetection';
import { DAY_NAMES_FULL } from '@/lib/dates';
import { LESSON_COLORS } from '@/constants/defaults';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import TimePicker from '../ui/TimePicker';

interface LessonFormProps {
  lesson?: Lesson;
  initialDayOfWeek?: DayOfWeek;
  initialHour?: number;
  onClose: () => void;
}

export default function LessonForm({ lesson, initialDayOfWeek, initialHour, onClose }: LessonFormProps) {
  const dispatch = useAppDispatch();
  const { participants } = useAppState();

  const [title, setTitle] = useState(lesson?.title ?? '');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(
    lesson?.dayOfWeek ?? initialDayOfWeek ?? DayOfWeek.Monday
  );
  const [startTime, setStartTime] = useState<TimeOfDay>(
    lesson?.startTime ?? { hours: initialHour ?? 9, minutes: 0 }
  );
  const [duration, setDuration] = useState(lesson?.duration ?? 60);
  const [type, setType] = useState<LessonType>(lesson?.type ?? LessonType.Paid);
  const [color, setColor] = useState(lesson?.color ?? LESSON_COLORS[0]);
  const [notes, setNotes] = useState(lesson?.notes ?? '');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    lesson?.participantIds ?? []
  );

  const conflicts = useConflictDetection(dayOfWeek, startTime, duration, lesson?.id);
  const hasConflicts = conflicts.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || hasConflicts) return;

    if (lesson) {
      dispatch({
        type: 'LESSON_UPDATE',
        payload: {
          id: lesson.id,
          title: title.trim(),
          dayOfWeek,
          startTime,
          duration,
          type,
          color,
          notes: notes.trim() || undefined,
          participantIds: selectedParticipants,
        },
      });
    } else {
      dispatch({
        type: 'LESSON_ADD',
        payload: {
          title: title.trim(),
          dayOfWeek,
          startTime,
          duration,
          type,
          color,
          notes: notes.trim() || undefined,
          participantIds: selectedParticipants,
        },
      });
    }
    onClose();
  };

  const toggleParticipant = (id: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Название урока"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Математика"
        required
      />

      <Select
        label="День недели"
        value={String(dayOfWeek)}
        onChange={(e) => setDayOfWeek(Number(e.target.value) as DayOfWeek)}
        options={DAY_NAMES_FULL.map((name, i) => ({ value: String(i), label: name }))}
      />

      <div className="grid grid-cols-2 gap-3">
        <TimePicker
          label="Начало"
          value={startTime}
          onChange={setStartTime}
        />
        <Input
          label="Длительность (мин)"
          type="number"
          min={15}
          max={480}
          step={15}
          value={String(duration)}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
      </div>

      <Select
        label="Тип"
        value={type}
        onChange={(e) => setType(e.target.value as LessonType)}
        options={[
          { value: LessonType.Paid, label: 'Платный' },
          { value: LessonType.Free, label: 'Бесплатный' },
        ]}
      />

      {/* Color picker */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text-secondary">Цвет</label>
        <div className="flex gap-2 flex-wrap">
          {LESSON_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                color === c ? 'border-text-primary scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Participants */}
      {participants.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-secondary">Участники</label>
          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
            {participants.map((p) => (
              <label key={p.id} className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedParticipants.includes(p.id)}
                  onChange={() => toggleParticipant(p.id)}
                  className="accent-accent"
                />
                {p.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <Input
        label="Заметки"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Дополнительная информация..."
      />

      {/* Conflict warning */}
      {hasConflicts && (
        <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-sm text-danger">
          Конфликт расписания:
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
        <Button type="submit" disabled={!title.trim() || hasConflicts}>
          {lesson ? 'Сохранить' : 'Добавить'}
        </Button>
      </div>
    </form>
  );
}
