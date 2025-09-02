import { z } from 'zod';
import { ValidationError } from '../shared/types/widget.types';
import { promocodeListConfigSchema } from '../promocode-list/schemas/config';

// Re-export schemas for backward compatibility
export { promocodeListConfigSchema as PromocodeListWidgetConfigSchema } from '../promocode-list/schemas/config';

// Create a schema that adds the type field for the discriminated union
const PromocodeListWidgetConfigSchema = promocodeListConfigSchema.extend({
  type: z.literal('promocode_list'),
});

// Discriminated union for all widget types
export const WidgetConfigSchema = z.discriminatedUnion('type', [
  PromocodeListWidgetConfigSchema,
]);

// Re-export types for backward compatibility
export type PromocodeListWidgetConfig = z.infer<typeof promocodeListConfigSchema> & { type: 'promocode_list' };
export type WidgetConfig = z.infer<typeof WidgetConfigSchema>;

// Parse data-param-* attributes from an element
export function parseDataParams(element: HTMLElement): Record<string, string> {
  const params: Record<string, string> = {};
  
  // Get all attributes
  Array.from(element.attributes).forEach((attr) => {
    if (attr.name.startsWith('data-param-')) {
      const paramName = attr.name.replace('data-param-', '');
      params[paramName] = attr.value;
    }
  });

  return params;
}

// Convert kebab-case to camelCase
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Parse and validate widget configuration
export function parseWidgetConfig(
  element: HTMLElement
): { config: WidgetConfig; errors?: z.ZodError } {
  const action = element.getAttribute('data-action');
  
  if (!action) {
    throw new Error('Element must have a data-action attribute');
  }

  // Parse data-param-* attributes
  const rawParams = parseDataParams(element);
  
  // Convert kebab-case keys to camelCase
  const params: Record<string, string> = {};
  Object.entries(rawParams).forEach(([key, value]) => {
    params[kebabToCamel(key)] = value;
  });

  // Build configuration object
  const rawConfig = {
    type: action,
    ...params,
  };

  // Validate configuration
  try {
    const config = WidgetConfigSchema.parse(rawConfig);
    return { config };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        config: rawConfig as WidgetConfig, 
        errors: error 
      };
    }
    throw error;
  }
}

// Safe parse wrapper with detailed error handling
export function safeParseWidgetConfig(
  element: HTMLElement
): { success: true; data: WidgetConfig } | { success: false; error: ValidationError } {
  try {
    const { config, errors } = parseWidgetConfig(element);
    
    if (errors) {
      return {
        success: false,
        error: new ValidationError(
          `Invalid widget configuration for type "${element.getAttribute('data-action')}"`,
          errors,
          parseDataParams(element)
        ),
      };
    }

    return { success: true, data: config };
  } catch (error) {
    const zodError = new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        message: error instanceof Error ? error.message : 'Unknown error',
        path: [],
      },
    ]);

    return {
      success: false,
      error: new ValidationError(
        'Failed to parse widget configuration',
        zodError,
        element
      ),
    };
  }
}

// Re-export utility functions
export { isValidWidgetType, getCanonicalWidgetType } from '../shared/types/widget.types';