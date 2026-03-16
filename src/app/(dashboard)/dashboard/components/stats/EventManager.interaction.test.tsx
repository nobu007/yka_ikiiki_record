import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventManager from './EventManager';
import { clearMocks, mockOnAddEvent, mockOnRemoveEvent } from './EventManager.test.setup';

describe('EventManager - form interaction behavior', () => {
  beforeEach(() => {
    clearMocks();
  });

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

    expect(impactInput).toHaveValue(null);
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
