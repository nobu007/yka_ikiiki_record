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

export const Notification = memo<NotificationProps>(
  ({ show, message, type, onClose }) => {
    const handleClose = useCallback(() => {
      onClose?.();
    }, [onClose]);

    if (!show) return null;

    return (
      <div
        className={`${UI_CONSTANTS.NOTIFICATION.BASE_CLASSES} ${UI_CONSTANTS.NOTIFICATION.STYLES[type]}`}
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
