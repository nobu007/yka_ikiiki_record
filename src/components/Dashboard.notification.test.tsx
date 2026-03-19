import { render, screen } from "@testing-library/react";
import { Dashboard } from "./Dashboard";
import { mockProps } from "./Dashboard.test.setup";

describe("Dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Notification", () => {
    it("should display notification when show is true", () => {
      const notificationProps = {
        ...mockProps,
        notification: {
          show: true,
          message: "Test notification",
          type: "success" as const,
        },
      };

      render(<Dashboard {...notificationProps} />);

      expect(screen.getByText("Test notification")).toBeInTheDocument();
    });

    it("should pass onNotificationClose when provided (line 103)", () => {
      const notificationProps = {
        ...mockProps,
        notification: {
          show: true,
          message: "Test notification",
          type: "success" as const,
        },
        onNotificationClose: jest.fn(),
      };

      render(<Dashboard {...notificationProps} />);

      expect(screen.getByText("Test notification")).toBeInTheDocument();
    });

    it("should not display notification when show is false", () => {
      const notificationProps = {
        ...mockProps,
        notification: {
          show: false,
          message: "Hidden notification",
          type: "info" as const,
        },
      };

      render(<Dashboard {...notificationProps} />);

      expect(screen.queryByText("Hidden notification")).not.toBeInTheDocument();
    });
  });
});
