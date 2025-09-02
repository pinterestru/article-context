/**
 * Types for the client-side fingerprinting system
 */

/**
 * Display-related fingerprint data
 */
export interface DisplayData {
  screenWidth: number;
  screenHeight: number;
  screenAvailWidth: number;
  screenAvailHeight: number;
  colorDepth: number;
  pixelRatio: number;
  viewportWidth: number;
  viewportHeight: number;
}

/**
 * Browser-related fingerprint data
 */
export interface BrowserData {
  userAgent: string;
  language: string;
  languages: string[];
  platform: string;
  vendor: string;
  cookiesEnabled: boolean;
  doNotTrack: string | null;
}

/**
 * Timezone-related fingerprint data
 */
export interface TimezoneData {
  offset: number;
  timezone: string;
  locale: string;
}

/**
 * Hardware-related fingerprint data
 */
export interface HardwareData {
  cpuCores: number;
  deviceMemory: number | null;
  touchSupport: boolean;
  maxTouchPoints: number;
}

/**
 * Storage and capability fingerprint data
 */
export interface CapabilityData {
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  serviceWorker: boolean;
  webGL: boolean;
  mediaDevices: boolean;
  geolocation: boolean;
}

/**
 * Complete fingerprint data structure
 */
export interface FingerprintData {
  display: DisplayData;
  browser: BrowserData;
  timezone: TimezoneData;
  hardware: HardwareData;
  capabilities: CapabilityData;
  timestamp: number;
}

/**
 * Stability information for fingerprint fields
 */
export interface FingerprintStability {
  score: number; // 0-100, where 100 is most stable
  volatileFields: string[];
  stableFields: string[];
}

/**
 * Performance metrics for fingerprint collection
 */
export interface FingerprintPerformanceMetrics {
  collectionTime: number;
  marks?: {
    start: number;
    end: number;
    displayCollection?: number;
    browserCollection?: number;
    timezoneCollection?: number;
    hardwareCollection?: number;
    capabilityCollection?: number;
    hashGeneration?: number;
  };
}

/**
 * Result of fingerprint collection including hash and user ID
 */
export interface FingerprintResult {
  fingerprint: FingerprintData;
  hash: string;
  userId: string;
  collectionTime: number; // Time taken to collect fingerprint in ms
  stability?: FingerprintStability;
  performance?: FingerprintPerformanceMetrics;
}

/**
 * Error types for fingerprinting
 */
export interface FingerprintError extends Error {
  code: 'COLLECTION_FAILED' | 'HASH_FAILED' | 'STORAGE_FAILED' | 'TIMEOUT';
  details?: unknown;
}