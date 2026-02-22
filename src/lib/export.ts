import { AppState, StorageEnvelope } from '@/types/models';
import { STORAGE_VERSION } from '@/constants/defaults';
import { djb2Hash } from './checksum';
import { migrateState } from './migrations';

export function exportData(state: AppState): string {
  const envelope: StorageEnvelope = {
    version: STORAGE_VERSION,
    timestamp: new Date().toISOString(),
    data: state,
    checksum: djb2Hash(JSON.stringify(state)),
  };
  return JSON.stringify(envelope, null, 2);
}

export function importData(json: string): AppState {
  const envelope: StorageEnvelope = JSON.parse(json);
  if (!envelope || !envelope.data) {
    throw new Error('Некорректный формат файла');
  }
  const checksum = djb2Hash(JSON.stringify(envelope.data));
  if (checksum !== envelope.checksum) {
    throw new Error('Контрольная сумма не совпадает — файл повреждён');
  }
  if ((envelope.version ?? 1) < STORAGE_VERSION) {
    return migrateState(envelope.data, envelope.version ?? 1);
  }
  return envelope.data;
}

export function downloadJson(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
