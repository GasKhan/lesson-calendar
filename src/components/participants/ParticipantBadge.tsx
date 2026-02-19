'use client';

import { Participant, PaymentRecord, PaymentStatus, UUID } from '@/types/models';

interface ParticipantBadgeProps {
  participant: Participant;
  lessonId: UUID;
  month: string;
  paymentRecords: PaymentRecord[];
  onTogglePayment: () => void;
}

export default function ParticipantBadge({
  participant,
  lessonId,
  month,
  paymentRecords,
  onTogglePayment,
}: ParticipantBadgeProps) {
  const record = paymentRecords.find(
    (pr) =>
      pr.participantId === participant.id &&
      pr.lessonId === lessonId &&
      pr.month === month
  );
  const isPaid = record?.status === PaymentStatus.Paid;

  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-bg-secondary">
      <span className="text-sm text-text-primary">{participant.name}</span>
      <button
        onClick={onTogglePayment}
        className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors
          ${isPaid
            ? 'bg-success/20 text-success'
            : 'bg-danger/20 text-danger'
          }`}
      >
        {isPaid ? 'Оплачено' : 'Не оплачено'}
      </button>
    </div>
  );
}
