"use server";

import { cookies } from "next/headers";
import {
  fetchGraphQL,
  GET_CART_QUERY,
  ADD_TO_CART_MUTATION,
  UPDATE_CART_QUANTITY_MUTATION,
  REMOVE_FROM_CART_MUTATION,
  CHECKOUT_MUTATION,
} from "@/lib/graphql";

/**
 * Clear WooCommerce/JWT cookies on the server
 */
async function clearSessionCookies() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("woocommerce-session");
    cookieStore.delete("wp_jwt");
    cookieStore.delete("woo-session");
  } catch (err) {
    console.error("[clearSessionCookies] Error deleting cookies:", err);
  }
}

export async function getCartAction(sessionToken?: string) {
  try {
    const { data, sessionToken: newSessionToken } = await fetchGraphQL(
      GET_CART_QUERY,
      {},
      sessionToken
    );
    return {
      success: true,
      cart: data?.cart || null,
      sessionToken: newSessionToken || sessionToken || null,
    };
  } catch (error: any) {
    if (error.message === "TOKEN_EXPIRED") {
      console.warn("getCartAction: Token expired. Clearing cookies and retrying as guest session...");
      await clearSessionCookies();
      try {
        const { data, sessionToken: newSessionToken } = await fetchGraphQL(
          GET_CART_QUERY,
          {},
          undefined
        );
        return {
          success: true,
          cart: data?.cart || null,
          sessionToken: newSessionToken || null,
          clearSession: true,
        };
      } catch (retryError: any) {
        console.error("getCartAction retry failed:", retryError);
        return {
          success: false,
          error: "فشلت عملية جلب السلة بعد انتهاء الصلاحية",
          sessionToken: null,
          clearSession: true,
        };
      }
    }

    console.error("getCartAction error:", error);
    return {
      success: false,
      error: error.message || "فشلت عملية جلب السلة",
      sessionToken: sessionToken || null,
    };
  }
}

export async function addToCartAction(
  productId: number,
  quantity: number,
  variationId?: number,
  sessionToken?: string
) {
  try {
    const { data, sessionToken: newSessionToken } = await fetchGraphQL(
      ADD_TO_CART_MUTATION,
      { productId, quantity, variationId },
      sessionToken
    );
    
    // After adding to cart, let's fetch the updated cart automatically
    const updatedCart = await getCartAction(newSessionToken || sessionToken);
    
    return {
      success: true,
      cartItem: data?.addToCart?.cartItem || null,
      cart: updatedCart.cart,
      sessionToken: newSessionToken || updatedCart.sessionToken || sessionToken || null,
    };
  } catch (error: any) {
    if (error.message === "TOKEN_EXPIRED") {
      console.warn("addToCartAction: Token expired. Clearing cookies and retrying as guest session...");
      await clearSessionCookies();
      try {
        const { data, sessionToken: newSessionToken } = await fetchGraphQL(
          ADD_TO_CART_MUTATION,
          { productId, quantity, variationId },
          undefined
        );
        
        // Fetch cart using the new guest token
        const updatedCart = await getCartAction(newSessionToken || undefined);
        
        return {
          success: true,
          cartItem: data?.addToCart?.cartItem || null,
          cart: updatedCart.cart,
          sessionToken: newSessionToken || updatedCart.sessionToken || null,
          clearSession: true,
        };
      } catch (retryError: any) {
        console.error("addToCartAction retry failed:", retryError);
        return {
          success: false,
          error: "فشلت إضافة المنتج بعد انتهاء صلاحية الجلسة",
          sessionToken: null,
          clearSession: true,
        };
      }
    }

    console.error("addToCartAction error:", error);
    return {
      success: false,
      error: error.message || "فشلت عملية إضافة المنتج إلى السلة",
      sessionToken: sessionToken || null,
    };
  }
}

export async function updateCartQuantityAction(
  key: string,
  quantity: number,
  sessionToken?: string
) {
  try {
    const { data, sessionToken: newSessionToken } = await fetchGraphQL(
      UPDATE_CART_QUANTITY_MUTATION,
      { key, quantity },
      sessionToken
    );
    
    const updatedCart = await getCartAction(newSessionToken || sessionToken);
    
    return {
      success: true,
      cart: updatedCart.cart,
      sessionToken: newSessionToken || updatedCart.sessionToken || sessionToken || null,
    };
  } catch (error: any) {
    if (error.message === "TOKEN_EXPIRED") {
      console.warn("updateCartQuantityAction: Token expired. Clearing session...");
      await clearSessionCookies();
      return {
        success: false,
        error: "expired_session",
        clearSession: true,
        sessionToken: null,
      };
    }

    console.error("updateCartQuantityAction error:", error);
    return {
      success: false,
      error: error.message || "فشلت عملية تحديث الكمية",
      sessionToken: sessionToken || null,
    };
  }
}

export async function removeFromCartAction(
  keys: string[],
  sessionToken?: string
) {
  try {
    const { data, sessionToken: newSessionToken } = await fetchGraphQL(
      REMOVE_FROM_CART_MUTATION,
      { keys },
      sessionToken
    );
    
    const updatedCart = await getCartAction(newSessionToken || sessionToken);
    
    return {
      success: true,
      cart: updatedCart.cart,
      sessionToken: newSessionToken || updatedCart.sessionToken || sessionToken || null,
    };
  } catch (error: any) {
    if (error.message === "TOKEN_EXPIRED") {
      console.warn("removeFromCartAction: Token expired. Clearing session...");
      await clearSessionCookies();
      return {
        success: false,
        error: "expired_session",
        clearSession: true,
        sessionToken: null,
      };
    }

    console.error("removeFromCartAction error:", error);
    return {
      success: false,
      error: error.message || "فشلت عملية إزالة المنتج من السلة",
      sessionToken: sessionToken || null,
    };
  }
}

export async function checkoutAction(
  firstName: string,
  lastName: string,
  phone: string,
  address1: string,
  city: string,
  sessionToken?: string,
  email?: string,
  shippingArea?: string,
  shippingFee?: number
) {
  try {
    const finalEmail = email || `${phone}@vapecart.local`;

    const input: Record<string, unknown> = {
      clientMutationId: "vapecart-checkout",
      billing: {
        firstName,
        lastName,
        phone,
        address1,
        city,
        country: "KW",
        email: finalEmail,
      },
      shipping: {
        firstName,
        lastName,
        phone,
        address1,
        city,
        country: "KW",
      },
      paymentMethod: "cod",
      shipToDifferentAddress: false,
      metaData: [
        { key: "shipping_area", value: shippingArea || "" },
        { key: "shipping_fee", value: String(shippingFee ?? 0) },
      ],
    };

    const { data, sessionToken: newSessionToken } = await fetchGraphQL(
      CHECKOUT_MUTATION,
      { input },
      sessionToken
    );

    return {
      success: true,
      order: data?.checkout?.order || null,
      result: data?.checkout?.result || null,
      sessionToken: newSessionToken || sessionToken || null,
    };
  } catch (error: any) {
    if (error.message === "TOKEN_EXPIRED") {
      console.warn("checkoutAction: Token expired. Clearing session...");
      await clearSessionCookies();
      return {
        success: false,
        error: "expired_session",
        clearSession: true,
        sessionToken: null,
      };
    }

    console.error("checkoutAction error:", error);
    return {
      success: false,
      error: error.message || "فشلت عملية إتمام الطلب",
      sessionToken: sessionToken || null,
    };
  }
}
