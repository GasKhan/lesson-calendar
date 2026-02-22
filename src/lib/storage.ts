import { AppState, StorageEnvelope } from '@/types/models';
import { STORAGE_KEY, STORAGE_BACKUP_KEY, STORAGE_VERSION, INITIAL_STATE } from '@/constants/defaults';
import { djb2Hash } from './checksum';
import { migrateState } from './migrations';

function computeChecksum(data: AppState): string {
  return djb2Hash(JSON.stringify(data));
}

function createEnvelope(data: AppState): StorageEnvelope {
  return {
    version: STORAGE_VERSION,
    timestamp: new Date().toISOString(),
    data,
    checksum: computeChecksum(data),
  };
}

function validateEnvelope(envelope: StorageEnvelope): boolean {
  if (!envelope || !envelope.data || !envelope.checksum) return false;
  return computeChecksum(envelope.data) === envelope.checksum;
}

// --- localStorage ---

function saveToLocalStorage(data: AppState): boolean {
  try {
    const currentRaw = localStorage.getItem(STORAGE_KEY);
    if (currentRaw) {
      localStorage.setItem(STORAGE_BACKUP_KEY, currentRaw);
    }
    const envelope = createEnvelope(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
}

function migrateEnvelope(envelope: StorageEnvelope): AppState {
  if (envelope.version < STORAGE_VERSION) {
    return migrateState(envelope.data, envelope.version);
  }
  return envelope.data;
}

function loadFromLocalStorage(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const envelope: StorageEnvelope = JSON.parse(raw);
    if (validateEnvelope(envelope)) {
      return migrateEnvelope(envelope);
    }
    // Try backup
    const backupRaw = localStorage.getItem(STORAGE_BACKUP_KEY);
    if (backupRaw) {
      const backup: StorageEnvelope = JSON.parse(backupRaw);
      if (validateEnvelope(backup)) {
        return migrateEnvelope(backup);
      }
    }
    return null;
  } catch {
    return null;
  }
}

// --- IndexedDB ---

const IDB_NAME = 'lesson-calendar-db';
const IDB_STORE = 'state';

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveToIndexedDB(data: AppState): Promise<boolean> {
  try {
    const db = await openIDB();
    const envelope = createEnvelope(data);
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(JSON.stringify(envelope), STORAGE_KEY);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

async function loadFromIndexedDB(): Promise<AppState | null> {
  try {
    const db = await openIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(STORAGE_KEY);
      req.onsuccess = () => {
        if (!req.result) {
          resolve(null);
          return;
        }
        const envelope: StorageEnvelope = JSON.parse(req.result);
        resolve(validateEnvelope(envelope) ? migrateEnvelope(envelope) : null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// --- Storage Engine ---

export const StorageEngine = {
  async save(data: AppState): Promise<void> {
    const lsOk = saveToLocalStorage(data);
    if (!lsOk) {
      await saveToIndexedDB(data);
    }
  },

  saveSyncForUnload(data: AppState): void {
    saveToLocalStorage(data);
  },

  async load(): Promise<AppState> {
    const lsData = loadFromLocalStorage();
    if (lsData) return lsData;

    const idbData = await loadFromIndexedDB();
    if (idbData) return idbData;

    return INITIAL_STATE;
  },
};
