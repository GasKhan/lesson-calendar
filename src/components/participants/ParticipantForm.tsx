'use client';

import { useState } from 'react';
import { Participant } from '@/types/models';
import { useAppDispatch } from '@/contexts/AppContext';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface ParticipantFormProps {
  participant?: Participant;
  onClose: () => void;
}

export default function ParticipantForm({ participant, onClose }: ParticipantFormProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(participant?.name ?? '');
  const [email, setEmail] = useState(participant?.email ?? '');
  const [phone, setPhone] = useState(participant?.phone ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (participant) {
      dispatch({
        type: 'PARTICIPANT_UPDATE',
        payload: {
          id: participant.id,
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        },
      });
    } else {
      dispatch({
        type: 'PARTICIPANT_ADD',
        payload: {
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        },
      });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Имя"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Иван Иванов"
        required
      />
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ivan@example.com"
      />
      <Input
        label="Телефон"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+7 999 123-45-67"
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onClose}>
          Отмена
        </Button>
        <Button type="submit" disabled={!name.trim()}>
          {participant ? 'Сохранить' : 'Добавить'}
        </Button>
      </div>
    </form>
  );
}
