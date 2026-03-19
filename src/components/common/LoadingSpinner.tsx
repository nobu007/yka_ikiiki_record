import { memo } from "react";
import { LOADING_MESSAGES } from "@/lib/constants/messages";

type LoadingSize = "sm" | "md" | "lg";
type LoadingColor = "primary" | "secondary" | "white";

interface LoadingSpinnerProps {
  size?: LoadingSize;
  color?: LoadingColor;
  className?: string;
  label?: string;
}

const SIZE_CLASSES = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
} satisfies Record<LoadingSize, string>;

const COLOR_CLASSES = {
  primary: "text-blue-600",
  secondary: "text-gray-600",
  white: "text-white",
} satisfies Record<LoadingColor, string>;

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
          className={`animate-spin ${SIZE_CLASSES[size]} ${COLOR_CLASSES[color]}`}
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
 * ローディングオーバーレイコンポーネント
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
 * ローディングカードコンポーネント
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
