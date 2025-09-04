# Google Tag Manager Integration Guide

## Overview

This document describes the Google Tag Manager (GTM) integration in the Affiliate Article UI application. GTM is implemented to manage tracking pixels and analytics without requiring code changes.

## Security Features

### Content Security Policy (CSP)
- **Nonce-based Security**: The application generates a unique nonce for each request to secure inline scripts
- **Fallback Support**: Maintains 'unsafe-inline' as fallback for GTM compatibility
- **Whitelisted Domains**: Only trusted GTM and Google Analytics domains are allowed

### Error Handling
- **Error Boundary**: GTM components are wrapped in error boundaries to prevent crashes
- **Graceful Degradation**: The application continues to function even if GTM fails to load
- **Comprehensive Logging**: All GTM errors are logged for debugging without affecting users

### Type Safety
- **TypeScript Types**: All dataLayer events have strict TypeScript types
- **Runtime Validation**: Zod schemas validate all events before pushing to dataLayer
- **Validation Errors**: Invalid events are logged but don't crash the application

## Configuration

### Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Required - Your GTM Container ID
GTM_ID=GTM-XXXXXXX
```

### Content Security Policy

The application's CSP has been configured to allow GTM scripts. The following domains are whitelisted:
- `https://www.googletagmanager.com`
- `https://tagmanager.google.com`
- `https://www.google-analytics.com`
- `https://analytics.google.com`

## DataLayer Variables

### Global Variables

These variables are available on all pages:

| Variable | Type | Description |
|----------|------|-------------|
| `cloakMode` | string | Current cloak mode: 'white', 'black', or 'unknown' |
| `traceId` | string | Server-provided trace ID for correlation |
| `pageType` | string | Type of page (always 'article' currently) |
| `pagePath` | string | Current page path |
| `pageTitle` | string | Current page title |

### Event-Specific Variables

#### Page View Event
- Event Name: `page_view`
- Variables:
  - `page_path`: Current URL path
  - `page_title`: Page title
  - `page_location`: Full URL
  - `cloakMode`: Current cloak mode
  - `traceId`: Trace ID

#### Promocode Interaction Event
- Event Name: `promocode_interaction`
- Variables:
  - `eventCategory`: 'engagement'
  - `eventAction`: 'viewed' | 'revealed' | 'copied' | 'clicked' | 'copy_failed'
  - `eventLabel`: Promocode value
  - `promocodeDetails`: Object containing:
    - `code`: Promocode value
    - `position`: Widget position
    - `widgetType`: Type of widget
    - `articleSlug`: Current article slug
    - `partner`: Partner identifier
    - `variant`: A/B test variant
  - `clickId`: Click tracking ID (if available)
  - `cloakMode`: Current cloak mode
  - `traceId`: Trace ID

#### Conversion Events
- Event Names: `conversion_click`, `conversion_lead`, `conversion_sale`
- Variables:
  - `eventCategory`: 'conversion'
  - `eventAction`: 'click' | 'lead' | 'sale'
  - `eventValue`: Numeric value (for sales)
  - `conversionDetails`: Object containing:
    - `type`: Conversion type
    - `value`: Monetary value
    - `currency`: Currency code
    - `partner`: Partner identifier
  - `clickId`: Click tracking ID
  - `cloakMode`: Current cloak mode
  - `traceId`: Trace ID

## GTM Configuration Examples

### GA4 Page View Tag

1. Create a new GA4 Event tag
2. Configuration Tag: Select your GA4 Configuration
3. Event Name: `page_view`
4. Event Parameters:
   - `page_location`: {{Page URL}}
   - `page_title`: {{Page Title}}
   - `cloak_mode`: {{DLV - cloakMode}}
   - `trace_id`: {{DLV - traceId}}

### Promocode Interaction Tag

1. Create a new GA4 Event tag
2. Configuration Tag: Select your GA4 Configuration
3. Event Name: `promocode_{{Event Action}}`
4. Event Parameters:
   - `promocode`: {{DLV - promocodeDetails.code}}
   - `position`: {{DLV - promocodeDetails.position}}
   - `widget_type`: {{DLV - promocodeDetails.widgetType}}
   - `article`: {{DLV - promocodeDetails.articleSlug}}
   - `cloak_mode`: {{DLV - cloakMode}}
   - `trace_id`: {{DLV - traceId}}

### Conversion Tracking Tag

1. Create a new GA4 Event tag
2. Configuration Tag: Select your GA4 Configuration
3. Event Name: Use {{Event}} variable
4. Event Parameters:
   - `value`: {{DLV - conversionDetails.value}}
   - `currency`: {{DLV - conversionDetails.currency}}
   - `transaction_id`: {{DLV - clickId}}
   - `cloak_mode`: {{DLV - cloakMode}}
   - `trace_id`: {{DLV - traceId}}

## Testing

### GTM Preview Mode

1. In GTM, click "Preview" button
2. Enter your development URL
3. The GTM Preview debugger will open
4. Navigate through your site and verify events are firing

### Console Debugging

In development mode, all GTM events are logged to the console. Look for entries starting with `[GTM dataLayer push]:`.

### Testing Checklist

- [ ] GTM container loads on all pages
- [ ] Page view events fire on navigation
- [ ] Promocode events fire on interactions:
  - [ ] Viewed when promocode widget enters viewport
  - [ ] Revealed when hidden code is shown
  - [ ] Copied when code is copied to clipboard
  - [ ] Clicked when redirect button is clicked
- [ ] Conversion events fire on tracking endpoints
- [ ] All events include cloak mode and trace ID
- [ ] No CSP violations in browser console

## Troubleshooting

### GTM Not Loading

1. Check that `GTM_ID` is set in environment
2. Verify no CSP violations in browser console
3. Check browser network tab for blocked requests
4. Look for `[GTM]` error messages in console

### Events Not Firing

1. Open browser console and look for `[GTM] DataLayer push:` logs
2. Check for `[GTM] Invalid dataLayer event:` validation errors
3. Use GTM Preview mode to debug
4. Verify element selectors match your widgets
5. Check that JavaScript is enabled

### Validation Errors

Common validation errors and solutions:
- `event: Required` - Ensure all events have an 'event' property
- `Invalid enum value` - Check eventAction values match allowed options
- `Expected number, received string` - Ensure numeric values are numbers, not strings

### Preview Mode Issues

1. Ensure preview parameters are in URL
2. Clear browser cache and cookies
3. Try incognito/private browsing mode
4. Verify GTM container is published

### Error Recovery

The GTM integration includes automatic error recovery:
- **Script Loading Failures**: App continues without GTM
- **DataLayer Corruption**: Automatically reinitializes dataLayer
- **Invalid Events**: Filtered out with validation logging
- **Network Timeouts**: Non-blocking with graceful degradation

## Best Practices

1. **Event Naming**: Use consistent, descriptive event names
2. **Parameter Naming**: Use snake_case for GA4 compatibility
3. **Value Types**: Ensure numeric values are integers for GA4
4. **Testing**: Always test in GTM Preview before publishing
5. **Documentation**: Update this guide when adding new events

## Integration with Other Analytics

GTM events work alongside:
- PostHog analytics (when implemented)
- Internal analytics queue system
- Server-side tracking endpoints

All systems receive the same event data for consistency.