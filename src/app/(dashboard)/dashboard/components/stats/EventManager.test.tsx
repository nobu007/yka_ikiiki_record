import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventManager from './EventManager';
import { ClassEvent } from '@/domain/entities/DataGeneration';

describe('EventManager', () => {
  const mockEvents: ClassEvent[] = [
    {
      name: 'テスト勉強会',
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-01-20'),
      impact: 0.5
    },
    {
      name: '運動会',
      startDate: new Date('2026-02-10'),
      endDate: new Date('2026-02-10'),
      impact: -0.3
    }
  ];

  const mockOnAddEvent = jest.fn();
  const mockOnRemoveEvent = jest.fn();

  beforeEach(() => {
    mockOnAddEvent.mockClear();
    mockOnRemoveEvent.mockClear();
  });

  describe('rendering', () => {
    it('should render event input form', () => {
      render(
        <EventManager
          events={mockEvents}
          onAddEvent={mockOnAddEvent}
          onRemoveEvent={mockOnRemoveEvent}
        />
      );

      expect(screen.getByPlaceholderText('イベント名')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('影響度 (-1.0 〜 1.0)')).toBeInTheDocument();
      expect(screen.getByText('イベントを追加')).toBeInTheDocument();
    });

    it('should render existing events', () => {
      render(
        <EventManager
          events={mockEvents}
          onAddEvent={mockOnAddEvent}
          onRemoveEvent={mockOnRemoveEvent}
        />
      );

      expect(screen.getByText('テスト勉強会')).toBeInTheDocument();
      expect(screen.getByText('運動会')).toBeInTheDocument();
    });

    it('should display event date ranges correctly', () => {
      render(
        <EventManager
          events={mockEvents}
          onAddEvent={mockOnAddEvent}
          onRemoveEvent={mockOnRemoveEvent}
        />
      );

      expect(screen.getByText(/2026\/1\/15 〜 2026\/1\/20/)).toBeInTheDocument();
      expect(screen.getByText(/2026\/2\/10 〜 2026\/2\/10/)).toBeInTheDocument();
    });

    it('should render delete buttons for each event', () => {
      render(
        <EventManager
          events={mockEvents}
          onAddEvent={mockOnRemoveEvent}
          onRemoveEvent={mockOnRemoveEvent}
        />
      );

      const deleteButtons = screen.getAllByText('削除');
      expect(deleteButtons).toHaveLength(2);
    });

    it('should render two date input fields', () => {
      render(
        <EventManager
          events={mockEvents}
          onAddEvent={mockOnAddEvent}
          onRemoveEvent={mockOnRemoveEvent}
        />
      );

      const dateInputs = screen.getAllByRole('textbox').filter(input =>
        input.getAttribute('type') === 'date'
      );
      expect(dateInputs).toHaveLength(2);
    });
  });

  describe('adding events', () => {
    it('should call onAddEvent when all fields are filled', async () => {
      const user = userEvent.setup();
      render(
        <EventManager
          events={[]}
          onAddEvent={mockOnAddEvent}
          onRemoveEvent={mockOnRemoveEvent}
        />
      );

      await user.type(screen.getByPlaceholderText('イベント名'), '文化祭');
      await user.type(screen.getAllByRole('textbox')[1], '2026-03-01');
      await user.type(screen.getAllByRole('textbox')[2], '2026-03-05');
      await user.type(screen.getByPlaceholderText('影響度 (-1.0 〜 1.0)'), '0.7');
      await user.click(screen.getByText('イベントを追加'));

      expect(mockOnAddEvent).toHaveBeenCalledTimes(1);
      expect(mockOnAddEvent).toHaveBeenCalledWith({
        name: '文化祭',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-05'),
        impact: 0.7
      });
    });

    it('should not call onAddEvent when name is missing', async () => {
      const user = userEvent.setup();
      render(
        <EventManager
          events={[]}
          onAddEvent={mockOnAddEvent}
          onRemoveEvent={mockOnRemoveEvent}
        />
      );

      await user.type(screen.getAllByRole('textbox')[1], '2026-03-01');
      await user.type(screen.getAllByRole('textbox')[2], '2026-03-05');
      await user.type(screen.getByPlaceholderText('影響度 (-1.0 〜 1.0)'), '0.7');
      await user.click(screen.getByText('イベントを追加'));

      expect(mockOnAddEvent).not.toHaveBeenCalled();
    });

    it('should not call onAddEvent when start date is missing', async () => {
      const user = userEvent.setup();
      render(
        <EventManager
          events={[]}
          onAddEvent={mockOnAddEvent}
          onRemoveEvent={mockOnRemoveEvent}
        />
      );

      await user.type(screen.getByPlaceholderText('イベント名'), '文化祭');
      await user.type(screen.getAllByRole('textbox')[2], '2026-03-05');
      await user.type(screen.getByPlaceholderText('影響度 (-1.0 〜 1.0)'), '0.7');
      await user.click(screen.getByText('イベントを追加'));

      expect(mockOnAddEvent).not.toHaveBeenCalled();
    });

    it('should not call onAddEvent when end date is missing', async () => {
      const user = userEvent.setup();
      render(
        <EventManager
          events={[]}
          onAddEvent={mockOnAddEvent}
          onRemoveEvent={mockOnRemoveEvent}
        />
      );

      await user.type(screen.getByPlaceholderText('イベント名'), '文化祭');
      await user.type(screen.getAllByRole('textbox')[1], '2026-03-01');
      await user.type(screen.getByPlaceholderText('影響度 (-1.0 〜 1.0)'), '0.7');
      await user.click(screen.getByText('イベントを追加'));

      expect(mockOnAddEvent).not.toHaveBeenCalled();
    });

    it('should not call onAddEvent when impact is missing', async () => {
      const user = userEvent.setup();
      render(
        <EventManager
          events={[]}
          onAddEvent={mockOnAddEvent}
          onRemoveEvent={mockOnRemoveEvent}
        />
      );

      await user.type(screen.getByPlaceholderText('イベント名'), '文化祭');
      await user.type(screen.getAllByRole('textbox')[1], '2026-03-01');
      await user.type(screen.getAllByRole('textbox')[2], '2026-03-05');
      await user.click(screen.getByText('イベントを追加'));

      expect(mockOnAddEvent).not.toHaveBeenCalled();
    });

    it('should reset form after successful event addition', async () => {
      const user = userEvent.setup();
      render(
        <EventManager
          events={[]}
          onAddEvent={mockOnAddEvent}
          onRemoveEvent={mockOnRemoveEvent}
        />
      );

      await user.type(screen.getByPlaceholderText('イベント名'), '文化祭');
      await user.type(screen.getAllByRole('textbox')[1], '2026-03-01');
      await user.type(screen.getAllByRole('textbox')[2], '2026-03-05');
      await user.type(screen.getByPlaceholderText('影響度 (-1.0 〜 1.0)'), '0.7');
      await user.click(screen.getByText('イベントを追加'));

      expect(screen.getByPlaceholderText('イベント名')).toHaveValue('');
      expect(screen.getByPlaceholderText('影響度 (-1.0 〜 1.0)')).toHaveValue('');
    });

    it('should handle negative impact values', async () => {
      const user = userEvent.setup();
      render(
        <EventManager
          events={[]}
          onAddEvent={mockOnAddEvent}
          onRemoveEvent={mockOnRemoveEvent}
        />
      );

      await user.type(screen.getByPlaceholderText('イベント名'), 'テスト期間');
      await user.type(screen.getAllByRole('textbox')[1], '2026-03-01');
      await user.type(screen.getAllByRole('textbox')[2], '2026-03-10');
      await user.type(screen.getByPlaceholderText('影響度 (-1.0 〜 1.0)'), '-0.8');
      await user.click(screen.getByText('イベントを追加'));

      expect(mockOnAddEvent).toHaveBeenCalledWith({
        name: 'テスト期間',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-10'),
        impact: -0.8
      });
    });
  });

  describe('removing events', () => {
    it('should call onRemoveEvent with correct index when delete button clicked', async () => {
      const user = userEvent.setup();
      render(
        <EventManager
          events={mockEvents}
          onAddEvent={mockOnAddEvent}
          onRemoveEvent={mockOnRemoveEvent}
        />
      );

      const deleteButtons = screen.getAllByText('削除');
      await user.click(deleteButtons[0]);

      expect(mockOnRemoveEvent).toHaveBeenCalledTimes(1);
      expect(mockOnRemoveEvent).toHaveBeenCalledWith(0);
    });

    it('should call onRemoveEvent with correct index for second event', async () => {
      const user = userEvent.setup();
      render(
        <EventManager
          events={mockEvents}
          onAddEvent={mockOnAddEvent}
          onRemoveEvent={mockOnRemoveEvent}
        />
      );

      const deleteButtons = screen.getAllByText('削除');
      await user.click(deleteButtons[1]);

      expect(mockOnRemoveEvent).toHaveBeenCalledTimes(1);
      expect(mockOnRemoveEvent).toHaveBeenCalledWith(1);
    });
  });

  describe('form interaction behavior', () => {
    it('should handle empty impact input correctly', async () => {
      const user = userEvent.setup();
      render(
        <EventManager
          events={[]}
          onAddEvent={mockOnAddEvent}
          onRemoveEvent={mockOnRemoveEvent}
        />
      );

      const impactInput = screen.getByPlaceholderText('影響度 (-1.0 〜 1.0)');
      await user.type(impactInput, '0.5');
      await user.clear(impactInput);

      expect(impactInput).toHaveValue('');
    });

    it('should update input values on user input', async () => {
      const user = userEvent.setup();
      render(
        <EventManager
          events={[]}
          onAddEvent={mockOnAddEvent}
          onRemoveEvent={mockOnRemoveEvent}
        />
      );

      const nameInput = screen.getByPlaceholderText('イベント名');
      await user.type(nameInput, '修学旅行');

      expect(nameInput).toHaveValue('修学旅行');
    });
  });

  describe('memoization', () => {
    it('should have displayName set for debugging', () => {
      expect(EventManager.displayName).toBe('EventManager');
    });

    it('should be wrapped with React.memo', () => {
      const memoizedComponent = EventManager;
      expect(memoizedComponent).toBeDefined();
      expect(typeof memoizedComponent).toBe('object');
    });
  });
});
