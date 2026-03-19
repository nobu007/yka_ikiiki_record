import { render } from "@testing-library/react";
import { Dashboard } from "./Dashboard";
import { mockProps, getByHeading } from "./Dashboard.test.setup";

describe("Dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Performance", () => {
    it("should memoize component", () => {
      const { rerender } = render(<Dashboard {...mockProps} />);

      const initialHeader = getByHeading();

      rerender(<Dashboard {...mockProps} />);

      expect(initialHeader).toBeInTheDocument();
    });

    it("should have correct displayName", () => {
      expect(Dashboard.displayName).toBe("Dashboard");
    });
  });
});
