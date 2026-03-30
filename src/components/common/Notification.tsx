import { useCallback, memo } from "react";
import { NotificationIcon } from "./Icons";
import { UI_CONSTANTS } from "@/lib/constants/ui";
import { ACCESSIBILITY_MESSAGES } from "@/lib/constants/messages";

/**
 * Notification type variants with corresponding visual styles.
 */
type NotificationType = "success" | "error" | "warning" | "info";

/**
 * Props for Notification component.
 */
interface NotificationProps {
  /** Whether to display the notification */
  show: boolean;
  /** Message content to display */
  message: string;
  /** Type of notification determining icon and styling */
  type: NotificationType;
  /** Optional callback when close button is clicked */
  onClose?: () => void;
}

/**
 * A notification banner component for displaying success, error, warning, or info messages.
 *
 * Renders an alert banner with appropriate icon, styling, and optional close button.
 * The component uses ARIA live regions for accessibility and returns null when hidden,
 * preventing DOM clutter when not in use.
 *
 * **Features:**
 * - Four notification types with distinct visual styling
 * - Accessible with proper ARIA attributes (role="alert", aria-live="polite")
 * - Optional close button with keyboard navigation support
 * - Memoized for performance optimization
 *
 * @example
 * ```tsx
 * // Success notification
 * <Notification
 *   show={true}
 *   message="Data saved successfully!"
 *   type="success"
 *   onClose={() => setShowNotification(false)}
 * />
 *
 * // Error notification
 * <Notification
 *   show={hasError}
 *   message="Failed to load data. Please try again."
 *   type="error"
 * />
 *
 * // Warning notification
 * <Notification
 *   show={showWarning}
 *   message="Changes will be lost if you continue."
 *   type="warning"
 *   onClose={handleWarningClose}
 * />
 * ```
 */
export const Notification = memo<NotificationProps>(
  ({ show, message, type, onClose }) => {
    const handleClose = useCallback(() => {
      onClose?.();
    }, [onClose]);

    if (!show) return null;

    // Diagnostic logging for E2E test debugging (ISS-003 / PR-003)
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
      console.log(`[NOTIFICATION] Displaying ${type} notification: "${message}"`);
    }

    return (
      <div
        className={`${UI_CONSTANTS.NOTIFICATION.BASE_CLASSES} ${UI_CONSTANTS.NOTIFICATION.STYLES[type]}`}
        role="alert"
        aria-live="polite"
        data-testid="notification-banner"
        data-notification-type={type}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start flex-1">
            <NotificationIcon type={type} />
            <p className="text-sm font-medium break-words">{message}</p>
          </div>

          {onClose && (
            <button
              onClick={handleClose}
              className="ml-4 text-sm underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
              aria-label={ACCESSIBILITY_MESSAGES.CLOSE_NOTIFICATION}
              type="button"
            >
              {ACCESSIBILITY_MESSAGES.CLOSE_BUTTON}
            </button>
          )}
        </div>
      </div>
    );
  },
);

Notification.displayName = "Notification";
