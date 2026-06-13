'use client';

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getCartAction,
  addToCartAction,
  updateCartQuantityAction,
  removeFromCartAction,
} from "@/app/actions/cart";

export interface CartItem {
  key: string;
  quantity: number;
  subtotal: string;
  total: string;
  product: {
    node: {
      id: string;
      databaseId: number;
      slug: string;
      name: string;
      image: {
        sourceUrl: string;
        altText: string;
      } | null;
      price: string | null;
      regularPrice: string | null;
    };
  };
  variation?: {
    node: {
      id: string;
      databaseId: number;
      name: string;
      price: string | null;
      regularPrice: string | null;
      image: {
        sourceUrl: string;
        altText: string;
      } | null;
    };
    attributes?: {
      name: string;
      label: string | null;
      value: string;
    }[] | null;
  } | null;
}

export interface CartData {
  contents: {
    nodes: CartItem[];
  };
  subtotal: string;
  total: string;
}

interface CartContextType {
  cart: CartData | null;
  loading: boolean;
  cartItemsCount: number;
  addToCart: (productId: number, quantity: number, variationId?: number) => Promise<boolean>;
  updateQuantity: (key: string, quantity: number) => Promise<boolean>;
  removeItem: (key: string) => Promise<boolean>;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "vapecart_woocommerce_session";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionToken, setSessionToken] = useState<string | undefined>(undefined);

  // Sync token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEY) || undefined;
    setSessionToken(token);
    
    // Load initial cart details
    const initCart = async () => {
      setLoading(true);
      const res = await getCartAction(token);
      if (res.success && res.cart) {
        setCart(res.cart);
      }
      if (res.sessionToken && res.sessionToken !== token) {
        localStorage.setItem(LOCAL_STORAGE_KEY, res.sessionToken);
        setSessionToken(res.sessionToken);
      }
      setLoading(false);
    };

    initCart();
  }, []);

  const updateSessionToken = (token: string | null) => {
    if (token && token !== sessionToken) {
      localStorage.setItem(LOCAL_STORAGE_KEY, token);
      setSessionToken(token);
    }
  };

  const refreshCart = async () => {
    setLoading(true);
    const res = await getCartAction(sessionToken);
    if (res.success && res.cart) {
      setCart(res.cart);
    }
    updateSessionToken(res.sessionToken);
    setLoading(false);
  };

  const addToCart = async (productId: number, quantity: number, variationId?: number) => {
    setLoading(true);
    const res = await addToCartAction(productId, quantity, variationId, sessionToken);
    updateSessionToken(res.sessionToken);
    
    if (res.success && res.cart) {
      setCart(res.cart);
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const updateQuantity = async (key: string, quantity: number) => {
    setLoading(true);
    const res = await updateCartQuantityAction(key, quantity, sessionToken);
    updateSessionToken(res.sessionToken);
    
    if (res.success && res.cart) {
      setCart(res.cart);
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const removeItem = async (key: string) => {
    setLoading(true);
    const res = await removeFromCartAction([key], sessionToken);
    updateSessionToken(res.sessionToken);
    
    if (res.success && res.cart) {
      setCart(res.cart);
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const clearCart = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setCart(null);
    setSessionToken(undefined);
  };

  // Compute total item count in the cart
  const cartItemsCount = cart?.contents?.nodes?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartItemsCount,
        addToCart,
        updateQuantity,
        removeItem,
        refreshCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
