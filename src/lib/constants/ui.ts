export const UI_CONSTANTS = {
  BREAKPOINT: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
  } as const,

  BUTTON: {
    BASE: "inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed",
    PRIMARY: "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400",
    SECONDARY: "bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400",
  } as const,

  LOADING: {
    DEFAULT_MESSAGE: "読み込み中...",
    OVERLAY_MESSAGE: "データを生成中...",
  } as const,

  SPACING: {
    XS: "1",
    SM: "2",
    MD: "4",
    LG: "6",
    XL: "8",
  } as const,

  ICON_SIZE: {
    XS: "h-3 w-3",
    SM: "h-4 w-4",
    MD: "h-5 w-5",
    LG: "h-6 w-6",
    XL: "h-8 w-8",
  } as const,

  NOTIFICATION: {
    AUTO_CLOSE_DURATION: {
      SUCCESS: 3000,
      ERROR: 5000,
      WARNING: 4000,
      INFO: 3000,
    },
    BASE_CLASSES:
      "mb-4 p-4 border rounded-lg shadow-sm transition-all duration-300",
    STYLES: {
      success: "bg-green-50 border-green-200 text-green-800",
      error: "bg-red-50 border-red-200 text-red-800",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      info: "bg-blue-50 border-blue-200 text-blue-800",
    } as const,
  } as const,

  COLOR: {
    SUCCESS: "text-green-500",
    ERROR: "text-red-500",
    WARNING: "text-yellow-500",
    INFO: "text-blue-500",
    SUCCESS_LIGHT: "text-green-400",
    ERROR_LIGHT: "text-red-400",
    PRIMARY: "text-blue-600",
    SECONDARY: "text-gray-600",
    WHITE: "text-white",
  } as const,

  LOADING_SPINNER: {
    SIZE: {
      SM: "h-4 w-4",
      MD: "h-8 w-8",
      LG: "h-12 w-12",
    } as const,
  } as const,

  ERROR_BOUNDARY: {
    MAX_WIDTH: "max-w-md",
    PADDING: "p-6",
  } as const,

  CHART: {
    HEIGHT: {
      SMALL: 250,
      MEDIUM: 300,
      LARGE: 350,
      XLARGE: 400,
      DEFAULT: 300,
    } as const,
    SPINNER_SIZE: "h-8 w-8",
    HEADING_COLOR: {
      DARK: "text-gray-100",
      LIGHT: "text-gray-900",
    } as const,
  } as const,

  FEEDBACK: {
    DELAY_MS: 1000,
  } as const,
} as const;

export const getButtonClasses = (
  variant: "primary" | "secondary" = "primary",
  isDisabled = false,
) => {
  const baseClasses = UI_CONSTANTS.BUTTON.BASE;
  const variantClasses =
    variant === "primary"
      ? UI_CONSTANTS.BUTTON.PRIMARY
      : UI_CONSTANTS.BUTTON.SECONDARY;
  const disabledClasses = isDisabled
    ? "disabled:opacity-50 disabled:cursor-not-allowed"
    : "";

  return `${baseClasses} ${variantClasses} ${disabledClasses}`;
};

export const getNotificationTimeout = (
  type: "success" | "error" | "warning" | "info",
): number => {
  const timeoutMap: Record<"success" | "error" | "warning" | "info", number> = {
    success: UI_CONSTANTS.NOTIFICATION.AUTO_CLOSE_DURATION.SUCCESS,
    error: UI_CONSTANTS.NOTIFICATION.AUTO_CLOSE_DURATION.ERROR,
    warning: UI_CONSTANTS.NOTIFICATION.AUTO_CLOSE_DURATION.WARNING,
    info: UI_CONSTANTS.NOTIFICATION.AUTO_CLOSE_DURATION.INFO,
  };
  return timeoutMap[type];
};
