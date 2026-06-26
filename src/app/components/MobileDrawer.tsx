"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CATEGORIES_CONFIG } from "@/lib/navigation";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCart: () => void;
}

export default function MobileDrawer({ isOpen, onClose, onOpenCart }: MobileDrawerProps) {
  const pathname = usePathname();
  const [expandedDropdowns, setExpandedDropdowns] = useState<Record<string, boolean>>({});
  const [isTransitionActive, setIsTransitionActive] = useState(false);

  // Trigger CSS transition after mounting
  useEffect(() => {
    if (isOpen) {
      const frame = requestAnimationFrame(() => setIsTransitionActive(true));
      return () => cancelAnimationFrame(frame);
    } else {
      setIsTransitionActive(false);
    }
  }, [isOpen]);

  const toggleDropdown = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedDropdowns((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      <div 
        className={`mobile-drawer-overlay ${isOpen && isTransitionActive ? "open" : ""}`} 
        onClick={onClose} 
      />
      
      <aside className={`mobile-drawer ${isOpen && isTransitionActive ? "open" : ""}`}>
        <div className="drawer-header">
          <Link href="/" className="site-logo" onClick={handleLinkClick}>
            <Image 
              src="https://lightgrey-flamingo-522119.hostingersite.com/wp-content/uploads/2026/02/sahbavape.webp" 
              alt="سحبة فيب" 
              width={400}
              height={120}
              unoptimized
            />
          </Link>
          <button className="drawer-close" onClick={onClose} aria-label="إغلاق القائمة">
            ✕
          </button>
        </div>

        <nav className="drawer-nav">
          <Link href="/" className={`drawer-nav-item ${pathname === "/" ? "active" : ""}`} onClick={handleLinkClick}>
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
                    <Link href={cat.url} className="drawer-accordion-link" onClick={handleLinkClick}>
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
                        onClick={handleLinkClick}
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
                onClick={handleLinkClick}
              >
                {cat.name}
              </Link>
            );
          })}

          <div className="drawer-divider">الحساب والسلة</div>
          <button 
            onClick={() => {
              onClose();
              onOpenCart();
            }}
            className={`drawer-nav-item drawer-cart-button ${pathname === "/cart" ? "active" : ""}`}
            style={{ width: "100%", background: "none", border: "none", textAlign: "right", cursor: "pointer" }}
          >
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
    </>
  );
}
