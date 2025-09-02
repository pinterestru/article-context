/**
 * Trigger haptic feedback if available
 */
export function triggerHapticFeedback(pattern: 'light' | 'medium' | 'heavy' = 'light') {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30
    };
    
    try {
      navigator.vibrate(patterns[pattern]);
    } catch {
      // Silently fail if vibration is not supported
    }
  }
}