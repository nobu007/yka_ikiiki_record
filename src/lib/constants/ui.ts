// UI Constants for consistent styling and behavior across the application

export const UI_CONSTANTS = {
  // Animation durations
  ANIMATION_DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500
  } as const,

  // Button styles
  BUTTON: {
    BASE: 'inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
    PRIMARY: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400',
    SECONDARY: 'bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400'
  } as const,

  // Loading states
  LOADING: {
    DEFAULT_MESSAGE: '読み込み中...',
    OVERLAY_MESSAGE: 'データを生成中...'
  } as const,

  // Spacing
  SPACING: {
    XS: '1',
    SM: '2',
    MD: '4',
    LG: '6',
    XL: '8'
  } as const,

  // Icon sizes
  ICON_SIZE: {
    XS: 'h-3 w-3',
    SM: 'h-4 w-4',
    MD: 'h-5 w-5',
    LG: 'h-6 w-6',
    XL: 'h-8 w-8'
  } as const,

  // Notification
  NOTIFICATION: {
    AUTO_CLOSE_DURATION: 5000,
    BASE_CLASSES: 'mb-4 p-4 border rounded-lg shadow-sm transition-all duration-300'
  } as const,

  // Error boundary
  ERROR_BOUNDARY: {
    MAX_WIDTH: 'max-w-md',
    PADDING: 'p-6'
  } as const
} as const;

// Common button class combinations
export const getButtonClasses = (variant: 'primary' | 'secondary' = 'primary', isDisabled = false) => {
  const baseClasses = UI_CONSTANTS.BUTTON.BASE;
  const variantClasses = variant === 'primary' ? UI_CONSTANTS.BUTTON.PRIMARY : UI_CONSTANTS.BUTTON.SECONDARY;
  const disabledClasses = isDisabled ? 'disabled:opacity-50 disabled:cursor-not-allowed' : '';
  
  return `${baseClasses} ${variantClasses} ${disabledClasses}`;
};

// Common animation classes
export const getAnimationClasses = (duration: 'fast' | 'normal' | 'slow' = 'normal') => {
  return `transition-all duration-${UI_CONSTANTS.ANIMATION_DURATION[duration.toUpperCase() as keyof typeof UI_CONSTANTS.ANIMATION_DURATION]}`;
};