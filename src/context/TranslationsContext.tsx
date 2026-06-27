"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export interface ProductTranslation {
  slug: string;
  language: {
    code: string;
  };
}

interface TranslationsContextValue {
  translations: ProductTranslation[];
  setTranslations: (translations: ProductTranslation[]) => void;
}

const TranslationsContext = createContext<TranslationsContextValue>({
  translations: [],
  setTranslations: () => {},
});

/**
 * Global provider that lives in the storefront layout so every component
 * (including the Header / LanguageSwitcher) can read translations.
 *
 * Individual pages push their translation arrays via `setTranslations`;
 * the provider auto-resets to `[]` on every route change so generic pages
 * fall back to the default prefix-swap behaviour.
 */
export function TranslationsProvider({ children }: { children: ReactNode }) {
  const [translations, _setTranslations] = useState<ProductTranslation[]>([]);
  const pathname = usePathname();

  // Auto-reset translations on every client-side navigation so pages without
  // translations (home, shop, search, etc.) don't inherit stale data.
  useEffect(() => {
    _setTranslations([]);
  }, [pathname]);

  const setTranslations = useCallback(
    (next: ProductTranslation[]) => _setTranslations(next),
    []
  );

  return (
    <TranslationsContext.Provider value={{ translations, setTranslations }}>
      {children}
    </TranslationsContext.Provider>
  );
}

/** Read the current translation array. */
export function useTranslations(): ProductTranslation[] {
  return useContext(TranslationsContext).translations;
}

/** Obtain the setter to push page-specific translations into the global context. */
export function useSetTranslations(): (t: ProductTranslation[]) => void {
  return useContext(TranslationsContext).setTranslations;
}
