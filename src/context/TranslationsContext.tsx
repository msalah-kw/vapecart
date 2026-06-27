"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface ProductTranslation {
  slug: string;
  language: {
    code: string;
  };
}

interface TranslationsContextValue {
  translations: ProductTranslation[];
}

const TranslationsContext = createContext<TranslationsContextValue>({
  translations: [],
});

export function TranslationsProvider({
  translations,
  children,
}: {
  translations: ProductTranslation[];
  children: ReactNode;
}) {
  return (
    <TranslationsContext.Provider value={{ translations }}>
      {children}
    </TranslationsContext.Provider>
  );
}

export function useTranslations(): ProductTranslation[] {
  return useContext(TranslationsContext).translations;
}
