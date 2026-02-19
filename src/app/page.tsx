'use client';

import { useState } from 'react';
import { DayOfWeek } from '@/types/models';
import { LessonOccurrence } from '@/hooks/useLessonOccurrences';
import Header from '@/components/layout/Header';
import WeeklyCalendar from '@/components/calendar/WeeklyCalendar';
import LessonModal from '@/components/lessons/LessonModal';
import LessonForm from '@/components/lessons/LessonForm';
import SettingsPanel from '@/components/settings/SettingsPanel';
import ParticipantList from '@/components/participants/ParticipantList';
import Modal from '@/components/ui/Modal';

export default function HomePage() {
  const [selectedOccurrence, setSelectedOccurrence] = useState<LessonOccurrence | null>(null);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [addLessonDefaults, setAddLessonDefaults] = useState<{
    dayOfWeek?: DayOfWeek;
    hour?: number;
  }>({});
  const [showSettings, setShowSettings] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const handleSlotClick = (dayOfWeek: DayOfWeek, hour: number) => {
    setAddLessonDefaults({ dayOfWeek, hour });
    setShowAddLesson(true);
  };

  const handleLessonClick = (occurrence: LessonOccurrence) => {
    setSelectedOccurrence(occurrence);
  };

  return (
    <div className="flex flex-col h-screen bg-bg-primary">
      <Header
        onOpenSettings={() => setShowSettings(true)}
        onAddLesson={() => {
          setAddLessonDefaults({});
          setShowAddLesson(true);
        }}
      />

      <main className="flex-1 overflow-hidden">
        <WeeklyCalendar
          onLessonClick={handleLessonClick}
          onSlotClick={handleSlotClick}
        />
      </main>

      {/* Lesson detail modal */}
      <LessonModal
        occurrence={selectedOccurrence}
        onClose={() => setSelectedOccurrence(null)}
      />

      {/* Add lesson modal */}
      {showAddLesson && (
        <Modal isOpen onClose={() => setShowAddLesson(false)} title="Новый урок">
          <LessonForm
            initialDayOfWeek={addLessonDefaults.dayOfWeek}
            initialHour={addLessonDefaults.hour}
            onClose={() => setShowAddLesson(false)}
          />
        </Modal>
      )}

      {/* Settings */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onOpenParticipants={() => setShowParticipants(true)}
      />

      {/* Participants */}
      <ParticipantList
        isOpen={showParticipants}
        onClose={() => setShowParticipants(false)}
      />
    </div>
  );
}
