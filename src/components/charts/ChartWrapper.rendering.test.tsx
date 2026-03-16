/**
 * ChartWrapper Rendering and Dark Mode Tests
 *
 * Tests normal rendering state, title handling, dark mode, and height customization
 * INV-TEST-001
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ChartWrapper from './ChartWrapper';
import { mockChildren } from './ChartWrapper.test.setup';

describe('ChartWrapper Normal Rendering State (INV-TEST-001)', () => {
  it('should render children when not loading and no error', () => {
    render(
      <ChartWrapper isLoading={false} error={null}>
        {mockChildren}
      </ChartWrapper>
    );

    expect(screen.getByTestId('chart-content')).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: 'グラフローディング中' })).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should render title when provided', () => {
    render(
      <ChartWrapper title="Test Chart Title">
        {mockChildren}
      </ChartWrapper>
    );

    expect(screen.getByText('Test Chart Title')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Test Chart Title' })).toBeInTheDocument();
  });

  it('should not render title when not provided', () => {
    render(
      <ChartWrapper>
        {mockChildren}
      </ChartWrapper>
    );

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: '統計グラフ' })).toBeInTheDocument();
  });

  it('should render empty title as empty string', () => {
    render(
      <ChartWrapper title="">
        {mockChildren}
      </ChartWrapper>
    );

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('should sanitize title in chartId', () => {
    render(
      <ChartWrapper title="Test Chart With Spaces">
        {mockChildren}
      </ChartWrapper>
    );

    expect(screen.getByRole('region', { name: 'Test Chart With Spaces' })).toBeInTheDocument();
  });

  it('should use default aria-label when title is not provided', () => {
    render(
      <ChartWrapper>
        {mockChildren}
      </ChartWrapper>
    );

    expect(screen.getByRole('region', { name: '統計グラフ' })).toBeInTheDocument();
  });
});

describe('ChartWrapper Dark Mode (INV-TEST-001)', () => {
  it('should apply dark mode styles when isDark is true', () => {
    const { container: _container } = render(
      <ChartWrapper isDark={true} title="Test Title">
        {mockChildren}
      </ChartWrapper>
    );

    const heading = screen.getByText('Test Title');
    expect(heading).toHaveClass('text-gray-100');
  });

  it('should apply light mode styles when isDark is false', () => {
    const { container: _container } = render(
      <ChartWrapper isDark={false} title="Test Title">
        {mockChildren}
      </ChartWrapper>
    );

    const heading = screen.getByText('Test Title');
    expect(heading).toHaveClass('text-gray-900');
  });

  it('should default to light mode when isDark is not provided', () => {
    const { container: _container } = render(
      <ChartWrapper title="Test Title">
        {mockChildren}
      </ChartWrapper>
    );

    const heading = screen.getByText('Test Title');
    expect(heading).toHaveClass('text-gray-900');
  });
});

describe('ChartWrapper Height Customization (INV-TEST-001)', () => {
  it('should apply custom height when provided', () => {
    const { container } = render(
      <ChartWrapper height={500}>
        {mockChildren}
      </ChartWrapper>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.height).toBe('500px');
  });

  it('should use default height when not provided', () => {
    const { container } = render(
      <ChartWrapper>
        {mockChildren}
      </ChartWrapper>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.height).toBe('300px');
  });
});
