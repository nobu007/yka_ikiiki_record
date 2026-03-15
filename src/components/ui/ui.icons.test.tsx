import React from 'react';
import { render } from '@testing-library/react';
import {
  LoadingSpinner,
  CheckIcon,
  PlusIcon,
  NotificationIcon
} from './index';

describe('UI Icons', () => {
  describe('LoadingSpinner', () => {
    it('renders with default size (md) and color (blue)', () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toHaveClass('w-6', 'h-6');
      expect(spinner).toHaveAttribute('aria-label', '読み込み中');
    });

    it('renders with small size', () => {
      const { container } = render(<LoadingSpinner size="sm" />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toHaveClass('w-4', 'h-4');
    });

    it('renders with custom color', () => {
      const { container } = render(<LoadingSpinner color="green" />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toHaveClass('border-t-green-500');
    });
  });

  describe('CheckIcon', () => {
    it('renders check icon', () => {
      const { container } = render(<CheckIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-4', 'h-4', 'text-green-500');
    });
  });

  describe('PlusIcon', () => {
    it('renders plus icon', () => {
      const { container } = render(<PlusIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-5', 'h-5');
    });
  });

  describe('NotificationIcon', () => {
    it('renders success icon', () => {
      const { container } = render(<NotificationIcon type="success" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-green-500');
    });

    it('renders error icon', () => {
      const { container } = render(<NotificationIcon type="error" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-red-500');
    });

    it('renders warning icon', () => {
      const { container } = render(<NotificationIcon type="warning" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-yellow-500');
    });

    it('renders info icon', () => {
      const { container } = render(<NotificationIcon type="info" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-blue-500');
    });
  });
});
