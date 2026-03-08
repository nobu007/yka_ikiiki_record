'use client';

import { memo, useState } from 'react';
import { ClassEvent } from '@/domain/entities/DataGeneration';

interface NewEventForm {
  name: string;
  startDate: string;
  endDate: string;
  impact: number | '';
}

const DEFAULT_NEW_EVENT: NewEventForm = {
  name: '',
  startDate: '',
  endDate: '',
  impact: ''
};

interface Props {
  events: ClassEvent[];
  onAddEvent: (event: ClassEvent) => void;
  onRemoveEvent: (index: number) => void;
}

const EventManager = memo(function EventManager({ events, onAddEvent, onRemoveEvent }: Props) {
  const [newEvent, setNewEvent] = useState<NewEventForm>(DEFAULT_NEW_EVENT);

  const handleAddEvent = () => {
    if (
      newEvent.name &&
      newEvent.startDate &&
      newEvent.endDate &&
      typeof newEvent.impact === 'number'
    ) {
      onAddEvent({
        name: newEvent.name,
        startDate: new Date(newEvent.startDate),
        endDate: new Date(newEvent.endDate),
        impact: newEvent.impact
      });
      setNewEvent(DEFAULT_NEW_EVENT);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">イベントの追加</label>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="イベント名"
          value={newEvent.name}
          onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
          className="w-full p-2 border rounded"
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={newEvent.startDate}
            onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
            className="p-2 border rounded"
          />
          <input
            type="date"
            value={newEvent.endDate}
            onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
            className="p-2 border rounded"
          />
        </div>

        <input
          type="number"
          placeholder="影響度 (-1.0 〜 1.0)"
          min="-1"
          max="1"
          step="0.1"
          value={newEvent.impact}
          onChange={(e) => setNewEvent(prev => ({
            ...prev,
            impact: e.target.value ? Number(e.target.value) : ''
          }))}
          className="w-full p-2 border rounded"
        />

        <button
          onClick={handleAddEvent}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          イベントを追加
        </button>
      </div>

      <div className="space-y-2">
        {events.map((event, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded">
            <span className="text-sm">
              {event.name} ({new Date(event.startDate).toLocaleDateString()} 〜 {new Date(event.endDate).toLocaleDateString()})
            </span>
            <button
              onClick={() => onRemoveEvent(index)}
              className="text-red-500 hover:text-red-600"
            >
              削除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

EventManager.displayName = 'EventManager';

export default EventManager;
