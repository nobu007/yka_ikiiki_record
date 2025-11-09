import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Notification } from './Notification';

describe('Notification', () => {
  test('does not render when show is false', () => {
    render(
      <Notification
        show={false}
        message="Test message"
        type="success"
      />
    );

    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  test('renders success notification', () => {
    render(
      <Notification
        show={true}
        message="Success message"
        type="success"
      />
    );

    expect(screen.getByText('Success message')).toBeInTheDocument();
    const notification = screen.getByText('Success message').closest('div')?.parentElement?.parentElement;
    expect(notification).toHaveClass('bg-green-100', 'border-green-400', 'text-green-700');
  });

  test('renders error notification', () => {
    render(
      <Notification
        show={true}
        message="Error message"
        type="error"
      />
    );

    expect(screen.getByText('Error message')).toBeInTheDocument();
    const notification = screen.getByText('Error message').closest('div')?.parentElement?.parentElement;
    expect(notification).toHaveClass('bg-red-100', 'border-red-400', 'text-red-700');
  });

  test('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    
    render(
      <Notification
        show={true}
        message="Test message"
        type="success"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByText('閉じる');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('renders close button when onClose is provided', () => {
    const mockOnClose = jest.fn();
    
    render(
      <Notification
        show={true}
        message="Message with close button"
        type="success"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByText('閉じる');
    expect(closeButton).toBeInTheDocument();
  });

  test('does not render close button when onClose is not provided', () => {
    render(
      <Notification
        show={true}
        message="Message without close button"
        type="success"
      />
    );

    expect(screen.queryByText('閉じる')).not.toBeInTheDocument();
  });

  test('renders success icon for success type', () => {
    render(
      <Notification
        show={true}
        message="Success message"
        type="success"
      />
    );

    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('h-5', 'w-5', 'mr-2');
  });

  test('renders error icon for error type', () => {
    render(
      <Notification
        show={true}
        message="Error message"
        type="error"
      />
    );

    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('h-5', 'w-5', 'mr-2');
  });

  test('applies correct layout classes', () => {
    render(
      <Notification
        show={true}
        message="Test message"
        type="success"
      />
    );

    const container = screen.getByText('Test message').closest('div')?.parentElement?.parentElement;
    expect(container).toHaveClass('mb-4', 'p-4', 'border', 'rounded-md');
    
    const flexContainer = screen.getByText('Test message').parentElement;
    expect(flexContainer).toHaveClass('flex', 'items-center');
  });
});