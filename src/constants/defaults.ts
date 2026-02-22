import { AppState, Settings } from '@/types/models';

export const DEFAULT_SETTINGS: Settings = {
  calendarStartHour: 8,
  calendarEndHour: 22,
  notificationsEnabled: false,
  notificationMinutesBefore: 15,
  theme: 'light',
};

export const INITIAL_STATE: AppState = {
  lessons: [],
  participants: [],
  paymentRecords: [],
  cancelledOccurrences: [],
  rescheduledOccurrences: [],
  settings: DEFAULT_SETTINGS,
};

export const STORAGE_KEY = 'lesson-calendar-data';
export const STORAGE_BACKUP_KEY = 'lesson-calendar-data_backup';
export const STORAGE_VERSION = 2;

export const LESSON_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export const AUTOSAVE_DEBOUNCE_MS = 300;
export const NOTIFICATION_POLL_INTERVAL_MS = 30000;
