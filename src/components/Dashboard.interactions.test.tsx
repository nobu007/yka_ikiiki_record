import { render } from "@testing-library/react";
import { Dashboard } from "./Dashboard";
import { mockProps, getByButton } from "./Dashboard.test.setup";

describe("Dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("User Interactions", () => {
    it("should call onGenerate when button is clicked", () => {
      render(<Dashboard {...mockProps} />);

      const button = getByButton();
      button.click();

      expect(mockProps.onGenerate).toHaveBeenCalledTimes(1);
    });

    it("should not call onGenerate when button is disabled", () => {
      const generatingProps = { ...mockProps, isGenerating: true };
      render(<Dashboard {...generatingProps} />);

      const button = getByButton();
      button.click();

      expect(mockProps.onGenerate).not.toHaveBeenCalled();
    });
  });
});
