import { useState, useCallback, useRef, useEffect } from "react";
import { getNotificationTimeout } from "@/lib/constants/ui";

/**
 * State object for notification display
 */
export interface NotificationState {
  /** Whether the notification is currently visible */
  show: boolean;
  /** The notification message to display */
  message: string;
  /** The type of notification, affecting styling and behavior */
  type: "success" | "error" | "warning" | "info";
}

/**
 * Return type for useNotification hook
 */
export interface UseNotificationResult {
  /** Current notification state */
  notification: NotificationState;
  /** Show a success notification (green) */
  showSuccess: (message: string, autoClose?: boolean) => void;
  /** Show an error notification (red) */
  showError: (message: string, autoClose?: boolean) => void;
  /** Show a warning notification (yellow) */
  showWarning: (message: string, autoClose?: boolean) => void;
  /** Show an info notification (blue) */
  showInfo: (message: string, autoClose?: boolean) => void;
  /** Hide the current notification */
  clearNotification: () => void;
  /** Alias for clearNotification */
  hideNotification: () => void;
}

/**
 * React hook for managing toast/snackbar notifications.
 *
 * Provides a complete notification system with automatic timeout-based dismissal,
 * multiple notification types (success, error, warning, info), and manual control.
 *
 * @returns {UseNotificationResult} Object containing notification state and control functions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { notification, showSuccess, showError, clearNotification } = useNotification();
 *
 *   const handleAction = async () => {
 *     try {
 *       await performAction();
 *       showSuccess('Action completed successfully');
 *     } catch (error) {
 *       showError('Action failed. Please try again.');
 *     }
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={handleAction}>Perform Action</button>
 *       {notification.show && (
 *         <NotificationBanner
 *           type={notification.type}
 *           message={notification.message}
 *           onClose={clearNotification}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 */
export function useNotification(): UseNotificationResult {
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: "",
    type: "success",
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  const clearNotification = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setNotification((prev) => ({ ...prev, show: false }));
  }, []);

  const showNotification = useCallback(
    (
      message: string,
      type: NotificationState["type"],
      autoClose: boolean = true,
    ) => {
      clearNotification();
      setNotification({ show: true, message, type });

      if (autoClose) {
        timeoutRef.current = setTimeout(() => {
          setNotification((prev) => ({ ...prev, show: false }));
        }, getNotificationTimeout(type));
      }
    },
    [clearNotification],
  );

  const showSuccess = useCallback(
    (message: string, autoClose = true) => {
      showNotification(message, "success", autoClose);
    },
    [showNotification],
  );

  const showError = useCallback(
    (message: string, autoClose = true) => {
      showNotification(message, "error", autoClose);
    },
    [showNotification],
  );

  const showWarning = useCallback(
    (message: string, autoClose = true) => {
      showNotification(message, "warning", autoClose);
    },
    [showNotification],
  );

  const showInfo = useCallback(
    (message: string, autoClose = true) => {
      showNotification(message, "info", autoClose);
    },
    [showNotification],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    notification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearNotification,
    hideNotification: clearNotification,
  };
}
