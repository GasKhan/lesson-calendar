'use client';

import { createContext, useContext, useReducer, useRef, ReactNode, Dispatch } from 'react';
import { AppState } from '@/types/models';
import { AppAction } from '@/types/actions';
import { INITIAL_STATE } from '@/constants/defaults';
import { appReducer } from '@/reducers/appReducer';
import { useStorage } from '@/hooks/useStorage';
import { useNotifications } from '@/hooks/useNotifications';

const AppStateContext = createContext<AppState>(INITIAL_STATE);
const AppDispatchContext = createContext<Dispatch<AppAction>>(() => {});

export function useAppState(): AppState {
  return useContext(AppStateContext);
}

export function useAppDispatch(): Dispatch<AppAction> {
  return useContext(AppDispatchContext);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);
  const isHydrated = useRef(false);

  useStorage(state, dispatch, isHydrated);
  useNotifications(state);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}
