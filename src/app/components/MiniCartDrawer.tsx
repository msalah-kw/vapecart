"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

// Helper to safely URL-decode values (avoiding URIError)
function safeDecode(str: string): string {
  if (!str) return "";
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
}

// Helper to clean up WordPress slug corruption on attributes (e.g., cf%89-0-8 or cf-0-8 -> 0.8)
function cleanAttributeLabel(val: string): string {
  if (!val) return "";
  let decoded = safeDecode(val);
  
  let clean = decoded
    .replace(/cf%89-/gi, "")
    .replace(/cf\u0089-/gi, "")
    .replace(/cf\x89-/gi, "")
    .replace(/cf-/gi, "")
    .replace(/omega-/gi, "")
    .replace(/ohm-/gi, "");
    
  clean = clean.replace(/(\d+)-(\d+)/g, "$1.$2");
  
  // Replace hyphens and underscores with space to make slugs human-readable (e.g. blueberry-gum -> blueberry gum)
  clean = clean.replace(/[-_]/g, " ");
  
  return clean;
}

import { cleanPrice } from "@/lib/formatters";

function CartItemSkeleton() {
  return (
    <div className="minicart-item skeleton-active" style={{ display: "flex", gap: "var(--space-md)", borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-md)", position: "relative" }}>
      <div className="skeleton skeleton-img" style={{ width: "70px", height: "70px", borderRadius: "var(--radius-md)", flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", justifyContent: "center" }}>
        <div className="skeleton skeleton-text" style={{ width: "80%", height: "14px" }} />
        <div className="skeleton skeleton-text" style={{ width: "40%", height: "12px" }} />
      </div>
    </div>
  );
}

interface MiniCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MiniCartDrawer({ isOpen, onClose }: MiniCartDrawerProps) {
  const { cart, loading, updateQuantity, removeItem, cartItemsCount } = useCart();
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

  return (
    <>
      <div 
        className={`minicart-drawer-overlay ${isOpen && isTransitionActive ? "open" : ""}`} 
        onClick={onClose} 
      />
      
      <aside className={`minicart-drawer ${isOpen && isTransitionActive ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="minicart-title-container" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700" }}>سلة التسوق</h3>
            <span className="minicart-item-count" style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>({cartItemsCount})</span>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="إغلاق السلة">
            ✕
          </button>
        </div>

        <div className="minicart-body" style={{ flex: 1, overflowY: "auto", padding: "var(--space-md) var(--space-lg)" }}>
          {loading && !cart ? (
            <div className="minicart-skeletons" style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              <CartItemSkeleton />
              <CartItemSkeleton />
              <CartItemSkeleton />
            </div>
          ) : !cart || cart.contents.nodes.length === 0 ? (
            <div className="minicart-empty" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "var(--space-md)", color: "var(--color-text-muted)" }}>
              <span className="empty-cart-icon" style={{ fontSize: "3rem" }}>🛒</span>
              <p>السلة فارغة حالياً</p>
              <button 
                onClick={onClose}
                className="btn btn-primary"
              >
                ابدأ التسوق
              </button>
            </div>
          ) : (
            <div className="minicart-items" style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              {cart.contents.nodes.map((item) => {
                const productNode = item.product?.node;
                if (!productNode) return null;
                const isVariable = !!item.variation;
                const itemImage = isVariable ? item.variation?.node?.image?.sourceUrl || productNode.image?.sourceUrl : productNode.image?.sourceUrl;
                const itemName = productNode.name;
                
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
                            <span key={attr.name} className="minicart-meta-pill">
                              {attr.label || attr.name.replace("pa_", "")}: {cleanAttributeLabel(attr.value)}
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
                          {cleanPrice(item.total) || "0.000"}
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
              <strong style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--color-price)" }}>{cleanPrice(cart.subtotal) || "0.000"}</strong>
            </div>
            
            <div className="minicart-actions" style={{ display: "flex", gap: "var(--space-sm)" }}>
              <Link 
                href="/cart" 
                className="btn btn-outline minicart-btn-cart"
                onClick={onClose}
                style={{ flex: 1 }}
              >
                عرض السلة
              </Link>
              <Link 
                href="/checkout" 
                className="btn btn-primary minicart-btn-checkout"
                onClick={onClose}
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
