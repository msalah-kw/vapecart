'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
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
  product?: {
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
  } | null;
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

export interface ToastItem {
  name: string;
  image: string | null;
  price: string | null;
  quantity: number;
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
  showCartToast: boolean;
  toastItem: ToastItem | null;
  dismissCartToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "vapecart_woocommerce_session";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionToken, setSessionToken] = useState<string | undefined>(undefined);
  const [showCartToast, setShowCartToast] = useState(false);
  const [toastItem, setToastItem] = useState<ToastItem | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronize and update session token in localStorage and state
  const handleSessionToken = useCallback((newToken: string | null, clearSession?: boolean) => {
    if (clearSession) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setSessionToken(undefined);
    }
    if (newToken) {
      localStorage.setItem(LOCAL_STORAGE_KEY, newToken);
      setSessionToken(newToken);
    }
  }, []);

  // Sync token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEY) || undefined;
    setSessionToken(token);
    
    // Load initial cart details
    const initCart = async () => {
      setLoading(true);
      const res = await getCartAction(token);
      handleSessionToken(res.sessionToken, res.clearSession);
      
      if (res.success && res.cart) {
        setCart(res.cart);
      }
      setLoading(false);
    };

    initCart();
  }, [handleSessionToken]);

  const refreshCart = async () => {
    setLoading(true);
    const res = await getCartAction(sessionToken);
    handleSessionToken(res.sessionToken, res.clearSession);
    
    if (res.success && res.cart) {
      setCart(res.cart);
    }
    setLoading(false);
  };

  const dismissCartToast = useCallback(() => {
    setShowCartToast(false);
  }, []);

  const showToast = useCallback((item: ToastItem) => {
    // Clear any existing timer
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastItem(item);
    setShowCartToast(true);
    toastTimerRef.current = setTimeout(() => {
      setShowCartToast(false);
    }, 3000);
  }, []);

  const addToCart = async (productId: number, quantity: number, variationId?: number) => {
    setLoading(true);
    const res = await addToCartAction(productId, quantity, variationId, sessionToken);
    handleSessionToken(res.sessionToken, res.clearSession);
    
    if (res.success && res.cart) {
      setCart(res.cart);

      // Find the just-added item from the updated cart to build the toast
      const addedNode = res.cart.contents.nodes.find(
        (n: CartItem) => n.product?.node?.databaseId === productId
      );
      if (addedNode && addedNode.product?.node) {
        const p = addedNode.product.node;
        showToast({
          name: p.name,
          image: p.image?.sourceUrl || null,
          price: p.price,
          quantity,
        });
      }

      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const updateQuantity = async (key: string, quantity: number) => {
    setLoading(true);
    const res = await updateCartQuantityAction(key, quantity, sessionToken);
    handleSessionToken(res.sessionToken, res.clearSession);
    
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
    handleSessionToken(res.sessionToken, res.clearSession);
    
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
        showCartToast,
        toastItem,
        dismissCartToast,
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
