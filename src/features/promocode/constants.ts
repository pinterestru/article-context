// Promocode feature constants - CLIENT-SAFE
export const PROMOCODE_CONFIG = {
  // Cache duration for promocode data (1 hour)
  CACHE_DURATION: 3600,
  
  // API timeout for promocode fetching
  API_TIMEOUT: 10000,
  
  // Maximum time allowed between click and promocode fetch (50 seconds)
  MAX_FETCH_DELAY: 20000,
  
  // Copy feedback duration
  COPY_FEEDBACK_DURATION: 2000,
  
  // Dialog close delay after action
  DIALOG_CLOSE_DELAY: 500,
  
  // Maximum description length before truncation
  MAX_DESCRIPTION_LENGTH: 400,
  
  // Analytics configuration
  ANALYTICS: {
    TRACK_COPY: true,
    TRACK_CLICK: true,
    TRACK_VIEW: true,
    TRACK_ERRORS: true,
  },
  
  // Performance optimization
  PERFORMANCE: {
    ICON_LAZY_LOAD: true,
    CARD_LAZY_LOAD: true,
    PREFETCH_ON_HOVER: false,
  },
} as const;

// Type-safe feature flags
export const FEATURE_FLAGS = {
  USE_SERVER_COMPONENTS: true,
  USE_OPTIMISTIC_UPDATES: true,
  USE_REACT_19_FEATURES: true,
} as const;