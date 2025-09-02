# Safe Browser Fingerprinting Guide

## Overview

This document outlines browser fingerprinting techniques using only parameters commonly collected by legitimate analytics services (Yandex Metrica, Google Analytics, etc.). These parameters are considered "safe" because they're routinely collected by mainstream websites and won't trigger suspicion.

## Safe Parameters Reference

### 1. Display & Visual Parameters

These are the most commonly collected parameters by every analytics service:

```javascript
const displayParams = {
  // Screen dimensions - Collected by 100% of analytics tools
  screenWidth: screen.width,                    // e.g., 1920
  screenHeight: screen.height,                  // e.g., 1080
  screenAvailWidth: screen.availWidth,          // e.g., 1920
  screenAvailHeight: screen.availHeight,        // e.g., 1040 (minus taskbar)
  
  // Color and pixel density - Standard metrics
  colorDepth: screen.colorDepth,                // Usually 24
  pixelDepth: screen.pixelDepth,                // Usually 24
  devicePixelRatio: window.devicePixelRatio,    // e.g., 1, 1.5, 2
  
  // Viewport dimensions - Essential for responsive design
  viewportWidth: window.innerWidth,             // Current window width
  viewportHeight: window.innerHeight,           // Current window height
  
  // Browser chrome size (indirect)
  outerWidth: window.outerWidth,                // Browser window width
  outerHeight: window.outerHeight               // Browser window height
};
```

**Why Safe**: Every website with responsive design uses these. Yandex Metrica collects all of these by default.

### 2. Browser & System Information

Standard navigator properties that all analytics collect:

```javascript
const browserParams = {
  // User Agent - Universal collection
  userAgent: navigator.userAgent,
  
  // Language settings - Used for localization
  language: navigator.language,                  // Primary language
  languages: navigator.languages,                // Language preference list
  
  // Platform information - Basic OS detection
  platform: navigator.platform,                  // e.g., "Win32", "MacIntel"
  vendor: navigator.vendor,                      // Browser vendor
  
  // Cookie support - Essential for any website
  cookieEnabled: navigator.cookieEnabled,
  
  // Do Not Track - Privacy preference
  doNotTrack: navigator.doNotTrack,
  
  // Online status
  onLine: navigator.onLine
};
```

**Why Safe**: These are HTTP header equivalents exposed to JavaScript. Every analytics tool collects these.

### 3. Timezone & Locale Information

Time-related parameters used by all analytics for geographic insights:

```javascript
const timezoneParams = {
  // Timezone offset - Used for scheduling/analytics
  timezoneOffset: new Date().getTimezoneOffset(),     // Minutes from UTC
  
  // IANA timezone - Modern timezone identification
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,  // e.g., "Europe/Moscow"
  
  // Locale information
  locale: Intl.DateTimeFormat().resolvedOptions().locale,      // e.g., "ru-RU"
  
  // Calendar and numbering system
  calendar: Intl.DateTimeFormat().resolvedOptions().calendar,
  numberingSystem: Intl.DateTimeFormat().resolvedOptions().numberingSystem,
  
  // Time string (contains timezone abbreviation)
  timeString: new Date().toString()
};
```

**Why Safe**: Required for proper time display and analytics geographic segmentation.

### 4. Performance & Hardware Basics

Modern analytics tools collect these for performance monitoring:

```javascript
const hardwareParams = {
  // CPU cores - Performance monitoring
  hardwareConcurrency: navigator.hardwareConcurrency || 0,
  
  // Device memory (Chrome/Edge only)
  deviceMemory: navigator.deviceMemory || 0,
  
  // Touch support - Mobile detection
  maxTouchPoints: navigator.maxTouchPoints || 0,
  
  // Connection information (if available)
  connection: navigator.connection ? {
    effectiveType: navigator.connection.effectiveType,  // "4g", "3g", etc.
    downlink: navigator.connection.downlink,            // Mbps
    rtt: navigator.connection.rtt                        // Round trip time
  } : null
};
```

**Why Safe**: Used by performance monitoring tools and Progressive Web Apps.

### 5. Storage & Capability Detection

Standard feature detection used by all modern web apps:

```javascript
const capabilityParams = {
  // Storage APIs - Essential for web apps
  localStorage: typeof Storage !== 'undefined' && localStorage !== null,
  sessionStorage: typeof Storage !== 'undefined' && sessionStorage !== null,
  indexedDB: 'indexedDB' in window,
  
  // Modern API support
  serviceWorker: 'serviceWorker' in navigator,
  webGL: !!document.createElement('canvas').getContext('webgl'),
  
  // Media capabilities (presence only, not enumeration)
  mediaDevices: 'mediaDevices' in navigator,
  geolocation: 'geolocation' in navigator,
  
  // Notification support
  notifications: 'Notification' in window
};
```

