import { useCallback, memo } from "react";
import { NotificationIcon } from "./Icons";
import { UI_CONSTANTS } from "@/lib/constants/ui";
import { ACCESSIBILITY_MESSAGES } from "@/lib/constants/messages";

type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationProps {
  show: boolean;
  message: string;
  type: NotificationType;
  onClose?: () => void;
}

const NOTIFICATION_STYLES = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

export const Notification = memo<NotificationProps>(
  ({ show, message, type, onClose }) => {
    const handleClose = useCallback(() => {
      onClose?.();
    }, [onClose]);

    if (!show) return null;

    return (
      <div
        className={`${UI_CONSTANTS.NOTIFICATION.BASE_CLASSES} ${NOTIFICATION_STYLES[type]}`}
        role="alert"
        aria-live="polite"
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
