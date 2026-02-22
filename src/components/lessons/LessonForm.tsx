'use client';

import { useState } from 'react';
import { Lesson, DayOfWeek, LessonType, TimeOfDay, ScheduleSlot } from '@/types/models';
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

function createSlot(dayOfWeek?: DayOfWeek, hour?: number): ScheduleSlot {
  return {
    dayOfWeek: dayOfWeek ?? DayOfWeek.Monday,
    startTime: { hours: hour ?? 9, minutes: 0 },
    duration: 60,
  };
}

export default function LessonForm({ lesson, initialDayOfWeek, initialHour, onClose }: LessonFormProps) {
  const dispatch = useAppDispatch();
  const { participants } = useAppState();

  const [title, setTitle] = useState(lesson?.title ?? '');
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(
    lesson?.schedule ?? [createSlot(initialDayOfWeek, initialHour)]
  );
  const [type, setType] = useState<LessonType>(lesson?.type ?? LessonType.Paid);
  const [color, setColor] = useState(lesson?.color ?? LESSON_COLORS[0]);
  const [notes, setNotes] = useState(lesson?.notes ?? '');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    lesson?.participantIds ?? []
  );

  const conflicts = useConflictDetection(schedule, lesson?.id);
  const hasConflicts = conflicts.length > 0;

  const updateSlot = (index: number, updates: Partial<ScheduleSlot>) => {
    setSchedule((prev) => prev.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  };

  const addSlot = () => {
    setSchedule((prev) => [...prev, createSlot()]);
  };

  const removeSlot = (index: number) => {
    if (schedule.length <= 1) return;
    setSchedule((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || hasConflicts || schedule.length === 0) return;

    if (lesson) {
      dispatch({
        type: 'LESSON_UPDATE',
        payload: {
          id: lesson.id,
          title: title.trim(),
          schedule,
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
          schedule,
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

      {/* Schedule slots */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-text-secondary">Расписание</label>
        {schedule.map((slot, i) => (
          <div key={i} className="flex flex-col gap-2 p-3 rounded-lg bg-bg-secondary border border-border-light">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted font-medium">Слот {i + 1}</span>
              {schedule.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSlot(i)}
                  className="text-xs text-danger hover:text-danger/80"
                >
                  Удалить
                </button>
              )}
            </div>
            <Select
              label="День недели"
              value={String(slot.dayOfWeek)}
              onChange={(e) => updateSlot(i, { dayOfWeek: Number(e.target.value) as DayOfWeek })}
              options={DAY_NAMES_FULL.map((name, idx) => ({ value: String(idx), label: name }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <TimePicker
                label="Начало"
                value={slot.startTime}
                onChange={(startTime) => updateSlot(i, { startTime })}
              />
              <Input
                label="Длительность (мин)"
                type="number"
                min={15}
                max={480}
                step={15}
                value={String(slot.duration)}
                onChange={(e) => updateSlot(i, { duration: Number(e.target.value) })}
              />
            </div>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={addSlot}>
          + Добавить день
        </Button>
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
