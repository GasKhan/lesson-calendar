'use client';

import { useState } from 'react';
import { useAppState, useAppDispatch } from '@/contexts/AppContext';
import { Participant, Lesson, PaymentStatus, LessonType } from '@/types/models';
import { formatTime } from '@/lib/time';
import { formatMonth, DAY_NAMES } from '@/lib/dates';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

function getRelevantMonths(currentDate: Date, range: number = 3): string[] {
  const months: string[] = [];
  for (let i = -range; i <= range; i++) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    months.push(formatMonth(d));
  }
  return months;
}

const MONTH_LABELS: Record<string, string> = {
  '01': 'Янв', '02': 'Фев', '03': 'Мар', '04': 'Апр',
  '05': 'Май', '06': 'Июн', '07': 'Июл', '08': 'Авг',
  '09': 'Сен', '10': 'Окт', '11': 'Ноя', '12': 'Дек',
};

function formatMonthLabel(month: string): string {
  const [year, m] = month.split('-');
  return `${MONTH_LABELS[m] ?? m} ${year}`;
}

export default function AdminPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { participants, lessons, paymentRecords } = state;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Participant | null>(null);

  const months = getRelevantMonths(new Date());
  const selected = participants.find((p) => p.id === selectedId) ?? null;

  const participantLessons = (participantId: string): Lesson[] =>
    lessons.filter((l) => l.participantIds.includes(participantId));

  const getPaymentStatus = (participantId: string, lessonId: string, month: string): PaymentStatus => {
    const record = paymentRecords.find(
      (pr) => pr.participantId === participantId && pr.lessonId === lessonId && pr.month === month,
    );
    return record?.status ?? PaymentStatus.Unpaid;
  };

  const togglePayment = (participantId: string, lessonId: string, month: string) => {
    const current = getPaymentStatus(participantId, lessonId, month);
    dispatch({
      type: 'PAYMENT_SET_STATUS',
      payload: {
        participantId,
        lessonId,
        month,
        status: current === PaymentStatus.Paid ? PaymentStatus.Unpaid : PaymentStatus.Paid,
      },
    });
  };

  const startEditing = (p: Participant) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditEmail(p.email ?? '');
    setEditPhone(p.phone ?? '');
  };

  const saveEditing = () => {
    if (!editingId || !editName.trim()) return;
    dispatch({
      type: 'PARTICIPANT_UPDATE',
      payload: {
        id: editingId,
        name: editName.trim(),
        email: editEmail.trim() || undefined,
        phone: editPhone.trim() || undefined,
      },
    });
    setEditingId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleDelete = (p: Participant) => {
    dispatch({ type: 'PARTICIPANT_DELETE', payload: { id: p.id } });
    setDeleteTarget(null);
    if (selectedId === p.id) setSelectedId(null);
  };

  return (
    <div className="flex flex-col h-screen bg-bg-primary">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border-light bg-bg-secondary shrink-0">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-sm text-accent hover:underline"
          >
            &larr; Календарь
          </a>
          <h1 className="text-xl font-bold text-text-primary">Ученики</h1>
        </div>
        <span className="text-sm text-text-muted">{participants.length} уч.</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: participant list */}
        <aside className="w-72 border-r border-border-light bg-bg-secondary overflow-y-auto shrink-0">
          {participants.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">Нет учеников</p>
          ) : (
            participants.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`w-full text-left px-4 py-3 border-b border-border-light transition-colors
                  hover:bg-bg-tertiary
                  ${selectedId === p.id ? 'bg-accent/10 border-l-2 border-l-accent' : ''}`}
              >
                <div className="text-sm font-medium text-text-primary truncate">{p.name}</div>
                <div className="text-xs text-text-muted">
                  {participantLessons(p.id).length} ур.
                  {p.email && ` · ${p.email}`}
                </div>
              </button>
            ))
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-text-muted text-sm">
              Выберите ученика из списка
            </div>
          ) : (
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
              {/* Participant info */}
              <section className="bg-bg-secondary rounded-xl p-5">
                {editingId === selected.id ? (
                  <div className="flex flex-col gap-3">
                    <Input
                      label="Имя"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                    <Input
                      label="Телефон"
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                    />
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" onClick={saveEditing} disabled={!editName.trim()}>
                        Сохранить
                      </Button>
                      <Button size="sm" variant="secondary" onClick={cancelEditing}>
                        Отмена
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-text-primary">{selected.name}</h2>
                      {selected.email && (
                        <div className="text-sm text-text-muted mt-1">{selected.email}</div>
                      )}
                      {selected.phone && (
                        <div className="text-sm text-text-muted">{selected.phone}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => startEditing(selected)}>
                        Редактировать
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteTarget(selected)}>
                        Удалить
                      </Button>
                    </div>
                  </div>
                )}
              </section>

              {/* Lessons */}
              <section>
                <h3 className="text-sm font-medium text-text-secondary mb-3">
                  Уроки ({participantLessons(selected.id).length})
                </h3>
                {participantLessons(selected.id).length === 0 ? (
                  <p className="text-sm text-text-muted bg-bg-secondary rounded-lg p-4">
                    Ученик не записан ни на один урок
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {participantLessons(selected.id).map((lesson) => (
                      <div
                        key={lesson.id}
                        className="bg-bg-secondary rounded-lg p-4 border-l-3"
                        style={{ borderLeftColor: lesson.color || '#3b82f6' }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-text-primary text-sm">{lesson.title}</div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            lesson.type === LessonType.Paid
                              ? 'bg-accent/15 text-accent'
                              : 'bg-success/15 text-success'
                          }`}>
                            {lesson.type === LessonType.Paid ? 'Платный' : 'Бесплатный'}
                          </span>
                        </div>
                        <div className="text-xs text-text-muted">
                          {lesson.schedule.map((slot, i) => (
                            <span key={i}>
                              {i > 0 && ', '}
                              {DAY_NAMES[slot.dayOfWeek]} {formatTime(slot.startTime)} ({slot.duration} мин)
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Payments table */}
              {participantLessons(selected.id).filter((l) => l.type === LessonType.Paid).length > 0 && (
                <section>
                  <h3 className="text-sm font-medium text-text-secondary mb-3">Оплаты</h3>
                  <div className="overflow-x-auto rounded-lg border border-border-light">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-bg-secondary">
                          <th className="text-left px-3 py-2 text-text-muted font-medium border-b border-border-light">
                            Урок
                          </th>
                          {months.map((m) => (
                            <th
                              key={m}
                              className="text-center px-2 py-2 text-text-muted font-medium border-b border-border-light whitespace-nowrap"
                            >
                              {formatMonthLabel(m)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {participantLessons(selected.id)
                          .filter((l) => l.type === LessonType.Paid)
                          .map((lesson) => (
                            <tr key={lesson.id} className="border-b border-border-light last:border-b-0">
                              <td className="px-3 py-2 text-text-primary font-medium">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: lesson.color || '#3b82f6' }}
                                  />
                                  {lesson.title}
                                </div>
                              </td>
                              {months.map((month) => {
                                const status = getPaymentStatus(selected.id, lesson.id, month);
                                const isPaid = status === PaymentStatus.Paid;
                                return (
                                  <td key={month} className="text-center px-2 py-2">
                                    <button
                                      onClick={() => togglePayment(selected.id, lesson.id, month)}
                                      className={`inline-block w-7 h-7 rounded-md text-xs font-medium transition-colors
                                        ${isPaid
                                          ? 'bg-success/20 text-success hover:bg-success/30'
                                          : 'bg-bg-tertiary text-text-muted hover:bg-danger/20 hover:text-danger'
                                        }`}
                                      title={isPaid ? 'Оплачено — нажмите, чтобы отменить' : 'Не оплачено — нажмите, чтобы отметить'}
                                    >
                                      {isPaid ? '\u2713' : '\u2013'}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Удалить ученика?"
        message={`Ученик «${deleteTarget?.name}» будет удалён из всех уроков. Все записи об оплатах будут потеряны.`}
        confirmLabel="Удалить"
      />
    </div>
  );
}
