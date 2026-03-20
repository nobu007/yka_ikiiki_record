import { memo } from "react";
import { LOADING_MESSAGES } from "@/lib/constants/messages";
import { UI_CONSTANTS } from "@/lib/constants/ui";

/**
 * Supported loading spinner sizes.
 */
type LoadingSize = "sm" | "md" | "lg";

/**
 * Supported loading spinner colors.
 */
type LoadingColor = "primary" | "secondary" | "white";

/**
 * Props for LoadingSpinner component.
 */
interface LoadingSpinnerProps {
  /** Size of the spinner (default: "md") */
  size?: LoadingSize;
  /** Color scheme of the spinner (default: "primary") */
  color?: LoadingColor;
  /** Additional CSS classes to apply */
  className?: string;
  /** Accessibility label for screen readers (default: from LOADING_MESSAGES) */
  label?: string;
}

const SIZE_MAP = {
  sm: UI_CONSTANTS.LOADING_SPINNER.SIZE.SM,
  md: UI_CONSTANTS.LOADING_SPINNER.SIZE.MD,
  lg: UI_CONSTANTS.LOADING_SPINNER.SIZE.LG,
} satisfies Record<LoadingSize, string>;

const COLOR_MAP = {
  primary: UI_CONSTANTS.COLOR.PRIMARY,
  secondary: UI_CONSTANTS.COLOR.SECONDARY,
  white: UI_CONSTANTS.COLOR.WHITE,
} satisfies Record<LoadingColor, string>;

/**
 * A customizable loading spinner component with accessibility support.
 *
 * Renders an animated SVG spinner with proper ARIA attributes for screen readers.
 * The component is memoized for performance and supports multiple sizes and colors.
 *
 * @example
 * ```tsx
 * // Default spinner
 * <LoadingSpinner />
 *
 * // Small white spinner
 * <LoadingSpinner size="sm" color="white" />
 *
 * // Large spinner with custom label
 * <LoadingSpinner size="lg" label="Loading your data..." />
 * ```
 */
export const LoadingSpinner = memo<LoadingSpinnerProps>(
  ({
    size = "md",
    color = "primary",
    className = "",
    label = LOADING_MESSAGES.DEFAULT,
  }) => {
    return (
      <div
        className={`flex justify-center items-center ${className}`}
        role="status"
        aria-label={label}
      >
        <svg
          className={`animate-spin ${SIZE_MAP[size]} ${COLOR_MAP[color]}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="sr-only">{label}</span>
      </div>
    );
  },
);

LoadingSpinner.displayName = "LoadingSpinner";

/**
 * A full-screen overlay modal with a centered loading spinner.
 *
 * This component creates a modal overlay that covers the entire viewport with a
 * semi-transparent backdrop. Displays a loading spinner and optional message in a
 * centered card. Returns null when not loading, rendering nothing in the DOM.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <LoadingOverlay isLoading={true} />
 *
 * // With custom message
 * <LoadingOverlay isLoading={true} message="Generating seed data..." />
 *
 * // Conditional rendering
 * <LoadingOverlay isLoading={isGenerating} message="Processing..." />
 * ```
 */
export const LoadingOverlay = memo<{ isLoading: boolean; message?: string }>(
  ({ isLoading, message = LOADING_MESSAGES.OVERLAY }) => {
    if (!isLoading) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
          <div className="flex flex-col items-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-700 text-center">{message}</p>
          </div>
        </div>
      </div>
    );
  },
);

LoadingOverlay.displayName = "LoadingOverlay";

/**
 * A card component containing a loading spinner and message.
 *
 * This component renders a white card with rounded corners and shadow,
 * containing a centered loading spinner and optional message text.
 * Useful for inline loading states within content areas.
 *
 * @example
 * ```tsx
 * // Default usage
 * <LoadingCard />
 *
 * // With custom message
 * <LoadingCard message="Loading statistics..." />
 *
 * // In a grid or layout
 * <div className="grid grid-cols-2 gap-4">
 *   <DataCard />
 *   <LoadingCard message="Loading..." />
 * </div>
 * ```
 */
export const LoadingCard = memo<{ message?: string }>(
  ({ message = LOADING_MESSAGES.CARD }) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col items-center justify-center py-8">
          <LoadingSpinner size="md" />
          <p className="mt-4 text-gray-600 text-sm">{message}</p>
        </div>
      </div>
    );
  },
);

LoadingCard.displayName = "LoadingCard";
