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
   * For translated content pages (products, categories, posts) where each
   * language has a different slug, we look up the correct translated slug
   * from the global TranslationsContext.
   *
   * For all other pages, we fall back to the default behaviour of just
   * prepending / stripping the `/en` prefix.
   */
  const getTargetPath = (): string => {
    const targetLang = currentLang === "ar" ? "en" : "ar";

    // ── Check for a translated slug from context ──
    if (translations && translations.length > 0) {
      // Polylang returns language codes in uppercase (e.g. "EN", "AR")
      const match = translations.find(
        (t) => t.language?.code?.toLowerCase() === targetLang
      );

      if (match?.slug) {
        // Detect the current route segment (product, category, etc.)
        const cleanPath = currentLang === "en"
          ? pathname.replace(/^\/en/, "")
          : pathname;

        // Extract the route prefix (e.g. "/product/", "/category/")
        const prefixMatch = cleanPath.match(/^(\/[^/]+\/)/);
        const routePrefix = prefixMatch ? prefixMatch[1] : "/product/";

        const translatedPath = `${routePrefix}${match.slug}`;
        // Arabic is the default language (no prefix); English uses /en
        return targetLang === "en" ? `/en${translatedPath}` : translatedPath;
      }
    }

    // ── Fallback: simple prefix swap for generic pages ──
    if (currentLang === "ar") {
      return `/en${pathname === "/" ? "" : pathname}`;
    }

    if (pathname === "/en") return "/";
    if (pathname.startsWith("/en/")) return pathname.replace(/^\/en/, "");
    return pathname;
  };

  const targetPath = getTargetPath();
  const label = currentLang === "en" ? "عربي" : "EN";

  return (
    <Link
      href={targetPath}
      className="language-switcher-btn icon-btn"
      prefetch={false}
      style={{ textDecoration: "none", fontWeight: "bold", fontSize: "0.9rem" }}
    >
      {label}
    </Link>
  );
}
