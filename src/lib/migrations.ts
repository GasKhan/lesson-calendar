import { AppState } from '@/types/models';
import { STORAGE_VERSION } from '@/constants/defaults';

type Migration = (data: unknown) => unknown;

const migrations: Record<number, Migration> = {
  2: (data: unknown) => {
    const state = data as Record<string, unknown>;
    const lessons = (state.lessons as Array<Record<string, unknown>>) ?? [];
    return {
      ...state,
      lessons: lessons.map((lesson) => {
        // Already migrated
        if (Array.isArray(lesson.schedule)) return lesson;
        const { dayOfWeek, startTime, duration, ...rest } = lesson;
        return {
          ...rest,
          schedule: [{ dayOfWeek, startTime, duration }],
        };
      }),
    };
  },
};

export function migrateState(data: unknown, fromVersion: number): AppState {
  let current = data;
  for (let v = fromVersion + 1; v <= STORAGE_VERSION; v++) {
    if (migrations[v]) {
      current = migrations[v](current);
    }
  }
  return current as AppState;
}
