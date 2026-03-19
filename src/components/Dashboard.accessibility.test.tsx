import { render, screen } from "@testing-library/react";
import { Dashboard } from "./Dashboard";
import { mockProps } from "./Dashboard.test.setup";

describe("Dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Accessibility", () => {
    it("should have aria-describedby on generate button", () => {
      render(<Dashboard {...mockProps} />);

      const generateButton = screen.getByRole("button", {
        name: /初期データを生成/,
      });
      expect(generateButton).toHaveAttribute(
        "aria-describedby",
        "generate-help",
      );
    });

    it("should have help text with matching id", () => {
      render(<Dashboard {...mockProps} />);

      const helpText = screen.getAllByText(/ボタンをクリック/)[0];
      expect(helpText).toHaveAttribute("id", "generate-help");
    });
  });
});
