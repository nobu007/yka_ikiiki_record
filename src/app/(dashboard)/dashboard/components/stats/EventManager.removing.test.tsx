import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventManager from './EventManager';
import { clearMocks, mockEvents, mockOnAddEvent, mockOnRemoveEvent } from './EventManager.test.setup';

describe('EventManager - removing events', () => {
  beforeEach(() => {
    clearMocks();
  });

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
