"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartItemsCount } = useCart();

  // Active status helpers
  const isHomeActive = pathname === "/";
  const isSearchActive = pathname === "/search";
  const isShopActive =
    pathname === "/shop" ||
    pathname.startsWith("/category/") ||
    pathname.startsWith("/product/");
  const isCartActive = pathname === "/cart";

  return (
    <nav className="mobile-nav-container" aria-label="شريط التنقل السفلي للهاتف">
      {/* 1. Home Link */}
      <Link
        href="/"
        className={`mobile-nav-item ${isHomeActive ? "active" : ""}`}
        aria-label="الرئيسية"
      >
        <span className="mobile-nav-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </span>
        <span className="mobile-nav-label">الرئيسية</span>
      </Link>

      {/* 2. Search Link */}
      <Link
        href="/search"
        className={`mobile-nav-item ${isSearchActive ? "active" : ""}`}
        aria-label="البحث"
      >
        <span className="mobile-nav-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>
        <span className="mobile-nav-label">البحث</span>
      </Link>

      {/* 3. Shop/Store Link */}
      <Link
        href="/shop"
        className={`mobile-nav-item ${isShopActive ? "active" : ""}`}
        aria-label="المتجر"
      >
        <span className="mobile-nav-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m2 7 4.41-3.67A2 2 0 0 1 7.7 3h8.6a2 2 0 0 1 1.29.33L22 7" />
            <path d="M3 12h18" />
            <path d="M3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
            <path d="M9 22V12" />
            <path d="M15 22V12" />
          </svg>
        </span>
        <span className="mobile-nav-label">المتجر</span>
      </Link>

      {/* 4. Cart Link */}
      <Link
        href="/cart"
        className={`mobile-nav-item ${isCartActive ? "active" : ""}`}
        aria-label="السلة"
      >
        <span className="mobile-nav-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          {cartItemsCount > 0 && (
            <span className="mobile-nav-cart-badge" aria-label={`لديك ${cartItemsCount} منتجات في السلة`}>
              {cartItemsCount}
            </span>
          )}
        </span>
        <span className="mobile-nav-label">السلة</span>
      </Link>
    </nav>
  );
}
