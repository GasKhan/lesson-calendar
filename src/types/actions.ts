import {
  AppState,
  CancelledOccurrence,
  DayOfWeek,
  Lesson,
  LessonType,
  Participant,
  PaymentStatus,
  RescheduledOccurrence,
  Settings,
  TimeOfDay,
  UUID,
} from './models';

export type AppAction =
  | { type: 'LESSON_ADD'; payload: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'LESSON_UPDATE'; payload: { id: UUID } & Partial<Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>> }
  | { type: 'LESSON_DELETE'; payload: { id: UUID } }
  | {
      type: 'CANCEL_OCCURRENCE';
      payload: { lessonId: UUID; date: string; reason?: string };
    }
  | {
      type: 'UNCANCEL_OCCURRENCE';
      payload: { lessonId: UUID; date: string };
    }
  | {
      type: 'RESCHEDULE_OCCURRENCE';
      payload: {
        lessonId: UUID;
        originalDate: string;
        newDate: string;
        newStartTime: TimeOfDay;
        newDuration?: number;
      };
    }
  | {
      type: 'UNRESCHEDULE_OCCURRENCE';
      payload: { lessonId: UUID; originalDate: string };
    }
  | { type: 'PARTICIPANT_ADD'; payload: Omit<Participant, 'id' | 'createdAt'> }
  | { type: 'PARTICIPANT_UPDATE'; payload: { id: UUID } & Partial<Omit<Participant, 'id' | 'createdAt'>> }
  | { type: 'PARTICIPANT_DELETE'; payload: { id: UUID } }
  | {
      type: 'PAYMENT_SET_STATUS';
      payload: {
        participantId: UUID;
        lessonId: UUID;
        month: string;
        status: PaymentStatus;
      };
    }
  | { type: 'SETTINGS_UPDATE'; payload: Partial<Settings> }
  | { type: 'STATE_HYDRATE'; payload: AppState }
  | { type: 'STATE_REPLACE'; payload: AppState };
