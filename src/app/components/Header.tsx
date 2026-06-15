"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CartBadge from "@/app/components/CartBadge";
import { CATEGORIES_CONFIG, CategoryNode } from "@/lib/navigation";

export default function Header() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [expandedDropdowns, setExpandedDropdowns] = useState<Record<string, boolean>>({});

  // Close drawer on path change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const toggleDropdown = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedDropdowns((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  return (
    <>
      {/* ─── DESKTOP & MOBILE HEADER ─── */}
      <header className="site-header">
        <div className="header-inner">
          {/* Mobile: Hamburger Button */}
          <button
            className={`mobile-menu-toggle ${isDrawerOpen ? "active" : ""}`}
            onClick={toggleDrawer}
            aria-label="قائمة الأقسام"
            aria-expanded={isDrawerOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          {/* Logo */}
          <Link href="/" className="site-logo">
            <img src="https://lightgrey-flamingo-522119.hostingersite.com/wp-content/uploads/2026/02/sahbavape.webp" alt="سحبة فيب" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="nav-links desktop-only">
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
                          <span className="sub-icon">{sub.icon}</span>
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

          {/* Actions: Cart Icon */}
          <div className="header-actions">
            <Link href="/cart" className="header-cart-link" aria-label="سلة التسوق">
              <span className="cart-icon-wrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <CartBadge />
              </span>
              <span className="cart-text desktop-only">السلة</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── MOBILE DRAWER MENU ─── */}
      <div className={`mobile-drawer-overlay ${isDrawerOpen ? "open" : ""}`} onClick={toggleDrawer} />
      
      <aside className={`mobile-drawer ${isDrawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <Link href="/" className="site-logo" onClick={toggleDrawer}>
            <img src="https://lightgrey-flamingo-522119.hostingersite.com/wp-content/uploads/2026/02/sahbavape.webp" alt="سحبة فيب" />
          </Link>
          <button className="drawer-close" onClick={toggleDrawer} aria-label="إغلاق القائمة">
            ✕
          </button>
        </div>

        <nav className="drawer-nav">
          <Link href="/" className={`drawer-nav-item ${pathname === "/" ? "active" : ""}`}>
            <span className="item-icon">🏠</span>
            الرئيسية
          </Link>

          <div className="drawer-divider">الأقسام</div>

          {CATEGORIES_CONFIG.map((cat) => {
            const hasSubs = cat.subcategories && cat.subcategories.length > 0;
            const isExpanded = !!expandedDropdowns[cat.slug];
            const isActive = pathname.startsWith(cat.url) || 
              (cat.subcategories?.some(sub => pathname.startsWith(sub.url)));

            if (hasSubs) {
              return (
                <div key={cat.slug} className={`drawer-accordion ${isExpanded ? "expanded" : ""}`}>
                  <div className={`drawer-accordion-header ${isActive ? "active" : ""}`}>
                    <Link href={cat.url} className="drawer-accordion-link">
                      <span className="item-icon">{cat.icon}</span>
                      {cat.name}
                    </Link>
                    <button 
                      className="drawer-accordion-toggle" 
                      onClick={(e) => toggleDropdown(cat.slug, e)}
                      aria-label="توسيع القسم"
                    >
                      <span className="accordion-arrow">▼</span>
                    </button>
                  </div>
                  <div className="drawer-accordion-content">
                    {cat.subcategories?.map((sub) => (
                      <Link
                        key={sub.slug}
                        href={sub.url}
                        className={`drawer-sub-item ${pathname === sub.url ? "active" : ""}`}
                      >
                        <span className="sub-icon">{sub.icon}</span>
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
                className={`drawer-nav-item ${pathname === cat.url ? "active" : ""}`}
              >
                <span className="item-icon">{cat.icon}</span>
                {cat.name}
              </Link>
            );
          })}

          <div className="drawer-divider">الحساب والسلة</div>
          <Link href="/cart" className={`drawer-nav-item ${pathname === "/cart" ? "active" : ""}`}>
            <span className="item-icon">🛒</span>
            سلة التسوق
          </Link>
        </nav>

        <div className="drawer-footer">
          <p>توصيل سريع لجميع مناطق الكويت 🇰🇼</p>
          <div className="drawer-contact">
            <span>الدعم الفني والطلب السريع:</span>
            <a href="https://wa.me/96512345678" target="_blank" rel="noopener noreferrer">
              💬 واتساب
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
