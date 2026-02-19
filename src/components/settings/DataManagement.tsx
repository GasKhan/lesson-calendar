'use client';

import { useRef, useState } from 'react';
import { useAppState, useAppDispatch } from '@/contexts/AppContext';
import { exportData, importData, downloadJson } from '@/lib/export';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';

export default function DataManagement() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const fileRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleExport = () => {
    const json = exportData(state);
    const date = new Date().toISOString().split('T')[0];
    downloadJson(`lesson-calendar-${date}.json`, json);
    showToast('Данные экспортированы', 'success');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = importData(text);
      dispatch({ type: 'STATE_REPLACE', payload: data });
      showToast('Данные импортированы', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка импорта';
      showToast(message, 'error');
    }

    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-text-secondary">Данные</h3>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={handleExport}>
          Экспорт JSON
        </Button>
        <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>
          Импорт JSON
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
      </div>
    </div>
  );
}
