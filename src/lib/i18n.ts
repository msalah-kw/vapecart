export const defaultLocale = "ar" as const;
export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];

/**
 * Type guard — narrows an arbitrary string to a supported Locale.
 */
export function isValidLocale(lang: string): lang is Locale {
  return (locales as readonly string[]).includes(lang);
}

/**
 * Helper to localize a path based on the active language.
 */
export function getLocalizedHref(path: string, lang: string): string {
  if (!path) return "/";
  if (path.startsWith("http") || path.startsWith("mailto:") || path.startsWith("tel:")) return path;

  // Always ensure path starts with a slash
  const safePath = path.startsWith('/') ? path : `/${path}`;
  if (lang === defaultLocale) {
    return safePath;
  }
  return `/${lang}${safePath === '/' ? '' : safePath}`;
}
