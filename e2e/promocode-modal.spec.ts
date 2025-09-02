import { test, expect } from '@playwright/test';

test.describe('Promocode Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page with promocode widgets
    await page.goto('/articles/test-article');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should open modal when clicking View Details', async ({ page }) => {
    // First reveal the promocode
    await page.click('button:has-text("Click to Reveal Code")');
    
    // Wait for the code to be revealed
    await page.waitForSelector('code:has-text("TESTCODE")');
    
    // Click View Details
    await page.click('button:has-text("View Details")');
    
    // Modal should be visible
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('[role="dialog"] h2')).toContainText('Off Your Purchase');
    await expect(page.locator('[role="dialog"] .text-4xl')).toBeVisible();
  });

  test('should copy promocode from modal', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-write', 'clipboard-read']);
    
    // Reveal code and open modal
    await page.click('button:has-text("Click to Reveal Code")');
    await page.waitForSelector('code');
    await page.click('button:has-text("View Details")');
    
    // Copy code from modal
    await page.click('[role="dialog"] button:has-text("Copy Code")');
    
    // Verify copy success
    await expect(page.locator('[role="dialog"] button:has-text("Copied!")')).toBeVisible();
    
    // Verify clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toMatch(/^[A-Z0-9]+$/);
  });

  test('should expand and collapse terms', async ({ page }) => {
    // Reveal code and open modal
    await page.click('button:has-text("Click to Reveal Code")');
    await page.waitForSelector('code');
    await page.click('button:has-text("View Details")');
    
    // Terms should be collapsed initially
    await expect(page.locator('[role="dialog"] #terms-content')).not.toBeVisible();
    
    // Click to expand terms
    await page.click('[role="dialog"] button:has-text("Terms & Conditions")');
    
    // Terms should be visible
    await expect(page.locator('[role="dialog"] #terms-content')).toBeVisible();
    await expect(page.locator('[role="dialog"] #terms-content li')).toHaveCount(2);
    
    // Click to collapse
    await page.click('[role="dialog"] button:has-text("Terms & Conditions")');
    await expect(page.locator('[role="dialog"] #terms-content')).not.toBeVisible();
  });

  test('should close modal with Escape key', async ({ page }) => {
    // Reveal code and open modal
    await page.click('button:has-text("Click to Reveal Code")');
    await page.waitForSelector('code');
    await page.click('button:has-text("View Details")');
    
    // Modal should be visible
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Press Escape
    await page.keyboard.press('Escape');
    
    // Modal should be closed
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should close modal with close button', async ({ page }) => {
    // Reveal code and open modal
    await page.click('button:has-text("Click to Reveal Code")');
    await page.waitForSelector('code');
    await page.click('button:has-text("View Details")');
    
    // Click close button
    await page.click('[role="dialog"] button[aria-label="Close"]');
    
    // Modal should be closed
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should handle Use Code button', async ({ page }) => {
    // Mock the redirect to prevent navigation
    await page.route('**/api/track/click', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, clickId: 'test-click-id' })
      });
    });
    
    // Reveal code and open modal
    await page.click('button:has-text("Click to Reveal Code")');
    await page.waitForSelector('code');
    await page.click('button:has-text("View Details")');
    
    // Click Use Code
    await page.click('[role="dialog"] button:has-text("Use Code")');
    
    // Should show redirecting state
    await expect(page.locator('[role="dialog"] button:has-text("Redirecting...")')).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Reveal code and open modal
    await page.click('button:has-text("Click to Reveal Code")');
    await page.waitForSelector('code');
    await page.click('button:has-text("View Details")');
    
    // Tab through elements
    await page.keyboard.press('Tab');
    await expect(page.locator('[role="dialog"] button[aria-label="Close"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[role="dialog"] button:has-text("Copy Code")')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[role="dialog"] button:has-text("Terms & Conditions")')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[role="dialog"] button:has-text("Use Code")')).toBeFocused();
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Reveal code and open modal
    await page.click('button:has-text("Click to Reveal Code")');
    await page.waitForSelector('code');
    await page.click('button:has-text("View Details")');
    
    // Modal should be full screen on mobile
    const modalBounds = await page.locator('[role="dialog"] > div').boundingBox();
    expect(modalBounds?.width).toBe(375);
    expect(modalBounds?.height).toBe(667);
    
    // Content should be scrollable
    await expect(page.locator('[role="dialog"] > div')).toHaveCSS('overflow-y', 'auto');
  });

  test('should track analytics events', async ({ page }) => {
    // Intercept analytics calls
    const analyticsEvents: Array<{ url: string; data: unknown }> = [];
    await page.route('**/api/analytics/**', async route => {
      const request = route.request();
      analyticsEvents.push({
        url: request.url(),
        data: request.postDataJSON()
      });
      await route.fulfill({ status: 200 });
    });
    
    // Reveal code and open modal
    await page.click('button:has-text("Click to Reveal Code")');
    await page.waitForSelector('code');
    await page.click('button:has-text("View Details")');
    
    // Wait for modal to be visible
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Copy code
    await page.click('[role="dialog"] button:has-text("Copy Code")');
    await expect(page.locator('[role="dialog"] button:has-text("Copied!")')).toBeVisible();
    
    // Close modal
    await page.keyboard.press('Escape');
    
    // Verify analytics events were tracked
    // Note: In a real test, you would verify the actual analytics implementation
    expect(analyticsEvents.length).toBeGreaterThan(0);
  });
});