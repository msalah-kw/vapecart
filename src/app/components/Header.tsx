"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import CartBadge from "@/app/components/CartBadge";
import { CATEGORIES_CONFIG } from "@/lib/navigation";

const DynamicMobileDrawer = dynamic(() => import("./MobileDrawer"), { ssr: false });
const DynamicMiniCartDrawer = dynamic(() => import("./MiniCartDrawer"), { ssr: false });

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll listener for sticky header shrink
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close drawers on path change
  useEffect(() => {
    setIsDrawerOpen(false);
    setIsMiniCartOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer or mini-cart is open
  useEffect(() => {
    if (isDrawerOpen || isMiniCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen, isMiniCartOpen]);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="top-bar">
        توصيل سريع داخل الكويت 🇰🇼
      </div>

      {/* Sticky Main Header */}
      <header className={`main-header ${isScrolled ? "scrolled" : ""}`}>
        {/* Desktop View */}
        <div className="desktop-header container desktop-only">
          {/* Right: Store Logo */}
          <Link href="/" className="site-logo">
            <Image 
              src="https://lightgrey-flamingo-522119.hostingersite.com/wp-content/uploads/2026/02/sahbavape.webp" 
              alt="سحبة فيب" 
              width={400}
              height={120}
              priority
            />
          </Link>

          {/* Center: Navigation Links */}
          <nav className="nav-links">
            <Link href="/" className={pathname === "/" ? "active-link" : ""}>
              الرئيسية
            </Link>

            {CATEGORIES_CONFIG.map((cat) => {
              const hasSubs = cat.subcategories && cat.subcategories.length > 0;
              const isActive = pathname.startsWith(cat.url) || 
                (cat.subcategories?.some(sub => pathname.startsWith(sub.url)));

              if (hasSubs) {
                return (
                  <div key={cat.slug} className="nav-dropdown-wrapper">
                    <Link
                      href={cat.url}
                      className={`nav-dropdown-trigger ${isActive ? "active-link" : ""}`}
                    >
                      {cat.name}
                      <span className="dropdown-arrow">▼</span>
                    </Link>
                    <div className="nav-dropdown-menu">
                      {cat.subcategories?.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={sub.url}
                          className={pathname === sub.url ? "active-sub-link" : ""}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={cat.slug}
                  href={cat.url}
                  className={pathname === cat.url ? "active-link" : ""}
                >
                  {cat.name}
                </Link>
              );
            })}
          </nav>

          {/* Left: Actions */}
          <div className="header-actions">
            {/* Search Icon */}
            <button
              onClick={() => router.push("/search")}
              className="icon-btn"
              aria-label="البحث عن منتج"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            {/* Cart Icon */}
            <button 
              onClick={() => setIsMiniCartOpen(true)}
              className="icon-btn" 
              aria-label="سلة التسوق"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <CartBadge />
            </button>
          </div>
        </div>

        {/* Mobile View */}
        <div className="mobile-header container mobile-only">
          <div className="right-col">
            <button
              className="icon-btn mobile-menu-toggle"
              onClick={toggleDrawer}
              aria-label="قائمة الأقسام"
              aria-expanded={isDrawerOpen}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="center-col">
            <Link href="/" className="site-logo">
              <Image 
                src="https://lightgrey-flamingo-522119.hostingersite.com/wp-content/uploads/2026/02/sahbavape.webp" 
                alt="سحبة فيب" 
                width={400}
                height={120}
                priority
              />
            </Link>
          </div>

          <div className="left-col">
            <button
              onClick={() => router.push("/search")}
              className="icon-btn"
              aria-label="البحث عن منتج"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ─── MOBILE DRAWER MENU ─── */}
      {isDrawerOpen && (
        <DynamicMobileDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onOpenCart={() => {
            setIsDrawerOpen(false);
            setIsMiniCartOpen(true);
          }}
        />
      )}

      {/* ─── MINI-CART DRAWER ─── */}
      {isMiniCartOpen && (
        <DynamicMiniCartDrawer
          isOpen={isMiniCartOpen}
          onClose={() => setIsMiniCartOpen(false)}
        />
      )}
    </>
  );
}
