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
    const firstButton = deleteButtons[0];
    if (!firstButton) throw new Error('Delete button not found');
    await user.click(firstButton);

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
    const secondButton = deleteButtons[1];
    if (!secondButton) throw new Error('Delete button not found');
    await user.click(secondButton);

    expect(mockOnRemoveEvent).toHaveBeenCalledTimes(1);
    expect(mockOnRemoveEvent).toHaveBeenCalledWith(1);
  });
});
