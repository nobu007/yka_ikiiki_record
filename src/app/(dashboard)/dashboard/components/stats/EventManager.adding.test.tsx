import React from 'react';
import { memo } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventManager from './EventManager';
import { clearMocks, mockOnAddEvent, mockOnRemoveEvent } from './EventManager.test.setup';

describe('EventManager - adding events', () => {
  beforeEach(() => {
    clearMocks();
  });

  it('should call onAddEvent when all fields are filled', async () => {
    const user = userEvent.setup();
    render(
      <EventManager
        events={[]}
        onAddEvent={mockOnAddEvent}
        onRemoveEvent={mockOnRemoveEvent}
      />
    );

    const nameInput = screen.getByPlaceholderText('イベント名');
    const dateInputs = screen.getAllByDisplayValue('');
    const impactInput = screen.getByPlaceholderText('影響度 (-1.0 〜 1.0)');

    const startDateInput = dateInputs[1];
    const endDateInput = dateInputs[2];
    if (!startDateInput || !endDateInput) throw new Error('Date inputs not found');

    await user.type(nameInput, '文化祭');
    await user.type(startDateInput, '2026-03-01');
    await user.type(endDateInput, '2026-03-05');
    await user.type(impactInput, '0.7');
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

    const dateInputs = screen.getAllByDisplayValue('');
    const impactInput = screen.getByPlaceholderText('影響度 (-1.0 〜 1.0)');

    const startDateInput = dateInputs[1];
    const endDateInput = dateInputs[2];
    if (!startDateInput || !endDateInput) throw new Error('Date inputs not found');

    await user.type(startDateInput, '2026-03-01');
    await user.type(endDateInput, '2026-03-05');
    await user.type(impactInput, '0.7');
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

    const nameInput = screen.getByPlaceholderText('イベント名');
    const dateInputs = screen.getAllByDisplayValue('');
    const impactInput = screen.getByPlaceholderText('影響度 (-1.0 〜 1.0)');

    const endDateInput = dateInputs[2];
    if (!endDateInput) throw new Error('End date input not found');

    await user.type(nameInput, '文化祭');
    await user.type(endDateInput, '2026-03-05');
    await user.type(impactInput, '0.7');
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

    const nameInput = screen.getByPlaceholderText('イベント名');
    const dateInputs = screen.getAllByDisplayValue('');
    const impactInput = screen.getByPlaceholderText('影響度 (-1.0 〜 1.0)');

    const startDateInput = dateInputs[1];
    if (!startDateInput) throw new Error('Start date input not found');

    await user.type(nameInput, '文化祭');
    await user.type(startDateInput, '2026-03-01');
    await user.type(impactInput, '0.7');
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

    const nameInput = screen.getByPlaceholderText('イベント名');
    const dateInputs = screen.getAllByDisplayValue('');

    const startDateInput = dateInputs[1];
    const endDateInput = dateInputs[2];
    if (!startDateInput || !endDateInput) throw new Error('Date inputs not found');

    await user.type(nameInput, '文化祭');
    await user.type(startDateInput, '2026-03-01');
    await user.type(endDateInput, '2026-03-05');
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

    const nameInput = screen.getByPlaceholderText('イベント名');
    const dateInputs = screen.getAllByDisplayValue('');
    const impactInput = screen.getByPlaceholderText('影響度 (-1.0 〜 1.0)');

    const startDateInput = dateInputs[1];
    const endDateInput = dateInputs[2];
    if (!startDateInput || !endDateInput) throw new Error('Date inputs not found');

    await user.type(nameInput, '文化祭');
    await user.type(startDateInput, '2026-03-01');
    await user.type(endDateInput, '2026-03-05');
    await user.type(impactInput, '0.7');
    await user.click(screen.getByText('イベントを追加'));

    expect(nameInput).toHaveValue('');
    expect(impactInput).toHaveValue(null);
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

    const nameInput = screen.getByPlaceholderText('イベント名');
    const dateInputs = screen.getAllByDisplayValue('');
    const impactInput = screen.getByPlaceholderText('影響度 (-1.0 〜 1.0)');

    const startDateInput = dateInputs[1];
    const endDateInput = dateInputs[2];
    if (!startDateInput || !endDateInput) throw new Error('Date inputs not found');

    await user.type(nameInput, 'テスト期間');
    await user.type(startDateInput, '2026-03-01');
    await user.type(endDateInput, '2026-03-10');
    await user.type(impactInput, '-0.8');
    await user.click(screen.getByText('イベントを追加'));

    expect(mockOnAddEvent).toHaveBeenCalledWith({
      name: 'テスト期間',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-10'),
      impact: -0.8
    });
  });
});
