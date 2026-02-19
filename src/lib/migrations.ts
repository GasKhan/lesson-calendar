import { AppState } from '@/types/models';
import { STORAGE_VERSION } from '@/constants/defaults';

type Migration = (data: unknown) => unknown;

const migrations: Record<number, Migration> = {
  // Future migrations go here:
  // 2: (data) => { /* migrate from v1 to v2 */ return data; }
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
