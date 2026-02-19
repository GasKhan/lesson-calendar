'use client';

import { useState } from 'react';
import { LessonOccurrence } from '@/hooks/useLessonOccurrences';
import { useAppState, useAppDispatch } from '@/contexts/AppContext';
import { LessonType, PaymentStatus } from '@/types/models';
import { formatTime } from '@/lib/time';
import { formatMonth } from '@/lib/dates';
import { DAY_NAMES_FULL } from '@/lib/dates';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import LessonForm from './LessonForm';
import RescheduleForm from './RescheduleForm';
import ParticipantBadge from '../participants/ParticipantBadge';

interface LessonModalProps {
  occurrence: LessonOccurrence | null;
  onClose: () => void;
}

type ModalView = 'view' | 'edit' | 'reschedule';

export default function LessonModal({ occurrence, onClose }: LessonModalProps) {
  const [view, setView] = useState<ModalView>('view');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const dispatch = useAppDispatch();
  const { participants, paymentRecords } = useAppState();

  if (!occurrence) return null;

  const { lesson, date, startTime, duration, isRescheduled } = occurrence;
  const endMinutes = startTime.hours * 60 + startTime.minutes + duration;
  const endTime = { hours: Math.floor(endMinutes / 60), minutes: endMinutes % 60 };

  const lessonParticipants = participants.filter((p) =>
    lesson.participantIds.includes(p.id)
  );
  const currentMonth = formatMonth(new Date(date));

  const handleDelete = () => {
    dispatch({ type: 'LESSON_DELETE', payload: { id: lesson.id } });
    onClose();
  };

  const handleCancel = () => {
    dispatch({
      type: 'CANCEL_OCCURRENCE',
      payload: { lessonId: lesson.id, date },
    });
    onClose();
  };

  const handleTogglePayment = (participantId: string) => {
    const current = paymentRecords.find(
      (pr) =>
        pr.participantId === participantId &&
        pr.lessonId === lesson.id &&
        pr.month === currentMonth
    );
    dispatch({
      type: 'PAYMENT_SET_STATUS',
      payload: {
        participantId,
        lessonId: lesson.id,
        month: currentMonth,
        status:
          current?.status === PaymentStatus.Paid
            ? PaymentStatus.Unpaid
            : PaymentStatus.Paid,
      },
    });
  };

  if (view === 'edit') {
    return (
      <Modal isOpen onClose={onClose} title="Редактировать урок">
        <LessonForm lesson={lesson} onClose={() => { setView('view'); }} />
      </Modal>
    );
  }

  if (view === 'reschedule') {
    return (
      <Modal isOpen onClose={onClose} title="Перенести урок">
        <RescheduleForm lesson={lesson} originalDate={date} onClose={() => { setView('view'); }} />
      </Modal>
    );
  }

  return (
    <>
      <Modal isOpen onClose={onClose} title={lesson.title}>
        <div className="flex flex-col gap-4">
          {/* Info */}
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">День:</span>
              <span className="text-text-primary">{DAY_NAMES_FULL[lesson.dayOfWeek]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Дата:</span>
              <span className="text-text-primary">{date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Время:</span>
              <span className="text-text-primary">
                {formatTime(startTime)} – {formatTime(endTime)} ({duration} мин)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Тип:</span>
              <span className="text-text-primary">
                {lesson.type === LessonType.Paid ? 'Платный' : 'Бесплатный'}
              </span>
            </div>
            {isRescheduled && (
              <div className="text-xs text-warning">Этот урок перенесён</div>
            )}
            {lesson.notes && (
              <div className="mt-1 p-2 bg-bg-secondary rounded text-text-secondary">
                {lesson.notes}
              </div>
            )}
          </div>

          {/* Participants with payment */}
          {lessonParticipants.length > 0 && lesson.type === LessonType.Paid && (
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-2">
                Участники ({currentMonth})
              </h3>
              <div className="flex flex-col gap-1">
                {lessonParticipants.map((p) => (
                  <ParticipantBadge
                    key={p.id}
                    participant={p}
                    lessonId={lesson.id}
                    month={currentMonth}
                    paymentRecords={paymentRecords}
                    onTogglePayment={() => handleTogglePayment(p.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {lessonParticipants.length > 0 && lesson.type === LessonType.Free && (
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-2">Участники</h3>
              <div className="flex flex-wrap gap-1">
                {lessonParticipants.map((p) => (
                  <span key={p.id} className="px-2 py-1 bg-bg-tertiary rounded text-xs text-text-primary">
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border-light">
            <Button size="sm" variant="secondary" onClick={() => setView('edit')}>
              Редактировать
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setView('reschedule')}>
              Перенести
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowCancelConfirm(true)}>
              Отменить занятие
            </Button>
            <Button size="sm" variant="danger" onClick={() => setShowDeleteConfirm(true)}>
              Удалить урок
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Удалить урок?"
        message={`Урок «${lesson.title}» будет удалён навсегда вместе со всеми записями об оплате, отменах и переносах.`}
        confirmLabel="Удалить"
      />

      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancel}
        title="Отменить занятие?"
        message={`Занятие «${lesson.title}» на ${date} будет отменено. Другие занятия этого урока не будут затронуты.`}
        confirmLabel="Отменить занятие"
        variant="primary"
      />
    </>
  );
}
