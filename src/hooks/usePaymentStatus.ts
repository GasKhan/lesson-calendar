'use client';

import { useMemo } from 'react';
import { PaymentRecord, PaymentStatus, UUID } from '@/types/models';

export function usePaymentStatus(
  paymentRecords: PaymentRecord[],
  lessonId: UUID,
  month: string
) {
  return useMemo(() => {
    const records = paymentRecords.filter(
      (pr) => pr.lessonId === lessonId && pr.month === month
    );

    const getStatus = (participantId: UUID): PaymentStatus => {
      const record = records.find((r) => r.participantId === participantId);
      return record?.status ?? PaymentStatus.Unpaid;
    };

    return { getStatus };
  }, [paymentRecords, lessonId, month]);
}
