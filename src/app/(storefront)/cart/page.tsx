'use client';

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { cleanPrice } from "@/lib/graphql";

// Arabic terminology cleanser for WooCommerce values
function sanitizeArabic(text: string): string {
  if (!text) return "";
  return text
    .replace(/تبريد/g, "ايس")
    .replace(/موشة/g, "سحبة")
    .replace(/حسب التوفر/g, "")
    .replace(/غيومك/g, "")
    .replace(/Ikon/gi, "Icon")
    .replace(/بطيخ/g, "رقي")
    .replace(/خراطيش/g, "بودات")
    .replace(/السائل الالكتروني/g, "النكهة")
    .replace(/أنظمة البود/g, "بودات")
    .replace(/بنك طاقة/gi, "باور بانك");
}

export default function CartPage() {
  const { cart, loading, updateQuantity, removeItem } = useCart();

  const items = cart?.contents?.nodes || [];
  const hasItems = items.length > 0;

  const handleQtyChange = async (key: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    await updateQuantity(key, newQty);
  };

  const cleanCartPrice = (priceHtml: string | null) => {
    const cleaned = cleanPrice(priceHtml);
    return cleaned ? parseFloat(cleaned).toFixed(3) : "0.000";
  };

  return (
    <main className="cart-page-container container">
      <h1 className="cart-page-title">سلة المشتريات</h1>

      {loading && !hasItems ? (
        <div className="cart-loading-state">
          <div className="spinner"></div>
          <p>جاري تحميل السلة...</p>
        </div>
      ) : !hasItems ? (
        <div className="cart-empty-card">
          <div className="cart-empty-icon" aria-hidden="true">🛒</div>
          <h2>سلة المشتريات فارغة حالياً</h2>
          <p>هل تبحث عن سحبة جديدة، نكهة مميزة، أو كويل؟ لدينا تشكيلة مميزة بانتظارك.</p>
          <Link href="/shop" className="cart-empty-cta">
            تصفح المنتجات
          </Link>
        </div>
      ) : (
        <div className="cart-grid">
          {/* Cart Items List */}
          <div className="cart-items-section">
            <div className="cart-items-list">
              {items.map((item) => {
                const product = item.product?.node;
                if (!product) return null;
                const variation = item.variation?.node;
                const name = sanitizeArabic(variation ? variation.name : product.name);
                
                // Get item details
                const featuredImage = variation?.image?.sourceUrl || product.image?.sourceUrl;
                const itemPrice = cleanCartPrice(variation ? variation.price : product.price);
                const itemSubtotal = cleanCartPrice(item.subtotal);
                
                // Attributes
                const attributes = item.variation?.attributes || [];

                return (
                  <div key={item.key} className={`cart-item-row ${loading ? "loading-active" : ""}`}>
                    {/* Image */}
                    <div className="cart-item-image">
                      {featuredImage ? (
                        <Image
                          src={featuredImage}
                          alt={name}
                          fill
                          unoptimized
                          sizes="100px"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div className="cart-item-placeholder" aria-hidden="true">📦</div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="cart-item-details">
                      <h3 className="cart-item-name">
                        <Link href={`/product/${product.slug}`}>{name}</Link>
                      </h3>
                      
                      {attributes.length > 0 && (
                        <div className="cart-item-attributes">
                          {attributes.map((attr) => (
                            <span key={attr.name} className="cart-item-attribute-tag">
                              {attr.label || attr.name.replace("pa_", "")}: <strong>{sanitizeArabic(attr.value)}</strong>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="cart-item-price-unit">
                        السعر: {itemPrice} د.ك
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="cart-item-actions">
                      <div className="quantity-selector cart-qty">
                        <button
                          type="button"
                          className="quantity-btn"
                          onClick={() => handleQtyChange(item.key, item.quantity, -1)}
                          disabled={item.quantity <= 1 || loading}
                          aria-label="تقليل الكمية"
                        >
                          −
                        </button>
                        <span className="quantity-val-display" aria-label="الكمية">{item.quantity}</span>
                        <button
                          type="button"
                          className="quantity-btn"
                          onClick={() => handleQtyChange(item.key, item.quantity, 1)}
                          disabled={loading}
                          aria-label="زيادة الكمية"
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-subtotal">
                        المجموع: <span>{itemSubtotal} د.ك</span>
                      </div>

                      <button
                        type="button"
                        className="cart-item-remove"
                        onClick={() => removeItem(item.key)}
                        disabled={loading}
                        aria-label="إزالة المنتج"
                      >
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart Summary Card */}
          <div className="cart-summary-section">
            <div className="cart-summary-card">
              <h2 className="summary-title">ملخص الطلب</h2>

              <div className="summary-row">
                <span>المجموع الفرعي</span>
                <span>{cleanCartPrice(cart?.subtotal || "0.000")} د.ك</span>
              </div>

              <div className="summary-row shipping">
                <span>الشحن</span>
                <span className="shipping-note">توصيل سريع (يتم حسابه عند الدفع)</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total">
                <span>الإجمالي الكلي</span>
                <span className="total-val">{cleanCartPrice(cart?.total || "0.000")} د.ك</span>
              </div>

              <Link href="/checkout" className="checkout-btn">
                المتابعة لإتمام الطلب
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
              </Link>

              <div className="shipping-info-box">
                <span className="info-box-icon">⚡️</span>
                <p>توصيل سريع لجميع مناطق الكويت خلال ساعات قليلة من إتمام الطلب.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
