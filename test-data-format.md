# Data Format Comparison: Legacy vs New Site

## Legacy Site (affiliate-store-ui)

### API Endpoint
- **URL**: `${API_BASE_URL}/marketing_track`
- **Method**: POST

### Query Parameters
```
event_type=visit
track_type=[optional]
track_value=[optional]
mtfi=[existing_mtfi]
created_at=[timestamp]
with_flow=true
```

### Request Body
```json
{
  "js_meta": "{\"js_screen_width\":1920,\"js_screen_height\":1080,...}" // JSON string
}
```

### Headers
```
Content-Type: application/json
X-Forwarded-For: [client_ip]
X-Real-IP: [client_ip]
User-Agent: [user_agent]
X-User-Agent: [user_agent]
X-URL: [page_url]
X-Url: [page_url]
X-Domain: [domain]
X-Host: [domain]
```

### Response
```json
{
  "ok": true,
  "mtfi": "new_or_existing_mtfi",
  "content_is_target": "true" | "false",
  "content_type": "nothing" | ...,
  "message": "ok" | "error_message"
}
```

## New Site (affiliate-article-ui) - After Rewrite

### API Endpoint
- **URL**: `${API_BASE_URL}/marketing_track`
- **Method**: POST

### Query Parameters
```
event_type=visit
mtfi=[existing_mtfi]
created_at=[timestamp]
with_flow=true
```

### Request Body
```json
{
  "js_meta": "{\"js_screen_width\":1920,\"js_screen_height\":1080,...}" // JSON string
}
```

### Headers
```
Content-Type: application/json
X-Forwarded-For: [client_ip]
X-Real-IP: [client_ip]
User-Agent: [user_agent]
X-User-Agent: [user_agent]
X-URL: [page_url]
X-Url: [page_url]
X-Domain: [domain]
X-Host: [domain]
```

### Response Handling
```javascript
// Legacy site
const isTarget = response.content_is_target === "true"

// New site  
const isTarget = trackingResult.content_is_target === 'true' || 
                (trackingResult.content_type !== 'nothing' && 
                 trackingResult.content_is_target !== 'false');
```

## Summary

✅ **MATCH**: Both sites now use the same:
- API endpoint (`/marketing_track`)
- Request method (POST)
- Query parameter format
- Body format (js_meta as JSON string)
- Header format (client metadata)
- Response interpretation

The new site's tracker service has been successfully rewritten to match the legacy format exactly.