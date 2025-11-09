import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner, LoadingOverlay } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  test('renders with default props', () => {
    render(<LoadingSpinner />);
    
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('animate-spin', 'h-8', 'w-8', 'text-blue-600');
  });

  test('renders with large size', () => {
    render(<LoadingSpinner size="lg" />);
    
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('h-12', 'w-12');
  });

  test('renders with small size', () => {
    render(<LoadingSpinner size="sm" />);
    
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('h-4', 'w-4');
  });

  test('renders with medium size', () => {
    render(<LoadingSpinner size="md" />);
    
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('h-8', 'w-8');
  });

  test('renders with primary color', () => {
    render(<LoadingSpinner color="primary" />);
    
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('text-blue-600');
  });

  test('renders with secondary color', () => {
    render(<LoadingSpinner color="secondary" />);
    
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('text-gray-600');
  });

  test('renders with white color', () => {
    render(<LoadingSpinner color="white" />);
    
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('text-white');
  });

  test('renders with custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    
    const container = document.querySelector('.flex.justify-center.items-center');
    expect(container).toHaveClass('custom-class');
  });

  test('renders SVG with correct attributes', () => {
    render(<LoadingSpinner />);
    
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
  });

  test('renders circle and path elements', () => {
    render(<LoadingSpinner />);
    
    const circle = document.querySelector('circle');
    const path = document.querySelector('path');
    
    expect(circle).toBeInTheDocument();
    expect(path).toBeInTheDocument();
    expect(circle).toHaveClass('opacity-25');
    expect(path).toHaveClass('opacity-75');
  });
});

describe('LoadingOverlay', () => {
  test('renders overlay when isLoading is true', () => {
    render(<LoadingOverlay isLoading={true} message="Loading data..." />);
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
    const overlay = document.querySelector('.fixed.inset-0');
    expect(overlay).toBeInTheDocument();
  });

  test('does not render when isLoading is false', () => {
    render(<LoadingOverlay isLoading={false} message="Loading data..." />);
    
    expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    expect(document.querySelector('.fixed.inset-0')).not.toBeInTheDocument();
  });

  test('renders with default message when no message provided', () => {
    render(<LoadingOverlay isLoading={true} />);
    
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  test('renders spinner within overlay', () => {
    render(<LoadingOverlay isLoading={true} />);
    
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('h-12', 'w-12', 'text-blue-600');
  });

  test('applies correct overlay classes', () => {
    render(<LoadingOverlay isLoading={true} />);
    
    const overlay = document.querySelector('.fixed.inset-0');
    expect(overlay).toHaveClass(
      'fixed',
      'inset-0',
      'bg-gray-600',
      'bg-opacity-50',
      'overflow-y-auto',
      'h-full',
      'w-full',
      'z-50',
      'flex',
      'items-center',
      'justify-center'
    );
  });

  test('renders message text with correct styling', () => {
    render(<LoadingOverlay isLoading={true} message="Custom message" />);
    
    const message = screen.getByText('Custom message');
    expect(message).toHaveClass('mt-4', 'text-gray-700', 'text-center');
  });

  test('renders content container with correct layout', () => {
    render(<LoadingOverlay isLoading={true} />);
    
    const container = screen.getByText('読み込み中...').parentElement;
    expect(container).toHaveClass('flex', 'flex-col', 'items-center');
  });

  test('renders modal container with correct styling', () => {
    render(<LoadingOverlay isLoading={true} />);
    
    const modal = document.querySelector('.bg-white.p-6.rounded-lg');
    expect(modal).toHaveClass(
      'bg-white',
      'p-6',
      'rounded-lg',
      'shadow-xl',
      'max-w-sm',
      'w-full',
      'mx-4'
    );
  });
});