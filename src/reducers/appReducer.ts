import { AppState, PaymentStatus } from '@/types/models';
import { AppAction } from '@/types/actions';
import { generateUUID } from '@/lib/uuid';

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LESSON_ADD': {
      const now = new Date().toISOString();
      const lesson = {
        ...action.payload,
        id: generateUUID(),
        createdAt: now,
        updatedAt: now,
      };
      return { ...state, lessons: [...state.lessons, lesson] };
    }

    case 'LESSON_UPDATE': {
      const { id, ...updates } = action.payload;
      return {
        ...state,
        lessons: state.lessons.map((l) =>
          l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
        ),
      };
    }

    case 'LESSON_DELETE': {
      const { id } = action.payload;
      return {
        ...state,
        lessons: state.lessons.filter((l) => l.id !== id),
        cancelledOccurrences: state.cancelledOccurrences.filter((c) => c.lessonId !== id),
        rescheduledOccurrences: state.rescheduledOccurrences.filter((r) => r.lessonId !== id),
        paymentRecords: state.paymentRecords.filter((p) => p.lessonId !== id),
      };
    }

    case 'CANCEL_OCCURRENCE': {
      const occurrence = {
        id: generateUUID(),
        lessonId: action.payload.lessonId,
        date: action.payload.date,
        reason: action.payload.reason,
        cancelledAt: new Date().toISOString(),
      };
      return {
        ...state,
        cancelledOccurrences: [...state.cancelledOccurrences, occurrence],
      };
    }

    case 'UNCANCEL_OCCURRENCE': {
      return {
        ...state,
        cancelledOccurrences: state.cancelledOccurrences.filter(
          (c) => !(c.lessonId === action.payload.lessonId && c.date === action.payload.date)
        ),
      };
    }

    case 'RESCHEDULE_OCCURRENCE': {
      const rescheduled = {
        id: generateUUID(),
        lessonId: action.payload.lessonId,
        originalDate: action.payload.originalDate,
        newDate: action.payload.newDate,
        newStartTime: action.payload.newStartTime,
        newDuration: action.payload.newDuration,
        rescheduledAt: new Date().toISOString(),
      };
      return {
        ...state,
        rescheduledOccurrences: [...state.rescheduledOccurrences, rescheduled],
      };
    }

    case 'UNRESCHEDULE_OCCURRENCE': {
      return {
        ...state,
        rescheduledOccurrences: state.rescheduledOccurrences.filter(
          (r) =>
            !(r.lessonId === action.payload.lessonId && r.originalDate === action.payload.originalDate)
        ),
      };
    }

    case 'PARTICIPANT_ADD': {
      const participant = {
        ...action.payload,
        id: generateUUID(),
        createdAt: new Date().toISOString(),
      };
      return { ...state, participants: [...state.participants, participant] };
    }

    case 'PARTICIPANT_UPDATE': {
      const { id, ...updates } = action.payload;
      return {
        ...state,
        participants: state.participants.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      };
    }

    case 'PARTICIPANT_DELETE': {
      const { id } = action.payload;
      return {
        ...state,
        participants: state.participants.filter((p) => p.id !== id),
        lessons: state.lessons.map((l) => ({
          ...l,
          participantIds: l.participantIds.filter((pid) => pid !== id),
        })),
        paymentRecords: state.paymentRecords.filter((pr) => pr.participantId !== id),
      };
    }

    case 'PAYMENT_SET_STATUS': {
      const { participantId, lessonId, month, status } = action.payload;
      const existing = state.paymentRecords.find(
        (pr) => pr.participantId === participantId && pr.lessonId === lessonId && pr.month === month
      );
      if (existing) {
        return {
          ...state,
          paymentRecords: state.paymentRecords.map((pr) =>
            pr.id === existing.id
              ? {
                  ...pr,
                  status,
                  paidAt: status === PaymentStatus.Paid ? new Date().toISOString() : undefined,
                }
              : pr
          ),
        };
      }
      const record = {
        id: generateUUID(),
        participantId,
        lessonId,
        month,
        status,
        paidAt: status === PaymentStatus.Paid ? new Date().toISOString() : undefined,
      };
      return { ...state, paymentRecords: [...state.paymentRecords, record] };
    }

    case 'SETTINGS_UPDATE': {
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    }

    case 'STATE_HYDRATE':
    case 'STATE_REPLACE': {
      return action.payload;
    }

    default:
      return state;
  }
}
