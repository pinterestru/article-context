# Advanced Cloaking System Documentation

## Overview

This document outlines a targeted cloaking strategy designed specifically to protect affiliate links from manual investigation by advertiser employees. The system focuses on detecting human investigators who arrive via monitoring services like admon.ai, rather than automated bots.

## Primary Threat Model

**Main Threat**: Human advertiser employees manually investigating suspicious ads
- Triggered by admon.ai alerts for restricted keyword bidding
- Investigators click promocodes to trace affiliate network IDs
- Goal: Hide affiliate links while maintaining plausible deniability

**Secondary Threats**: 
- Repeat visitors (likely investigators)
- Automated monitoring beyond initial detection

## Core Architecture

### 1. Time-Based Protection Strategy

The cloaking system uses a strict time-window approach optimized for real user behavior:

```
First Visit (0-5 mins) → BLACK Mode (Show affiliate content)
After 5 minutes → WHITE Mode (Hide affiliate links)
Repeat Visit → WHITE Mode (Regardless of time)
```

**Rationale**: Real users click promocodes within 1 minute; investigators arrive hours/days later after receiving alerts.

## Detection Layers

### Layer 1: Click ID Parameter Tracking (Primary Defense)

**YCLID Time-Window Strategy:**
- **Primary Detection**: Capture `yclid` (Yandex), `gclid` (Google) parameters
- **Storage Schema**:
  ```json
  {
    "click_id": "string",
    "first_visit": "timestamp",
    "fingerprint_hash": "string",
    "shown_black": "boolean",
    "affiliate_clicked": "boolean",
    "investigation_score": "integer"
  }
  ```

**Decision Logic:**
- No click ID → WHITE (Not from our ad)
- Click ID exists + first visit within 5 mins → BLACK
- Click ID exists + visit > 5 mins from first → WHITE
- Click ID exists + fingerprint already shown BLACK → WHITE
- Any fingerprint mismatch → WHITE

### Layer 2: Simplified Fingerprinting for Single-Use Protection

**Purpose**: Ensure each browser gets only ONE black page view to prevent repeated investigation

**Core Components:**
1. **User Agent** - Browser and OS identification
2. **Screen Resolution** - Basic device fingerprint
3. **Language Settings** - Browser locale
4. **Timezone** - Geographic indicator

**Simple Fingerprint Hash:**
```javascript
const generateFingerprint = () => {
  const components = [
    navigator.userAgent,
    screen.width + 'x' + screen.height,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone
  ];
  return hashString(components.join('|'));
};
```

**Single-Use Logic:**
- First visit with fingerprint → Show BLACK, mark as used
- Second visit with same fingerprint → Always WHITE
- Prevents investigators from viewing affiliate links multiple times

### Layer 3: Persistent ID Blacklisting System

**Purpose**: Permanently block investigators who attempt to access with expired/invalid credentials

**Implementation:**
```javascript
class PersistentBlacklist {
  constructor() {
    this.storageKey = 'uid';
    this.blacklistKey = 'bl';
  }
  
  // Generate or retrieve persistent user ID
  getUserId() {
    let userId = localStorage.getItem(this.storageKey);
    if (!userId) {
      userId = this.generateId();
      localStorage.setItem(this.storageKey, userId);
    }
    return userId;
  }
  
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  // Check if user is blacklisted
  async isBlacklisted(userId) {
    // Check local storage first (fast)
    const localBlacklist = localStorage.getItem(this.blacklistKey);
    if (localBlacklist === '1') return true;
    
    // Check server blacklist
    const response = await fetch('/api/check-blacklist', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
    return response.json().then(data => data.blacklisted);
  }
  
  // Add to blacklist when investigation detected
  async addToBlacklist(userId, reason) {
    // Mark locally immediately
    localStorage.setItem(this.blacklistKey, '1');
    
    // Notify server
    await fetch('/api/add-blacklist', {
      method: 'POST',
      body: JSON.stringify({ 
        userId,
        reason,
        fingerprint: getCurrentFingerprint(),
        clickId: getClickId()
      })
    });
  }
}
```

