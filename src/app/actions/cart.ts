"use server";

import { cookies, headers } from "next/headers";
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
// Simple in-memory rate limiter for Server Actions
const rateLimitCache = new Map<string, { count: number, timestamp: number }>();

function checkRateLimit(ip: string, limit: number, windowMs: number) {
  const now = Date.now();
  const record = rateLimitCache.get(ip);

  if (!record || now - record.timestamp > windowMs) {
    rateLimitCache.set(ip, { count: 1, timestamp: now });
    return true; // Allowed
  }

  if (record.count >= limit) {
    return false; // Blocked
  }

  record.count++;
  return true; // Allowed
}

// Secure Server-Side Shipping Zones (Do not trust client shippingFee)
const SERVER_SHIPPING_ZONES = [
  { id: "area-1", name: "اشبيلية", fee: 2 },
  { id: "area-2", name: "الأحمدي", fee: 2 },
  { id: "area-3", name: "الأندلس", fee: 2 },
  { id: "area-4", name: "البدع", fee: 2 },
  { id: "area-5", name: "الجابرية", fee: 2 },
  { id: "area-6", name: "الجهراء", fee: 2 },
  { id: "area-7", name: "الحساوي", fee: 2 },
  { id: "area-8", name: "الخالدية", fee: 2 },
  { id: "area-9", name: "الدسمة", fee: 2 },
  { id: "area-10", name: "الدعية", fee: 2 },
  { id: "area-11", name: "الدوحة", fee: 2 },
  { id: "area-12", name: "الرابية", fee: 2 },
  { id: "area-13", name: "الرحاب", fee: 2 },
  { id: "area-14", name: "الرقة", fee: 2 },
  { id: "area-15", name: "الرقعي", fee: 2 },
  { id: "area-16", name: "الرميثية", fee: 2 },
  { id: "area-17", name: "الروضة", fee: 2 },
  { id: "area-18", name: "الري", fee: 2 },
  { id: "area-19", name: "الزهراء", fee: 2 },
  { id: "area-20", name: "السالمي", fee: 2 },
  { id: "area-21", name: "السالمية", fee: 1 },
  { id: "area-22", name: "السرة", fee: 2 },
  { id: "area-23", name: "السلام", fee: 2 },
  { id: "area-24", name: "الشامية", fee: 2 },
  { id: "area-25", name: "الشدادية", fee: 2 },
  { id: "area-26", name: "الشرق", fee: 2 },
  { id: "area-27", name: "الشعب", fee: 2 },
  { id: "area-28", name: "الشعيبة", fee: 2 },
  { id: "area-29", name: "الشهداء", fee: 2 },
  { id: "area-30", name: "الشويخ", fee: 2 },
  { id: "area-31", name: "الصالحية", fee: 2 },
  { id: "area-32", name: "الصباحية", fee: 2 },
  { id: "area-33", name: "الصبية", fee: 2 },
  { id: "area-34", name: "الصديق", fee: 2 },
  { id: "area-35", name: "الصليبية", fee: 2 },
  { id: "area-36", name: "الصليبيخات", fee: 2 },
  { id: "area-37", name: "الضجيج", fee: 2 },
  { id: "area-38", name: "الظهر", fee: 2 },
  { id: "area-39", name: "العارضية", fee: 2 },
  { id: "area-40", name: "العباسية", fee: 2 },
  { id: "area-41", name: "العبدلي", fee: 6 },
  { id: "area-42", name: "العدان", fee: 2 },
  { id: "area-43", name: "العديلية", fee: 2 },
  { id: "area-44", name: "العقيلة", fee: 2 },
  { id: "area-45", name: "العمرية", fee: 2 },
  { id: "area-46", name: "الفحيحيل", fee: 2 },
  { id: "area-47", name: "الفردوس", fee: 2 },
  { id: "area-48", name: "الفروانية", fee: 2 },
  { id: "area-49", name: "الفنطاس", fee: 2 },
  { id: "area-50", name: "الفنيطيس", fee: 2 },
  { id: "area-51", name: "الفيحاء", fee: 2 },
  { id: "area-52", name: "القادسية", fee: 2 },
  { id: "area-53", name: "القبلة", fee: 2 },
  { id: "area-54", name: "القرين", fee: 2 },
  { id: "area-55", name: "القصور", fee: 2 },
  { id: "area-56", name: "القيروان", fee: 2 },
  { id: "area-57", name: "الكويت", fee: 2 },
  { id: "area-58", name: "المرقاب", fee: 2 },
  { id: "area-59", name: "المسايل", fee: 2 },
  { id: "area-60", name: "المسيلة", fee: 2 },
  { id: "area-61", name: "المطلاع", fee: 6 },
  { id: "area-62", name: "المنصورية", fee: 2 },
  { id: "area-63", name: "المنقف", fee: 2 },
  { id: "area-64", name: "المهبولة", fee: 2 },
  { id: "area-65", name: "النزهة", fee: 2 },
  { id: "area-66", name: "النهضة", fee: 2 },
  { id: "area-67", name: "النويصيب", fee: 6 },
  { id: "area-68", name: "الوفرة", fee: 2 },
  { id: "area-69", name: "اليرموك", fee: 2 },
  { id: "area-70", name: "أبو الحصاني", fee: 2 },
  { id: "area-71", name: "أبو حليفة", fee: 2 },
  { id: "area-72", name: "أبو فطيرة", fee: 2 },
  { id: "area-73", name: "أمغرة", fee: 2 },
  { id: "area-74", name: "بنيد القار", fee: 2 },
  { id: "area-75", name: "بنيدر", fee: 6 },
  { id: "area-76", name: "بيان", fee: 2 },
  { id: "area-77", name: "جابر الأحمد", fee: 2 },
  { id: "area-78", name: "جليب الشيوخ", fee: 2 },
  { id: "area-79", name: "حطين", fee: 2 },
  { id: "area-80", name: "حولي", fee: 2 },
  { id: "area-81", name: "خيران", fee: 2 },
  { id: "area-82", name: "خيطان", fee: 2 },
  { id: "area-83", name: "دسمان", fee: 2 },
  { id: "area-84", name: "سعد العبدالله", fee: 2 },
  { id: "area-85", name: "سلوى", fee: 2 },
  { id: "area-86", name: "شمال غرب الصليبيخات", fee: 2 },
  { id: "area-87", name: "صباح الأحمد", fee: 2 },
  { id: "area-88", name: "صباح السالم", fee: 2 },
  { id: "area-89", name: "صبحان", fee: 2 },
  { id: "area-90", name: "ضاحية جابر العلي", fee: 2 },
  { id: "area-91", name: "ضاحية صباح الناصر", fee: 2 },
  { id: "area-92", name: "ضاحية عبدالله السالم", fee: 2 },
  { id: "area-93", name: "ضاحية مبارك العبدالله", fee: 2 },
  { id: "area-94", name: "عبد الله المبارك", fee: 2 },
  { id: "area-95", name: "علي صباح السالم - أم الهيمان", fee: 5 },
  { id: "area-96", name: "غرب عبدالله المبارك", fee: 2 },
  { id: "area-97", name: "غرناطة", fee: 2 },
  { id: "area-98", name: "فهد الأحمد", fee: 2 },
  { id: "area-99", name: "قرطبة", fee: 2 },
  { id: "area-100", name: "كبد", fee: 6 },
  { id: "area-101", name: "كيفان", fee: 2 },
  { id: "area-102", name: "مبارك الكبير", fee: 2 },
  { id: "area-103", name: "مشرف", fee: 2 },
  { id: "area-104", name: "ميدان حولي", fee: 2 },
  { id: "area-105", name: "ميناء الأحمدي", fee: 2 },
  { id: "area-106", name: "ميناء عبدالله", fee: 2 },
  { id: "area-107", name: "هدية", fee: 2 }
];

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
  shippingFee?: number // Ignored for security, re-calculated on server
) {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    
    // Rate Limiting: Allow 5 checkouts per IP every 15 minutes
    if (!checkRateLimit(ip, 5, 15 * 60 * 1000)) {
      throw new Error("عذراً، لقد تجاوزت الحد المسموح به للطلبات. يرجى المحاولة بعد قليل.");
    }

    // Secure Shipping Fee Calculation
    const matchedZone = SERVER_SHIPPING_ZONES.find(
      (z) => z.name.trim() === (shippingArea || "").trim()
    );
    const secureShippingFee = matchedZone ? matchedZone.fee : 2; // Default fallback to 2 KD

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
        { key: "shipping_fee", value: String(secureShippingFee) },
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
