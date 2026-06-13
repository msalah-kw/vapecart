'use client';

import { useCart } from "@/context/CartContext";

export default function CartBadge() {
  const { cartItemsCount } = useCart();

  if (cartItemsCount === 0) return null;

  return <span className="header-cart-badge">{cartItemsCount}</span>;
}