**Blacklist Triggers:**
1. **Expired Window Access**: Valid yclid but >5 minutes old
2. **Fingerprint Mismatch**: Different fingerprint with same yclid
3. **Repeat Visit**: Any fingerprint already shown BLACK
4. **Investigation Behavior**: Dev tools, rapid clicks, etc.

**Server-Side Integration:**
```javascript
// In CloakingEngine.evaluate()
async evaluate(request) {
  const userId = request.headers['x-user-id'];
  
  // Check blacklist first
  if (await this.isUserBlacklisted(userId)) {
    return { mode: 'white', reason: 'blacklisted' };
  }
  
  // Continue with normal evaluation...
  const yclid = request.query.yclid;
  
  // If suspicious access attempt, add to blacklist
  if (yclid && this.isInvestigationAttempt(request)) {
    await this.blacklistUser(userId, 'investigation_attempt');
    return { mode: 'white', reason: 'blacklisted_new' };
  }
}
```

### Layer 4: Human Investigator Pattern Detection

**Investigation Behavior Indicators:**
```javascript
const detectInvestigator = {
  // Multiple promocode clicks in succession
  rapidClicking: (clicks) => clicks.length > 3 && 
    clicks.every((c, i) => i === 0 || c.time - clicks[i-1].time < 2000),
  
  // Hovering over links without clicking (inspecting)
  suspiciousHovering: (hovers) => hovers.filter(h => h.duration > 3000).length > 2,
  
  // Right-click attempts (viewing source)
  contextMenuAttempts: (events) => events.includes('contextmenu'),
  
  // Developer tools indicators
  devToolsOpen: () => {
    const threshold = 160;
    return window.outerHeight - window.innerHeight > threshold ||
           window.outerWidth - window.innerWidth > threshold;
  },
  
  // Time delay from ad click (investigators arrive later)
  suspiciousDelay: (clickTime) => Date.now() - clickTime > 300000 // 5+ minutes
};
```

**Immediate WHITE Mode Triggers:**
- Opening developer tools
- Right-clicking on promocode elements
- Clicking more than 3 promocodes in 10 seconds
- Hovering over affiliate links for extended periods

### Layer 4: Affiliate Link Protection Mechanisms

**Critical**: The main goal is hiding affiliate network IDs from investigators

**A. Server-Side Proxy Routes**
```javascript
// Never expose actual affiliate URLs in HTML
// All affiliate links go through your server
const affiliateRoutes = {
  '/go/promo1': {
    target: 'https://partner.com/aff?id=NETWORK_ID&offer=123',
    oneTime: true, // Link works only once
    expires: 300 // 5 minutes
  }
};

// Generate unique tokens for each session
app.get('/go/:token', (req, res) => {
  const link = getAndExpireToken(req.params.token);
  if (!link) return res.redirect('/'); // Expired or used
  res.redirect(link.target);
});
```

**B. Dynamic Link Obfuscation**
```javascript
// Generate promocode links dynamically in JavaScript
const createPromoLink = (promoId) => {
  // Never include affiliate URL in source
  const token = generateToken();
  storeToken(token, affiliateUrl, {expires: 300, oneTime: true});
  return `/go/${token}`;
};
```

**C. Multi-Layer Redirection**
1. Click promocode → Internal route (`/go/abc123`)
2. Server generates temporary redirect → Partner landing page
3. Partner landing page → Actual affiliate link
4. Investigator can't trace back to network ID

### Layer 5: Smart Promocode Display Protection

