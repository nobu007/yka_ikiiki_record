import type { ClassEvent } from '@/schemas/api';

/**
 * Mock events for testing
 */
export const mockEvents: ClassEvent[] = [
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

/**
 * Mock callback functions
 */
export const mockOnAddEvent = jest.fn();
export const mockOnRemoveEvent = jest.fn();

/**
 * Setup function to clear all mocks before each test
 */
export function clearMocks(): void {
  mockOnAddEvent.mockClear();
  mockOnRemoveEvent.mockClear();
}

/**
 * Default props for EventManager component
 */
export const defaultProps = {
  events: mockEvents,
  onAddEvent: mockOnAddEvent,
  onRemoveEvent: mockOnRemoveEvent
};
