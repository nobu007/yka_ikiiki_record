import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataSection } from './DataSection';

describe('DataSection', () => {
  const mockOnGenerate = jest.fn();

  beforeEach(() => {
    mockOnGenerate.mockClear();
  });

  test('renders correctly when not generating', () => {
    render(
      <DataSection
        isGenerating={false}
        onGenerate={mockOnGenerate}
      />
    );

    expect(screen.getByText('テストデータ生成')).toBeInTheDocument();
    expect(screen.getByText('ダッシュボードの機能を確認するために、サンプルデータを生成します。')).toBeInTheDocument();
    expect(screen.getByText('テストデータを生成')).toBeInTheDocument();
    expect(screen.getByText('生成されるデータ:')).toBeInTheDocument();
    expect(screen.getByText('30日分の学習データ')).toBeInTheDocument();
    expect(screen.getByText('感情分析サンプル')).toBeInTheDocument();
    expect(screen.getByText('季節要因の考慮')).toBeInTheDocument();
    expect(screen.getByText('イベント影響のシミュレーション')).toBeInTheDocument();
    expect(screen.getByText('ボタンをクリックしてテストデータを生成してください。')).toBeInTheDocument();
  });

  test('renders correctly when generating', () => {
    render(
      <DataSection
        isGenerating={true}
        onGenerate={mockOnGenerate}
      />
    );

    expect(screen.getByText('生成中...')).toBeInTheDocument();
    expect(screen.getByText('データ生成には数秒かかる場合があります。')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('calls onGenerate when button is clicked', () => {
    render(
      <DataSection
        isGenerating={false}
        onGenerate={mockOnGenerate}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnGenerate).toHaveBeenCalledTimes(1);
  });

  test('button is disabled when generating', () => {
    render(
      <DataSection
        isGenerating={true}
        onGenerate={mockOnGenerate}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(mockOnGenerate).not.toHaveBeenCalled();
  });

  test('button has correct accessibility attributes', () => {
    render(
      <DataSection
        isGenerating={false}
        onGenerate={mockOnGenerate}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-describedby', 'generate-help');
  });

  test('help text has correct id', () => {
    render(
      <DataSection
        isGenerating={false}
        onGenerate={mockOnGenerate}
      />
    );

    const helpText = screen.getByText('ボタンをクリックしてテストデータを生成してください。');
    expect(helpText).toHaveAttribute('id', 'generate-help');
  });

  test('renders loading spinner when generating', () => {
    render(
      <DataSection
        isGenerating={true}
        onGenerate={mockOnGenerate}
      />
    );

    // Check for loading spinner (assuming it has a role or test attribute)
    const spinner = document.querySelector('[data-testid="loading-spinner"]') || 
                   document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  test('renders plus icon when not generating', () => {
    render(
      <DataSection
        isGenerating={false}
        onGenerate={mockOnGenerate}
      />
    );

    // Check for the plus icon (SVG element)
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  test('features list has correct structure', () => {
    render(
      <DataSection
        isGenerating={false}
        onGenerate={mockOnGenerate}
      />
    );

    const featuresList = screen.getByText('生成されるデータ:').closest('div');
    expect(featuresList).toHaveClass('bg-white', 'rounded-md', 'p-4', 'mb-6');

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(4);

    listItems.forEach((item) => {
      expect(item).toHaveClass('flex', 'items-center', 'text-sm', 'text-gray-600');
    });
  });

  test('check icons are rendered for features', () => {
    render(
      <DataSection
        isGenerating={false}
        onGenerate={mockOnGenerate}
      />
    );

    const checkIcons = document.querySelectorAll('svg.h-4.w-4.text-green-500');
    expect(checkIcons).toHaveLength(4);
  });

  test('button has correct styling classes', () => {
    render(
      <DataSection
        isGenerating={false}
        onGenerate={mockOnGenerate}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'px-6',
      'py-3',
      'border',
      'border-transparent',
      'text-base',
      'font-medium',
      'rounded-md',
      'text-white',
      'bg-blue-600',
      'hover:bg-blue-700',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'focus:ring-blue-500',
      'transition-all',
      'duration-200',
      'transform',
      'hover:scale-105',
      'active:scale-95',
      'shadow-md',
      'hover:shadow-lg'
    );
  });

  test('section has correct structure and classes', () => {
    render(
      <DataSection
        isGenerating={false}
        onGenerate={mockOnGenerate}
      />
    );

    const section = document.querySelector('section');
    expect(section).toHaveClass('bg-gray-50', 'rounded-lg', 'p-6');
  });

  test('title has correct styling', () => {
    render(
      <DataSection
        isGenerating={false}
        onGenerate={mockOnGenerate}
      />
    );

    const title = screen.getByText('テストデータ生成');
    expect(title).toHaveClass('text-xl', 'font-semibold', 'text-gray-900', 'mb-3');
  });

  test('description has correct styling', () => {
    render(
      <DataSection
        isGenerating={false}
        onGenerate={mockOnGenerate}
      />
    );

    const description = screen.getByText('ダッシュボードの機能を確認するために、サンプルデータを生成します。');
    expect(description).toHaveClass('text-gray-600', 'mb-4', 'leading-relaxed');
  });
});