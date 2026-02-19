export type UUID = string;

export enum DayOfWeek {
  Monday = 0,
  Tuesday = 1,
  Wednesday = 2,
  Thursday = 3,
  Friday = 4,
  Saturday = 5,
  Sunday = 6,
}

export interface TimeOfDay {
  hours: number;
  minutes: number;
}

export enum LessonType {
  Paid = 'paid',
  Free = 'free',
}

export enum PaymentStatus {
  Paid = 'paid',
  Unpaid = 'unpaid',
}

export interface Participant {
  id: UUID;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: UUID;
  participantId: UUID;
  lessonId: UUID;
  month: string; // "YYYY-MM"
  status: PaymentStatus;
  paidAt?: string;
}

export interface Lesson {
  id: UUID;
  title: string;
  dayOfWeek: DayOfWeek;
  startTime: TimeOfDay;
  duration: number; // minutes
  type: LessonType;
  participantIds: UUID[];
  color?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CancelledOccurrence {
  id: UUID;
  lessonId: UUID;
  date: string; // "YYYY-MM-DD"
  reason?: string;
  cancelledAt: string;
}

export interface RescheduledOccurrence {
  id: UUID;
  lessonId: UUID;
  originalDate: string; // "YYYY-MM-DD"
  newDate: string; // "YYYY-MM-DD"
  newStartTime: TimeOfDay;
  newDuration?: number;
  rescheduledAt: string;
}

export interface Settings {
  calendarStartHour: number;
  calendarEndHour: number;
  notificationsEnabled: boolean;
  notificationMinutesBefore: number;
  theme: 'dark' | 'light';
}

export interface AppState {
  lessons: Lesson[];
  participants: Participant[];
  paymentRecords: PaymentRecord[];
  cancelledOccurrences: CancelledOccurrence[];
  rescheduledOccurrences: RescheduledOccurrence[];
  settings: Settings;
}

export interface StorageEnvelope {
  version: number;
  timestamp: string;
  data: AppState;
  checksum: string;
}
