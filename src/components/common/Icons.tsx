import { memo } from "react";
import { UI_CONSTANTS } from "@/lib/constants/ui";

/**
 * Notification type variants for icon selection.
 */
type NotificationType = "success" | "error" | "warning" | "info";

/**
 * Common props for all icon components.
 */
interface IconProps {
  /** Additional CSS classes to apply */
  className?: string;
  /** Whether to hide from screen readers (default: true) */
  ariaHidden?: boolean;
}

/**
 * A checkmark icon for success states and completion indicators.
 *
 * Displays a green circle with a checkmark, commonly used for:
 * - Completed items in lists
 * - Success indicators
 * - Confirmation dialogs
 *
 * @example
 * ```tsx
 * <CheckIcon />
 * <CheckIcon className="h-6 w-6" />
 * <CheckIcon ariaHidden={false} />
 * ```
 */
export const CheckIcon = memo<IconProps>(
  ({ className = "", ariaHidden = true }) => (
    <svg
      className={`h-4 w-4 ${UI_CONSTANTS.COLOR.SUCCESS} mr-2 flex-shrink-0 ${className}`}
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden={ariaHidden}
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
);
CheckIcon.displayName = "CheckIcon";

/**
 * A plus icon for adding new items or expand actions.
 *
 * Displays a simple plus sign in a circle, commonly used for:
 * - Add buttons
 * - Create new item actions
 * - Expand/collapse controls
 *
 * @example
 * ```tsx
 * <PlusIcon />
 * <PlusIcon className="h-4 w-4" />
 * ```
 */
export const PlusIcon = memo<IconProps>(
  ({ className = "", ariaHidden = true }) => (
    <svg
      className={`h-5 w-5 mr-2 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden={ariaHidden}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      />
    </svg>
  ),
);
PlusIcon.displayName = "PlusIcon";

/**
 * An exclamation mark icon for warnings and errors.
 *
 * Displays a triangle with exclamation mark, commonly used for:
 * - Error messages
 * - Warning alerts
 * - Error boundaries
 *
 * @example
 * ```tsx
 * <ExclamationIcon />
 * <ExclamationIcon className="text-red-500" />
 * ```
 */
export const ExclamationIcon = memo<IconProps>(
  ({ className = "", ariaHidden = true }) => (
    <svg
      className={`h-6 w-6 ${UI_CONSTANTS.COLOR.ERROR_LIGHT} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden={ariaHidden}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
);
ExclamationIcon.displayName = "ExclamationIcon";

/**
 * Props for NotificationIcon component.
 */
interface NotificationIconProps extends IconProps {
  /** Type of notification determining which icon and color to display */
  type: NotificationType;
}

/**
 * SVG path data for each notification type.
 */
const NOTIFICATION_ICONS = {
  success:
    "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
  error:
    "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
  warning:
    "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z",
  info: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z",
} satisfies Record<NotificationType, string>;

/**
 * Color mapping for each notification type.
 */
const NOTIFICATION_COLORS = {
  success: UI_CONSTANTS.COLOR.SUCCESS,
  error: UI_CONSTANTS.COLOR.ERROR,
  warning: UI_CONSTANTS.COLOR.WARNING,
  info: UI_CONSTANTS.COLOR.INFO,
} satisfies Record<NotificationType, string>;

/**
 * A dynamic notification icon that displays different icons based on notification type.
 *
 * This component renders the appropriate icon and color for each notification type:
 * - Success: Green checkmark
 * - Error: Red X mark
 * - Warning: Yellow triangle
 * - Info: Blue circle with 'i'
 *
 * Used in conjunction with the Notification component to provide visual
 * context for different message types.
 *
 * @example
 * ```tsx
 * <NotificationIcon type="success" />
 * <NotificationIcon type="error" />
 * <NotificationIcon type="warning" />
 * <NotificationIcon type="info" />
 * ```
 */
export const NotificationIcon = memo<NotificationIconProps>(
  ({ type, className = "", ariaHidden = true }) => (
    <svg
      className={`h-5 w-5 mr-3 flex-shrink-0 ${NOTIFICATION_COLORS[type]} ${className}`}
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden={ariaHidden}
    >
      <path
        fillRule="evenodd"
        d={NOTIFICATION_ICONS[type]}
        clipRule="evenodd"
      />
    </svg>
  ),
);
NotificationIcon.displayName = "NotificationIcon";

/**
 * A download icon for exporting and downloading content.
 *
 * Displays a downward arrow with a horizontal bar, commonly used for:
 * - Export buttons
 * - Download actions
 * - File download indicators
 *
 * @example
 * ```tsx
 * <DownloadIcon />
 * <DownloadIcon className="h-4 w-4" />
 * ```
 */
export const DownloadIcon = memo<IconProps>(
  ({ className = "", ariaHidden = true }) => (
    <svg
      className={`h-4 w-4 mr-2 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden={ariaHidden}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  ),
);
DownloadIcon.displayName = "DownloadIcon";
