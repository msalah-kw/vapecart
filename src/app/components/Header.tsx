"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CartBadge from "@/app/components/CartBadge";
import { CATEGORIES_CONFIG, CategoryNode } from "@/lib/navigation";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [expandedDropdowns, setExpandedDropdowns] = useState<Record<string, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const { cart, loading, updateQuantity, removeItem, cartItemsCount } = useCart();

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
      <header className={`site-header ${isScrolled ? "scrolled" : ""}`}>
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
            <button 
              onClick={() => setIsMiniCartOpen(true)}
              className="header-cart-link header-cart-button" 
              aria-label="سلة التسوق"
            >
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
            </button>
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
          <button 
            onClick={() => {
              setIsDrawerOpen(false);
              setIsMiniCartOpen(true);
            }}
            className={`drawer-nav-item drawer-cart-button ${pathname === "/cart" ? "active" : ""}`}
            style={{ width: "100%", background: "none", border: "none", textAlign: "right", cursor: "pointer" }}
          >
            <span className="item-icon">🛒</span>
            سلة التسوق
          </button>
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

      {/* ─── MINI-CART DRAWER ─── */}
      <div 
        className={`minicart-drawer-overlay ${isMiniCartOpen ? "open" : ""}`} 
        onClick={() => setIsMiniCartOpen(false)} 
      />
      
      <aside className={`minicart-drawer ${isMiniCartOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="minicart-title-container" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700" }}>سلة التسوق</h3>
            <span className="minicart-item-count" style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>({cartItemsCount})</span>
          </div>
          <button className="drawer-close" onClick={() => setIsMiniCartOpen(false)} aria-label="إغلاق السلة">
            ✕
          </button>
        </div>

        <div className="minicart-body" style={{ flex: 1, overflowY: "auto", padding: "var(--space-md) var(--space-lg)" }}>
          {loading && !cart ? (
            <div className="minicart-loading" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--color-text-muted)" }}>
              <span className="spinner"></span>
              <p>جاري تحميل السلة...</p>
            </div>
          ) : !cart || cart.contents.nodes.length === 0 ? (
            <div className="minicart-empty" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "var(--space-md)", color: "var(--color-text-muted)" }}>
              <span className="empty-cart-icon" style={{ fontSize: "3rem" }}>🛒</span>
              <p>السلة فارغة حالياً</p>
              <button 
                onClick={() => setIsMiniCartOpen(false)}
                className="btn btn-primary"
              >
                ابدأ التسوق
              </button>
            </div>
          ) : (
            <div className="minicart-items" style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              {cart.contents.nodes.map((item) => {
                const productNode = item.product.node;
                const isVariable = !!item.variation;
                const itemImage = isVariable ? item.variation?.node.image?.sourceUrl || productNode.image?.sourceUrl : productNode.image?.sourceUrl;
                const itemName = productNode.name;
                const variationName = isVariable ? item.variation?.node.name : "";
                
                const attributes = item.variation?.attributes || [];

                return (
                  <div key={item.key} className="minicart-item" style={{ display: "flex", gap: "var(--space-md)", borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-md)", position: "relative" }}>
                    <div className="minicart-item-image" style={{ width: "70px", height: "70px", borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--color-surface)", flexShrink: 0 }}>
                      {itemImage ? (
                        <img src={itemImage} alt={itemName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div className="minicart-image-placeholder" style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)" }}>📦</div>
                      )}
                    </div>

                    <div className="minicart-item-details" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                      <h4 className="minicart-item-name" style={{ fontSize: "var(--font-size-sm)", fontWeight: "600", color: "var(--color-text-primary)", margin: 0, paddingRight: "20px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.4" }}>{itemName}</h4>
                      {isVariable && attributes.length > 0 && (
                        <div className="minicart-item-meta" style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "2px" }}>
                          {attributes.map((attr) => (
                            <span key={attr.name} className="minicart-meta-pill" style={{ fontSize: "10px", background: "var(--color-surface)", color: "var(--color-text-secondary)", padding: "2px 6px", borderRadius: "var(--radius-sm)" }}>
                              {attr.label || attr.name.replace("pa_", "")}: {attr.value}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="minicart-item-price-qty" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "var(--space-xs)" }}>
                        <div className="minicart-qty-control" style={{ display: "flex", alignItems: "center", background: "var(--color-surface)", borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--color-border)" }}>
                          <button
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="qty-btn"
                            style={{ background: "none", border: "none", padding: "4px 8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                          >
                            −
                          </button>
                          <span className="qty-val" style={{ padding: "0 6px", fontSize: "12px", fontWeight: "600", minWidth: "16px", textAlign: "center" }}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            className="qty-btn"
                            style={{ background: "none", border: "none", padding: "4px 8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                          >
                            +
                          </button>
                        </div>
                        
                        <span className="minicart-item-price" style={{ fontSize: "var(--font-size-sm)", fontWeight: "700", color: "var(--color-price)" }}>
                          {item.total}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => removeItem(item.key)}
                      className="minicart-item-remove"
                      aria-label="حذف"
                      style={{ position: "absolute", top: 0, left: 0, background: "none", border: "none", fontSize: "12px", cursor: "pointer", color: "var(--color-text-muted)", padding: "4px" }}
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cart && cart.contents.nodes.length > 0 && (
          <div className="minicart-footer" style={{ padding: "var(--space-lg)", borderTop: "1px solid var(--color-border)", background: "var(--color-bg-card)", display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <div className="minicart-subtotal" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--font-size-base)" }}>
              <span>المجموع الفرعي:</span>
              <strong style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--color-price)" }}>{cart.subtotal}</strong>
            </div>
            
            <div className="minicart-actions" style={{ display: "flex", gap: "var(--space-sm)" }}>
              <Link 
                href="/cart" 
                className="btn btn-outline minicart-btn-cart"
                onClick={() => setIsMiniCartOpen(false)}
                style={{ flex: 1 }}
              >
                عرض السلة
              </Link>
              <Link 
                href="/checkout" 
                className="btn btn-primary minicart-btn-checkout"
                onClick={() => setIsMiniCartOpen(false)}
                style={{ flex: 1 }}
              >
                إتمام الطلب
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
