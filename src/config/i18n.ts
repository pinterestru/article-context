// Localization constants
export const LOCALES = ['en', 'ru'] as const;
export type Locale = typeof LOCALES[number];
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';