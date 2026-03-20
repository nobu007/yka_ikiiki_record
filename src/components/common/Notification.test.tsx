import { render, screen } from "@testing-library/react";
import { Notification } from "./Notification";

describe("Notification", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering behavior", () => {
    it("should not render when show is false", () => {
      const { container } = render(
        <Notification
          show={false}
          message="Test message"
          type="info"
          onClose={mockOnClose}
        />,
      );

      expect(container.firstChild).toBeNull();
    });

    it("should render when show is true", () => {
      render(
        <Notification
          show={true}
          message="Test message"
          type="info"
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText("Test message")).toBeInTheDocument();
    });

    it("should render with correct message", () => {
      render(
        <Notification
          show={true}
          message="This is a test notification"
          type="success"
        />,
      );

      expect(
        screen.getByText("This is a test notification"),
      ).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should have role alert", () => {
      const { container } = render(
        <Notification show={true} message="Test" type="info" />,
      );

      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });

    it("should have aria-live polite", () => {
      const { container } = render(
        <Notification show={true} message="Test" type="info" />,
      );

      const alert = container.querySelector('[aria-live="polite"]');
      expect(alert).toBeInTheDocument();
    });
  });

  describe("close button", () => {
    it("should render close button when onClose is provided", () => {
      render(
        <Notification
          show={true}
          message="Test message"
          type="info"
          onClose={mockOnClose}
        />,
      );

      const closeButton = screen.getByText("閉じる");
      expect(closeButton).toBeInTheDocument();
    });

    it("should not render close button when onClose is not provided", () => {
      render(<Notification show={true} message="Test message" type="info" />);

      const closeButton = screen.queryByText("閉じる");
      expect(closeButton).not.toBeInTheDocument();
    });

    it("should call onClose when close button is clicked", () => {
      render(
        <Notification
          show={true}
          message="Test message"
          type="info"
          onClose={mockOnClose}
        />,
      );

      const closeButton = screen.getByText("閉じる");
      closeButton.click();

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should have correct aria-label on close button", () => {
      const { container } = render(
        <Notification
          show={true}
          message="Test message"
          type="info"
          onClose={mockOnClose}
        />,
      );

      const closeButton = container.querySelector(
        'button[aria-label="通知を閉じる"]',
      );
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe("notification types", () => {
    it("should render success notification", () => {
      const { container } = render(
        <Notification show={true} message="Success message" type="success" />,
      );

      const notification = container.firstChild as HTMLElement;
      expect(notification).toHaveClass("p-4 rounded-lg border shadow-sm");
      expect(notification).toHaveClass(
        "bg-green-50 border-green-200 text-green-800",
      );
    });

    it("should render error notification", () => {
      const { container } = render(
        <Notification show={true} message="Error message" type="error" />,
      );

      const notification = container.firstChild as HTMLElement;
      expect(notification).toBeInTheDocument();
    });

    it("should render warning notification", () => {
      const { container } = render(
        <Notification show={true} message="Warning message" type="warning" />,
      );

      const notification = container.firstChild as HTMLElement;
      expect(notification).toBeInTheDocument();
    });

    it("should render info notification", () => {
      const { container } = render(
        <Notification show={true} message="Info message" type="info" />,
      );

      const notification = container.firstChild as HTMLElement;
      expect(notification).toBeInTheDocument();
    });
  });

  describe("memoization", () => {
    it("should have displayName", () => {
      expect(Notification.displayName).toBe("Notification");
    });
  });

  describe("edge cases", () => {
    it("should handle empty message gracefully", () => {
      const { container } = render(
        <Notification show={true} message="" type="info" />,
      );

      const messageElement = container.querySelector('p[class*="break-words"]');
      expect(messageElement).toBeInTheDocument();
      expect(messageElement).toHaveTextContent("");
    });

    it("should handle long message with word break", () => {
      const longMessage =
        "This is a very long notification message that should wrap to multiple lines and break words appropriately to maintain readability";

      render(<Notification show={true} message={longMessage} type="info" />);

      const messageElement = screen.getByText(longMessage);
      expect(messageElement).toHaveClass("break-words");
    });

    it("should not call onClose when not provided and close button area is clicked", () => {
      const { container } = render(
        <Notification show={true} message="Test message" type="info" />,
      );

      const notificationContainer = container.firstChild as HTMLElement;
      if (notificationContainer) {
        notificationContainer.click();
      }

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