**Time-Limited Visibility:**
```javascript
class PromoCodeProtection {
  constructor() {
    this.codeVisibleTime = 60000; // 60 seconds
    this.requireInteraction = true;
  }
  
  // Require user interaction before showing codes
  async revealCode(element) {
    if (!this.hasUserInteracted) {
      element.textContent = 'Move mouse to reveal';
      await this.waitForInteraction();
    }
    
    // Show actual code
    element.textContent = this.getPromoCode();
    
    // Auto-hide after timeout
    setTimeout(() => {
      element.textContent = 'Code expired - refresh page';
      this.markCodeAsUsed();
    }, this.codeVisibleTime);
  }
  
  // Track genuine user interaction
  waitForInteraction() {
    return new Promise(resolve => {
      const handler = (e) => {
        if (e.isTrusted && e.movementX && e.movementY) {
          this.hasUserInteracted = true;
          document.removeEventListener('mousemove', handler);
          resolve();
        }
      };
      document.addEventListener('mousemove', handler);
    });
  }
}
```

**Copy Protection & Tracking:**
```javascript
// Make codes harder to systematically harvest
document.addEventListener('copy', (e) => {
  const selection = window.getSelection().toString();
  if (selection.includes('PROMO')) {
    // Log copy event
    trackEvent('promo_copied', {
      code: selection,
      timestamp: Date.now(),
      fingerprint: getCurrentFingerprint()
    });
    
    // Add tracking watermark
    e.clipboardData.setData('text/plain', selection + '?ref=' + generateTrackingId());
    e.preventDefault();
  }
});
```

## Implementation Strategy

### 1. Server-Side Decision Engine

```typescript
interface CloakingDecision {
  mode: 'white' | 'black';
  reason: string;
}

class CloakingEngine {
  async evaluate(request: Request): Promise<CloakingDecision> {
    const yclid = request.query.yclid || request.query.gclid;
    const fingerprint = request.headers['x-fingerprint'];
    
    // No click ID = not from our ad
    if (!yclid) {
      return { mode: 'white', reason: 'no_click_id' };
    }
    
    // Check if we've seen this click ID before
    const clickData = await this.getClickData(yclid);
    
    if (clickData) {
      // Check 5-minute window
      const timeSinceFirst = Date.now() - clickData.first_visit;
      if (timeSinceFirst > 300000) { // 5 minutes
        return { mode: 'white', reason: 'expired_window' };
      }
      
      // Check if fingerprint was already shown black
      if (clickData.shown_black && clickData.fingerprint_hash === fingerprint) {
        return { mode: 'white', reason: 'already_shown' };
      }
    }
    
    // Check if fingerprint was used before (with any click ID)
    const fingerprintUsed = await this.isFingerprintUsed(fingerprint);
    if (fingerprintUsed) {
      return { mode: 'white', reason: 'fingerprint_reuse' };
    }
    
    // New visitor within 5-minute window
    await this.recordVisit(yclid, fingerprint);
    return { mode: 'black', reason: 'new_visitor' };
  }
}
```

### 2. Client-Side Fingerprint Collection

```javascript
// Simple, fast fingerprint for single-use protection
class FingerprintCollector {
  collect() {
    const fingerprint = [
      navigator.userAgent,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      navigator.language,
      new Date().getTimezoneOffset(),
      navigator.platform,
      navigator.cookieEnabled
    ].join('|');
    
    return this.hashString(fingerprint);
  }
  
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

// Send fingerprint with first request
document.addEventListener('DOMContentLoaded', () => {
  const fp = new FingerprintCollector().collect();
  // Include in all API calls
  window.FINGERPRINT = fp;
});
```

### 3. Investigation Detection System