**Why Safe**: Feature detection is standard practice for progressive enhancement.

## Implementation Strategies

### Option A: Static White Page + Client-Side Decision

This approach serves the fastest possible initial page load:

```javascript
// 1. Page loads with black content hidden via CSS
<style>
  [data-cloakable="true"] { display: none !important; }
  body.is-black-mode [data-cloakable="true"] { display: block !important; }
</style>

// 2. Collect fingerprint on page load
class SafeFingerprint {
  constructor() {
    this.collected = false;
    this.fingerprint = null;
  }
  
  async collect() {
    if (this.collected) return this.fingerprint;
    
    // Collect all safe parameters
    const fp = {
      display: this.getDisplayParams(),
      browser: this.getBrowserParams(),
      timezone: this.getTimezoneParams(),
      hardware: this.getHardwareParams(),
      capabilities: this.getCapabilityParams(),
      timestamp: Date.now()
    };
    
    // Generate hash
    this.fingerprint = await this.generateHash(fp);
    this.collected = true;
    
    return this.fingerprint;
  }
  
  async generateHash(data) {
    const json = JSON.stringify(data, Object.keys(data).sort());
    const msgBuffer = new TextEncoder().encode(json);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  getDisplayParams() {
    return {
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      dpr: window.devicePixelRatio
    };
  }
  
  getBrowserParams() {
    return {
      ua: navigator.userAgent,
      lang: navigator.language,
      platform: navigator.platform
    };
  }
  
  // ... other parameter collection methods
}

// 3. Make decision request
async function requestCloakDecision() {
  const fp = new SafeFingerprint();
  const fingerprint = await fp.collect();
  
  try {
    const response = await fetch('/api/cloak-decision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Fingerprint': fingerprint
      },
      body: JSON.stringify({
        fingerprint: fingerprint,
        clickId: new URLSearchParams(window.location.search).get('yclid'),
        timestamp: Date.now()
      })
    });
    
    const decision = await response.json();
    
    if (decision.mode === 'black') {
      document.body.classList.add('is-black-mode');
      initializeBlackModeFeatures();
    }
  } catch (error) {
    // Fail safely to white mode
    console.error('Cloak decision failed:', error);
  }
}

// 4. Initialize on page load
document.addEventListener('DOMContentLoaded', requestCloakDecision);
```

**Advantages**:
- Instant page load (static HTML)
- No server-side rendering delay
- Graceful degradation
- CDN-friendly

**Performance Timeline**:
1. 0ms: Static HTML loads (white mode)
2. 50ms: JavaScript executes
3. 100ms: Fingerprint collected
4. 150-300ms: Decision received
5. 300ms: Black content revealed (if approved)

### Option B: Layered Server + Client Approach

This provides defense in depth with two decision points:

```javascript
// Phase 1: Server-Side Initial Decision
// (In your Next.js page component)
export default async function ArticlePage({ params, searchParams }) {
  // Basic server-side fingerprint from headers
  const serverFingerprint = {
    userAgent: headers().get('user-agent'),
    language: headers().get('accept-language'),
    ip: headers().get('x-forwarded-for'),
    clickId: searchParams.yclid
  };
  
  // Quick decision based on basic parameters
  const initialDecision = await makeQuickDecision(serverFingerprint);
  
  return (
    <html>
      <body className={initialDecision === 'black' ? 'is-black-mode' : ''}>
        <Script id="enhanced-fingerprint" strategy="afterInteractive">
          {`window.__INITIAL_DECISION__ = '${initialDecision}';`}
        </Script>
        {/* Rest of page */}
      </body>
    </html>
  );
}

// Phase 2: Client-Side Enhanced Verification
class EnhancedFingerprint {
  constructor(initialDecision) {
    this.initialDecision = initialDecision;
    this.verificationComplete = false;
  }
  
  async verify() {
    // Skip if already white mode
    if (this.initialDecision === 'white') return;
    
    // Collect enhanced fingerprint
    const enhanced = await this.collectEnhanced();
    
    // Verify the initial decision
    const verification = await this.verifyDecision(enhanced);
    
    if (!verification.valid) {
      // Revoke black mode if verification fails
      document.body.classList.remove('is-black-mode');
      this.logSecurityEvent('verification_failed', enhanced);
    }
  }
  
  async collectEnhanced() {
    // Collect additional parameters only available client-side
    return {
      // All safe parameters from Option A
      display: this.getDisplayParams(),
      browser: this.getBrowserParams(),
      timezone: this.getTimezoneParams(),
      hardware: this.getHardwareParams(),
      
      // Additional verification parameters
      performance: {
        memory: performance.memory ? {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize
        } : null,
        timing: {
          navigationStart: performance.timing.navigationStart,
          loadEventEnd: performance.timing.loadEventEnd
        }
      },
      
      // Behavioral markers
      behavior: {
        hasMouseMove: false,  // Will be set by event listeners
        hasScroll: false,
        timeOnPage: 0
      }
    };
  }
}
```

