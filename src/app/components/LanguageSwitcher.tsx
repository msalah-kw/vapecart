"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "@/context/TranslationsContext";

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const pathname = usePathname();
  const translations = useTranslations();

  /**
   * Resolve the target path when switching languages.
   *
   * For product pages with different slugs per language (e.g. Arabic: "mazaya-vape",
   * English: "vape-mazaya-5000-puffs"), we look up the correct translated slug from
   * the `translations` array provided by TranslationsContext.
   *
   * For all other pages, we fall back to the original behaviour of just
   * prepending / stripping the `/en` prefix.
   */
  const getTargetPath = (): string => {
    const targetLang = currentLang === "ar" ? "en" : "ar";

    // ── Check for a translated product slug ──
    if (translations && translations.length > 0) {
      // Polylang returns language codes in uppercase (e.g. "EN", "AR")
      const match = translations.find(
        (t) => t.language?.code?.toLowerCase() === targetLang
      );

      if (match?.slug) {
        const productPath = `/product/${match.slug}`;
        // Arabic is the default language (no prefix); English uses /en
        return targetLang === "en" ? `/en${productPath}` : productPath;
      }
    }

    // ── Fallback: simple prefix swap for non-product pages ──
    if (currentLang === "ar") {
      // Currently Arabic (no prefix) → switch to English (add /en)
      return `/en${pathname === "/" ? "" : pathname}`;
    }

    // Currently English (/en prefix) → switch to Arabic (remove /en)
    if (pathname === "/en") return "/";
    if (pathname.startsWith("/en/")) return pathname.replace(/^\/en/, "");
    return pathname;
  };

  const targetPath = getTargetPath();
  const label = currentLang === "en" ? "عربي" : "EN";

  return (
    <Link href={targetPath} className="language-switcher-btn icon-btn" prefetch={false} style={{ textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
      {label}
    </Link>
  );
}
