import { render, screen, fireEvent } from '@testing-library/react';
import { DataSection } from './DataSection';

describe('DataSection', () => {
  const defaultProps = {
    isGenerating: false,
    onGenerate: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the section title and description', () => {
    render(<DataSection {...defaultProps} />);
    
    expect(screen.getByText('テストデータ生成')).toBeInTheDocument();
    expect(screen.getByText(/ダッシュボードの機能を確認するために/)).toBeInTheDocument();
  });

  it('displays all features in the feature list', () => {
    render(<DataSection {...defaultProps} />);
    
    expect(screen.getByText('30日分の学習データ')).toBeInTheDocument();
    expect(screen.getByText('感情分析サンプル')).toBeInTheDocument();
    expect(screen.getByText('季節要因の考慮')).toBeInTheDocument();
    expect(screen.getByText('イベント影響のシミュレーション')).toBeInTheDocument();
  });

  it('shows generate button when not generating', () => {
    render(<DataSection {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: 'テストデータを生成' });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('shows loading state when generating', () => {
    render(<DataSection {...defaultProps} isGenerating={true} />);
    
    const button = screen.getByRole('button', { name: /生成中/ });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('calls onGenerate when button is clicked', () => {
    render(<DataSection {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: 'テストデータを生成' });
    fireEvent.click(button);
    
    expect(defaultProps.onGenerate).toHaveBeenCalledTimes(1);
  });

  it('displays appropriate help text based on generation state', () => {
    const { rerender } = render(<DataSection {...defaultProps} />);
    
    expect(screen.getByText('ボタンをクリックしてテストデータを生成してください。')).toBeInTheDocument();
    
    rerender(<DataSection {...defaultProps} isGenerating={true} />);
    expect(screen.getByText('データ生成には数秒かかる場合があります。')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<DataSection {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: 'テストデータを生成' });
    expect(button).toHaveAttribute('aria-describedby', 'generate-help');
    
    const helpText = screen.getByText('ボタンをクリックしてテストデータを生成してください。');
    expect(helpText).toHaveAttribute('id', 'generate-help');
  });
});