**Advantages**:
- Two-layer protection
- Server-side can block obvious bad traffic
- Client-side catches sophisticated investigators
- Better performance metrics

## Fingerprint Composition Strategy

### Recommended Parameter Combination

For optimal uniqueness while maintaining safety:

```javascript
const recommendedFingerprint = {
  // Tier 1: Core Identity (High entropy, very safe)
  core: {
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    devicePixelRatio: window.devicePixelRatio,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language
  },
  
  // Tier 2: System Context (Medium entropy, safe)
  system: {
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    hardwareConcurrency: navigator.hardwareConcurrency
  },
  
  // Tier 3: Capabilities (Low entropy, very safe)
  capabilities: {
    localStorage: !!window.localStorage,
    sessionStorage: !!window.sessionStorage,
    indexedDB: !!window.indexedDB,
    serviceWorker: 'serviceWorker' in navigator
  }
};
```

### Hash Generation

Use built-in Web Crypto API for consistent hashing:

```javascript
async function generateFingerprintHash(params) {
  // Sort keys for consistency
  const sorted = JSON.stringify(params, Object.keys(params).sort());
  
  // Use SubtleCrypto for hashing
  const msgBuffer = new TextEncoder().encode(sorted);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

## Safety Guidelines

### DO Collect:
1. **Navigator properties** that appear in HTTP headers
2. **Screen dimensions** used by responsive design
3. **Timezone data** used for scheduling
4. **Basic hardware info** used for performance
5. **Standard capability checks** for feature detection

### DO NOT Collect:
1. **Canvas fingerprinting** - Highly suspicious
2. **WebGL details** - Beyond basic support check
3. **Font enumeration** - Known fingerprinting technique
4. **Plugin lists** - Deprecated and suspicious
5. **WebRTC local IPs** - Privacy invasive
6. **Battery API** - Removed from many browsers
7. **Detailed hardware specs** - Too invasive

### Timing Considerations:
- Collect parameters gradually, not all at once
- Add 10-50ms delays between collections
- Mimic natural page analytics behavior

## Performance Optimization

### Lightweight Collection (<10ms total):

```javascript
class OptimizedFingerprint {
  constructor() {
    // Pre-compute static values
    this.static = {
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      dpr: window.devicePixelRatio,
      platform: navigator.platform,
      vendor: navigator.vendor
    };
  }
  
  async getQuickFingerprint() {
    // Only collect dynamic values
    const dynamic = {
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: new Date().getTimezoneOffset(),
      timestamp: Date.now()
    };
    
    // Combine and hash
    return this.quickHash({...this.static, ...dynamic});
  }
  
  quickHash(data) {
    // Fast non-crypto hash for speed
    let hash = 0;
    const str = JSON.stringify(data);
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}
```

## Testing & Validation

### Verify Safety with Analytics Comparison:

```javascript
// Compare your fingerprint with what Yandex Metrica collects
function compareWithYandexMetrica() {
  // Initialize Yandex Metrica
  if (window.ym) {
    window.ym(METRICA_ID, 'getClientID', function(clientID) {
      console.log('Yandex Client ID:', clientID);
    });
    
    // Check what parameters Yandex collects
    window.ym(METRICA_ID, 'userParams', {
      screen: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      dpr: window.devicePixelRatio
      // These match our safe parameters!
    });
  }
}
```

## Implementation Checklist

- [ ] Use only parameters from the safe list
- [ ] Implement gradual collection timing
- [ ] Add Web Crypto API for hashing
- [ ] Test against real Yandex Metrica data
- [ ] Monitor for unusual patterns
- [ ] Implement fallbacks for missing APIs
- [ ] Add performance measurements
- [ ] Test on various browsers/devices

## Conclusion

This fingerprinting approach uses only parameters that legitimate analytics services collect, making it indistinguishable from normal website behavior. The two implementation options provide flexibility based on your performance and security requirements.