import type { z } from 'zod';

// Custom validation error for detailed error reporting
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: z.ZodError,
    public rawData: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Base widget interface (common properties for all widgets)
export interface BaseWidgetConfig {
  type: string;
  white?: string; // Presence indicates widget should show in white mode
}

// Widget rendering context
export interface WidgetRenderContext {
  widgetId: string;
  className?: string;
}

// Type mapping for widget type aliases
export const WIDGET_TYPE_MAP: Record<string, string> = {
  'promocode': 'promocode',
  'promo': 'promocode',
  'promocode_list': 'promocode_list',
  'promocodes': 'promocode_list',
  'countdown': 'countdown',
};

// Helper to validate widget type
export function isValidWidgetType(type: string): boolean {
  return type in WIDGET_TYPE_MAP;
}

// Get canonical widget type
export function getCanonicalWidgetType(type: string): string {
  return WIDGET_TYPE_MAP[type] || type;
}