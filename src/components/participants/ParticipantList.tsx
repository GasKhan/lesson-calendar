'use client';

import { useState } from 'react';
import { useAppState, useAppDispatch } from '@/contexts/AppContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import ParticipantForm from './ParticipantForm';
import { Participant } from '@/types/models';

interface ParticipantListProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ParticipantList({ isOpen, onClose }: ParticipantListProps) {
  const { participants } = useAppState();
  const dispatch = useAppDispatch();
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Participant | null>(null);

  const handleDelete = (participant: Participant) => {
    dispatch({ type: 'PARTICIPANT_DELETE', payload: { id: participant.id } });
    setDeleteTarget(null);
  };

  if (showAddForm || editingParticipant) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setShowAddForm(false);
          setEditingParticipant(null);
        }}
        title={editingParticipant ? 'Редактировать участника' : 'Новый участник'}
      >
        <ParticipantForm
          participant={editingParticipant ?? undefined}
          onClose={() => {
            setShowAddForm(false);
            setEditingParticipant(null);
          }}
        />
      </Modal>
    );
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Участники">
        <div className="flex flex-col gap-3">
          <Button size="sm" onClick={() => setShowAddForm(true)}>
            + Добавить участника
          </Button>

          {participants.length === 0 && (
            <p className="text-sm text-text-muted text-center py-4">
              Нет участников
            </p>
          )}

          {participants.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-bg-secondary"
            >
              <div>
                <div className="text-sm font-medium text-text-primary">{p.name}</div>
                {p.email && (
                  <div className="text-xs text-text-muted">{p.email}</div>
                )}
                {p.phone && (
                  <div className="text-xs text-text-muted">{p.phone}</div>
                )}
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => setEditingParticipant(p)}>
                  Ред.
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(p)}>
                  &times;
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {deleteTarget && (
        <ConfirmDialog
          isOpen
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget)}
          title="Удалить участника?"
          message={`Участник «${deleteTarget.name}» будет удалён из всех уроков.`}
          confirmLabel="Удалить"
        />
      )}
    </>
  );
}
