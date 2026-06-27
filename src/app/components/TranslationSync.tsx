"use client";

import { useEffect } from "react";
import { useSetTranslations, type ProductTranslation } from "@/context/TranslationsContext";

/**
 * Zero-UI client component that syncs page-specific translation slugs
 * into the global TranslationsContext when the page mounts.
 *
 * Usage (inside any server page that has translations data):
 *   <TranslationSync translations={product.translations ?? []} />
 *
 * When the component unmounts (navigation away), the context auto-resets
 * via the pathname-based useEffect in TranslationsProvider.
 */
export default function TranslationSync({
  translations,
}: {
  translations: ProductTranslation[];
}) {
  const setTranslations = useSetTranslations();

  useEffect(() => {
    if (translations && translations.length > 0) {
      setTranslations(translations);
    }
  }, [translations, setTranslations]);

  return null;
}
