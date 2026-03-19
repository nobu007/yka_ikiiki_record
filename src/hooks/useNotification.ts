import { useState, useCallback, useRef, useEffect } from "react";
import { UI_CONSTANTS } from "@/lib/constants";

interface NotificationState {
  show: boolean;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

export function useNotification() {
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
        const timeoutKey = type.toUpperCase() as keyof typeof UI_CONSTANTS.NOTIFICATION.AUTO_CLOSE_DURATION;
        timeoutRef.current = setTimeout(() => {
          setNotification((prev) => ({ ...prev, show: false }));
        }, UI_CONSTANTS.NOTIFICATION.AUTO_CLOSE_DURATION[timeoutKey]);
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
