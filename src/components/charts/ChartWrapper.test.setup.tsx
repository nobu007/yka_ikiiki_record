/**
 * ChartWrapper Test Setup
 *
 * Shared mocks, helpers, and fixtures for ChartWrapper tests
 */

import { render, screen } from "@testing-library/react";
import ChartWrapper from "./ChartWrapper";

// Mock children for testing
export const mockChildren = <div data-testid="chart-content">Test Chart</div>;

// Helper function to render ChartWrapper with default props
export function renderChartWrapper(props = {}) {
  const defaultProps = {
    children: mockChildren,
  };

  return render(<ChartWrapper {...defaultProps} {...props} />);
}

// Helper to create a test error
export function createTestError(message: string = "Test error message"): Error {
  return new Error(message);
}

// Re-export testing library utilities for convenience
export { render, screen };
export default ChartWrapper;
