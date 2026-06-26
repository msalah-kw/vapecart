'use client';

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { cleanPrice } from "@/lib/formatters";

export default function CartToast() {
  const { showCartToast, toastItem, dismissCartToast, cartItemsCount } = useCart();

  if (!showCartToast || !toastItem) return null;

  const price = cleanPrice(toastItem.price);

  return (
    <div className={`cart-toast ${showCartToast ? "visible" : ""}`} role="alert">
      <button
        className="cart-toast-close"
        onClick={dismissCartToast}
        aria-label="إغلاق"
      >
        ✕
      </button>

      <div className="cart-toast-header">
        <svg className="cart-toast-check" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
        <span>تمت الإضافة إلى السلة</span>
      </div>

      <div className="cart-toast-body">
        {toastItem.image && (
          <div className="cart-toast-image">
            <img src={toastItem.image} alt={toastItem.name} />
          </div>
        )}
        <div className="cart-toast-info">
          <p className="cart-toast-name">{toastItem.name}</p>
          <p className="cart-toast-meta">
            {toastItem.quantity > 1 && (
              <span className="cart-toast-qty">الكمية: {toastItem.quantity}</span>
            )}
            {price && (
              <span className="cart-toast-price">{price} د.ك</span>
            )}
          </p>
        </div>
      </div>

      <div className="cart-toast-actions">
        <Link href="/cart" className="cart-toast-btn cart-toast-btn-primary" onClick={dismissCartToast}>
          عرض السلة ({cartItemsCount})
        </Link>
        <Link href="/checkout" className="cart-toast-btn cart-toast-btn-outline" onClick={dismissCartToast}>
          إتمام الشراء
        </Link>
      </div>
    </div>
  );
}
