declare global {
  interface Window {
    __TRACE_ID__?: string;
    isSecureContext: boolean;
  }
}

export {};