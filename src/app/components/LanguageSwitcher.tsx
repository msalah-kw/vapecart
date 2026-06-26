"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const pathname = usePathname();

  // Construct the target path
  let targetPath = pathname;
  
  if (currentLang === 'ar') {
    // We are currently in Arabic (default, no prefix). Need to switch to English.
    // If we are at /, it becomes /en. If we are at /shop, it becomes /en/shop
    targetPath = `/en${pathname === '/' ? '' : pathname}`;
  } else if (currentLang === 'en') {
    // We are currently in English (has /en prefix). Need to switch to Arabic (remove prefix).
    if (pathname === '/en') {
      targetPath = '/';
    } else if (pathname.startsWith('/en/')) {
      targetPath = pathname.replace(/^\/en/, '');
    }
  }

  // Display label
  const label = currentLang === 'en' ? 'عربي' : 'EN';

  return (
    <Link href={targetPath} className="language-switcher-btn icon-btn" prefetch={false} style={{ textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
      {label}
    </Link>
  );
}
