export const defaultLocale = "ar" as const;
export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];

/**
 * Type guard — narrows an arbitrary string to a supported Locale.
 */
export function isValidLocale(lang: string): lang is Locale {
  return (locales as readonly string[]).includes(lang);
}
