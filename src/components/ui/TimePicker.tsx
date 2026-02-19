'use client';

import { TimeOfDay } from '@/types/models';
import { formatTime } from '@/lib/time';

interface TimePickerProps {
  label?: string;
  value: TimeOfDay;
  onChange: (time: TimeOfDay) => void;
  error?: string;
}

export default function TimePicker({ label, value, onChange, error }: TimePickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      onChange({ hours: h, minutes: m });
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-text-secondary">{label}</label>
      )}
      <input
        type="time"
        value={formatTime(value)}
        onChange={handleChange}
        className={`w-full rounded-lg border border-border-color bg-bg-primary px-3 py-2 text-sm
          text-text-primary
          focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
          ${error ? 'border-danger' : ''}`}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
