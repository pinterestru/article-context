# Test Plan for Promocode Button Flow

## Expected Behavior

1. **Initial State**
   - Promocode button shows masked code (e.g., "ABC***XY")
   - No copy functionality on the button
   - Simple hover effects

2. **Click Action**
   - Opens new tab with current URL + `?promocode_id={id}`
   - Original tab redirects to affiliate URL after 500ms delay
   - User is switched to new tab automatically (browser behavior)

3. **New Tab Experience**
   - Shows promocode dialog with actual code
   - User can copy code from dialog
   - When dialog is closed, user remains on article page
   - Background tab has already redirected to set affiliate cookie

## Implementation Details

### PromocodeButton Changes:
- Removed `isRevealed` state
- Removed `optimisticCopied` state
- Removed copy functionality
- Simplified UI to always show masked code
- Click handler:
  - Opens new tab with `?promocode_id` parameter
  - Redirects original tab to `promocode.targetUrl`

### Security:
- Original promocode never shown in button
- Only masked code visible
- Actual code only revealed in secure dialog

## Testing Steps

1. Navigate to an article with promocodes
2. Click on a promocode button
3. Verify new tab opens with dialog
4. Check original tab redirected to affiliate URL
5. Close dialog in new tab - should stay on article