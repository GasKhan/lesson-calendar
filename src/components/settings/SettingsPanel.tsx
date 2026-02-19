'use client';

import { useAppState, useAppDispatch } from '@/contexts/AppContext';
import { requestNotificationPermission } from '@/lib/notifications';
import { useToast } from '../ui/Toast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import DataManagement from './DataManagement';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenParticipants: () => void;
}

export default function SettingsPanel({ isOpen, onClose, onOpenParticipants }: SettingsPanelProps) {
  const { settings } = useAppState();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const updateSetting = (key: string, value: unknown) => {
    dispatch({ type: 'SETTINGS_UPDATE', payload: { [key]: value } });
  };

  const handleNotificationToggle = async () => {
    if (!settings.notificationsEnabled) {
      const perm = await requestNotificationPermission();
      if (perm === 'granted') {
        updateSetting('notificationsEnabled', true);
        showToast('Уведомления включены', 'success');
      } else {
        showToast('Разрешение на уведомления не получено', 'error');
      }
    } else {
      updateSetting('notificationsEnabled', false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Настройки">
      <div className="flex flex-col gap-6">
        {/* Calendar hours */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-text-secondary">Календарь</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Начало дня"
              type="number"
              min={0}
              max={23}
              value={String(settings.calendarStartHour)}
              onChange={(e) => updateSetting('calendarStartHour', Number(e.target.value))}
            />
            <Input
              label="Конец дня"
              type="number"
              min={1}
              max={24}
              value={String(settings.calendarEndHour)}
              onChange={(e) => updateSetting('calendarEndHour', Number(e.target.value))}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-text-secondary">Уведомления</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={handleNotificationToggle}
              className="accent-accent"
            />
            <span className="text-sm text-text-primary">Включить уведомления</span>
          </label>
          {settings.notificationsEnabled && (
            <Input
              label="Минут до начала"
              type="number"
              min={1}
              max={60}
              value={String(settings.notificationMinutesBefore)}
              onChange={(e) =>
                updateSetting('notificationMinutesBefore', Number(e.target.value))
              }
            />
          )}
        </div>

        {/* Participants */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-text-secondary">Участники</h3>
          <Button size="sm" variant="secondary" onClick={() => { onClose(); onOpenParticipants(); }}>
            Управление участниками
          </Button>
        </div>

        {/* Data management */}
        <DataManagement />
      </div>
    </Modal>
  );
}