```javascript
class InvestigationDetector {
  constructor() {
    this.events = [];
    this.suspicionScore = 0;
  }
  
  init() {
    // Track promocode interactions
    document.querySelectorAll('[data-action="promo"]').forEach(el => {
      el.addEventListener('click', () => this.logPromoClick());
      el.addEventListener('mouseenter', (e) => this.startHover(e));
      el.addEventListener('mouseleave', (e) => this.endHover(e));
    });
    
    // Detect right-clicks
    document.addEventListener('contextmenu', (e) => {
      if (e.target.closest('[data-action="promo"]')) {
        this.suspicionScore += 50;
        this.triggerWhiteMode('right_click_promo');
      }
    });
    
    // Detect dev tools
    this.detectDevTools();
  }
  
  logPromoClick() {
    this.events.push({type: 'promo_click', time: Date.now()});
    
    // Check for rapid clicking pattern
    const recentClicks = this.events
      .filter(e => e.type === 'promo_click' && Date.now() - e.time < 10000);
    
    if (recentClicks.length > 3) {
      this.triggerWhiteMode('rapid_promo_clicks');
    }
  }
  
  detectDevTools() {
    const threshold = 160;
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        this.triggerWhiteMode('devtools_open');
      }
    }, 500);
  }
  
  triggerWhiteMode(reason) {
    document.body.classList.remove('is-black-mode');
    this.logInvestigation(reason);
    
    // Add to blacklist if investigation detected
    const blacklist = new PersistentBlacklist();
    const userId = blacklist.getUserId();
    blacklist.addToBlacklist(userId, reason);
  }
}
```

## Database Schema

```sql
-- Simplified schema focused on 5-minute window and single-use protection
CREATE TABLE click_sessions (
  id SERIAL PRIMARY KEY,
  click_id VARCHAR(255) NOT NULL,
  fingerprint_hash VARCHAR(64) NOT NULL,
  first_visit TIMESTAMP NOT NULL DEFAULT NOW(),
  shown_black BOOLEAN DEFAULT FALSE,
  affiliate_clicked BOOLEAN DEFAULT FALSE,
  investigation_flags JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_click_id (click_id),
  INDEX idx_fingerprint (fingerprint_hash),
  INDEX idx_first_visit (first_visit)
);

-- Track used fingerprints globally
CREATE TABLE used_fingerprints (
  fingerprint_hash VARCHAR(64) PRIMARY KEY,
  first_seen TIMESTAMP DEFAULT NOW(),
  click_id VARCHAR(255),
  shown_black BOOLEAN DEFAULT TRUE
);

-- Log suspicious activity for analysis
CREATE TABLE investigation_logs (
  id SERIAL PRIMARY KEY,
  click_id VARCHAR(255),
  fingerprint_hash VARCHAR(64),
  reason VARCHAR(100),
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Affiliate link tokens (one-time use)
CREATE TABLE affiliate_tokens (
  token VARCHAR(64) PRIMARY KEY,
  target_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  click_id VARCHAR(255),
  fingerprint_hash VARCHAR(64)
);

-- Permanent user blacklist
CREATE TABLE user_blacklist (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL UNIQUE,
  reason VARCHAR(100) NOT NULL,
  fingerprint_hash VARCHAR(64),
  click_id VARCHAR(255),
  ip_hash VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_created (created_at)
);
```

## Key Implementation Details

### 1. Redis for Fast Decision Making
```javascript
class CloakingCache {
  constructor(redisClient) {
    this.redis = redisClient;
    this.windowTTL = 310; // 5 minutes + 10 second buffer
  }
  
  // Store click session with automatic expiry
  async recordClick(clickId, fingerprint) {
    const key = `click:${clickId}`;
    const data = {
      first_visit: Date.now(),
      fingerprint_hash: fingerprint,
      shown_black: false
    };
    await this.redis.setex(key, this.windowTTL, JSON.stringify(data));
  }
  
  // Check if fingerprint was used
  async isFingerprintUsed(fingerprint) {
    return await this.redis.exists(`fp:${fingerprint}`);
  }
  
  // Mark fingerprint as used (permanent)
  async markFingerprintUsed(fingerprint) {
    await this.redis.set(`fp:${fingerprint}`, '1');
  }
  
  // Check if user is blacklisted (cached)
  async isUserBlacklisted(userId) {
    const cached = await this.redis.get(`bl:${userId}`);
    if (cached !== null) return cached === '1';
    
    // Check database if not cached
    const blacklisted = await db.checkBlacklist(userId);
    
    // Cache result for 24 hours
    await this.redis.setex(`bl:${userId}`, 86400, blacklisted ? '1' : '0');
    return blacklisted;
  }
  
  // Add user to blacklist cache
  async blacklistUser(userId) {
    await this.redis.set(`bl:${userId}`, '1');
  }
}
```

