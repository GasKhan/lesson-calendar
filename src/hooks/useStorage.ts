'use client';

import { useEffect, useRef } from 'react';
import { AppState } from '@/types/models';
import { AppAction } from '@/types/actions';
import { StorageEngine } from '@/lib/storage';
import { AUTOSAVE_DEBOUNCE_MS } from '@/constants/defaults';

export function useStorage(
  state: AppState,
  dispatch: React.Dispatch<AppAction>,
  isHydrated: React.MutableRefObject<boolean>
) {
  const stateRef = useRef(state);
  stateRef.current = state;

  // Hydrate on mount
  useEffect(() => {
    StorageEngine.load().then((data) => {
      dispatch({ type: 'STATE_HYDRATE', payload: data });
      isHydrated.current = true;
    });
  }, [dispatch, isHydrated]);

  // Debounced auto-save
  useEffect(() => {
    if (!isHydrated.current) return;

    const timer = setTimeout(() => {
      StorageEngine.save(state);
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [state]);

  // beforeunload — sync save
  useEffect(() => {
    const handler = () => {
      if (isHydrated.current) {
        StorageEngine.saveSyncForUnload(stateRef.current);
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);
}
