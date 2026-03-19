/**
 * ChartWrapper Children Rendering Tests
 *
 * Tests children rendering behavior and memoization
 * INV-TEST-001
 */

import { render, screen } from "@testing-library/react";
import ChartWrapper from "./ChartWrapper";
import { mockChildren } from "./ChartWrapper.test.setup";

describe("ChartWrapper Children Rendering (INV-TEST-001)", () => {
  it("should render multiple children", () => {
    render(
      <ChartWrapper>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </ChartWrapper>,
    );

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
  });

  it("should render children in overflow-x-auto container", () => {
    const { container } = render(<ChartWrapper>{mockChildren}</ChartWrapper>);

    const overflowContainer = container.querySelector(".overflow-x-auto");
    expect(overflowContainer).toBeInTheDocument();
  });
});

describe("ChartWrapper Memoization (INV-TEST-001)", () => {
  it("should have displayName for debugging", () => {
    expect(ChartWrapper.displayName).toBe("ChartWrapper");
  });
});