### 2. Affiliate Link Token System
```javascript
class AffiliateLinkProtector {
  generateToken(targetUrl, clickId, fingerprint) {
    const token = crypto.randomBytes(32).toString('hex');
    
    // Store token with 5-minute expiry
    redis.setex(`token:${token}`, 300, JSON.stringify({
      target: targetUrl,
      clickId: clickId,
      fingerprint: fingerprint,
      created: Date.now()
    }));
    
    return token;
  }
  
  async redeemToken(token) {
    const key = `token:${token}`;
    const data = await redis.get(key);
    
    if (!data) return null; // Expired or already used
    
    // Delete immediately after first use
    await redis.del(key);
    
    return JSON.parse(data);
  }
}
```

## Monitoring & Analytics

### 1. Key Metrics to Track
```javascript
const metrics = {
  // Conversion funnel
  totalVisits: 0,
  blackModeShown: 0,
  promocodesClicked: 0,
  affiliateRedirects: 0,
  
  // Investigation detection
  whiteModeTriggers: {
    expired_window: 0,
    fingerprint_reuse: 0,
    devtools_open: 0,
    rapid_clicks: 0,
    right_click: 0
  },
  
  // Time-based analysis
  avgTimeToPromoClick: 0,
  visitsAfter5Minutes: 0
};
```

### 2. Real-time Alerts
- Spike in visits after 5-minute window (possible investigation)
- Multiple fingerprints from same click ID
- Unusual patterns in promo click timing
- High rate of dev tools detection

## Emergency Protocols

### 1. Global White Mode Switch
```javascript
class EmergencyOverride {
  async activateWhiteMode(reason) {
    // Instantly switch all traffic to white mode
    await redis.set('global:white_mode', '1');
    
    // Log the activation
    await db.query(
      'INSERT INTO emergency_overrides (reason, activated_at) VALUES ($1, NOW())',
      [reason]
    );
    
    // Notify team
    await sendAlert(`White mode activated: ${reason}`);
  }
  
  async deactivateWhiteMode() {
    await redis.del('global:white_mode');
  }
}

// Check in decision engine
if (await redis.get('global:white_mode')) {
  return { mode: 'white', reason: 'emergency_override' };
}
```

### 2. Investigation Response Protocol
1. **Detection Alert**: System detects potential investigation pattern
2. **Auto-Protection**: Affected click IDs automatically go to white mode
3. **Manual Review**: Check logs for investigation patterns
4. **Campaign Pause**: If confirmed, pause affected campaigns
5. **Recovery**: Resume with new click IDs after cool-down period

## Best Practices

### 1. Campaign Management
- Use unique landing pages per campaign
- Rotate click IDs regularly
- Monitor conversion rates for anomalies
- Keep affiliate partnerships diversified

### 2. Technical Implementation
- Always fail to WHITE mode on errors
- Log everything but hash sensitive data
- Use server-side proxy for all affiliate links
- Never expose network IDs in client-side code

### 3. Investigation Avoidance
- Keep promo content reasonable and believable
- Ensure base article provides genuine value
- Respond quickly to any partner inquiries
- Maintain good relationships with affiliate networks

## Conclusion

This cloaking system is specifically designed to protect affiliate links from manual investigation by advertiser employees who are alerted by services like admon.ai. The key principles are:

1. **5-Minute Window**: Real users act fast; investigators arrive later
2. **Single-Use Protection**: Each browser sees black mode only once
3. **Behavioral Detection**: Identify investigation patterns and switch to white
4. **Link Protection**: Never expose affiliate network IDs directly

Success depends on disciplined implementation, continuous monitoring, and maintaining the balance between conversion optimization and compliance safety.