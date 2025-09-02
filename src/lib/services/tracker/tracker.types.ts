/**
 * Client metadata for tracking requests
 */
export interface ClientMeta {
  ip: string;
  user_agent: string;
  domain: string;
  url: string;
  mtfi?: string;
  created_at: string;
  headers: string;
}

/**
 * Options for tracking requests
 */
export interface TrackingOptions {
  mtfi?: string;
  createdAt?: string | null;
  jsMeta?: Record<string, unknown> | string; // Fingerprint data as object or string
  clientMeta: ClientMeta;
  withFlow?: boolean;
}

/**
 * Response from tracking API
 */
export interface TrackingResponse {
  ok?: boolean;
  mtfi?: string;
  content_is_target?: string; // "true" or "false" as string
  content_type?: string;
  message?: string;
  status?: number;
}

/**
 * Response from marketing process API
 */
export interface MarketingProcessResponse extends TrackingResponse {
  type?: string; // 'redirect' or other types
  url?: string; // redirect URL if type is 'redirect'
}

/**
 * Event type mapping from legacy system
 */
export const EVENT_TYPE_MAPPING: Record<string, string> = {
  'localization_init': 'visit',
  'localization_check': 'view_page',
  'page_info': 'view_page',
  'check': 'view_page',
  'localization_interval': 'complete_activity',
  'interval': 'complete_activity'
};

/**
 * Track type mapping from legacy system
 */
export const TRACK_TYPE_MAPPING: Record<string, string> = {
  'interval': 'session_time',
  'localization_entry': 'view_page_entry',
  'entry': 'view_page_entry',
  'localization_navigated': 'view_page_navigated',
  'navigated': 'view_page_navigated'
};

/**
 * Tracker API service interface
 */
export interface ITrackerApiService {
  /**
   * Track a general event
   */
  trackEvent(
    eventType: string,
    trackType?: string,
    trackValue?: string,
    options?: Partial<TrackingOptions>
  ): Promise<TrackingResponse>;

  /**
   * Track initial visit/session
   */
  trackVisit(
    jsMeta: Record<string, unknown> | string,
    options?: Partial<TrackingOptions>
  ): Promise<TrackingResponse>;

  /**
   * Process marketing redirects
   */
  marketingProcess(
    tag: string,
    slug?: string,
    query?: Record<string, string>,
    options?: Partial<TrackingOptions>
  ): Promise<MarketingProcessResponse>;
}

/**
 * Error class for tracker API errors
 */
export class TrackerAPIError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'TrackerAPIError';
  }
}