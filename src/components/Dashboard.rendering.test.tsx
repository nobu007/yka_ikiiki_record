import { render, screen } from '@testing-library/react';
import { renderDashboard, getByHeading, getByButton, mockProps } from './Dashboard.test.setup';
import { Dashboard } from './Dashboard';

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dashboard header', () => {
      renderDashboard();

      const header = getByHeading();
      expect(header).toBeInTheDocument();
    });

    it('should render generate button', () => {
      renderDashboard();

      const button = getByButton();
      expect(button).toBeInTheDocument();
    });

    it('should show loading state when generating', () => {
      const generatingProps = { ...mockProps, isGenerating: true };
      render(<Dashboard {...generatingProps} />);

      const button = getByButton();
      expect(button).toBeDisabled();
    });

    it('should render features list', () => {
      renderDashboard();

      expect(screen.getByText(/生成されるデータ/)).toBeInTheDocument();
    });
  });
});
