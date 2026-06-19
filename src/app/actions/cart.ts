"use server";

import {
  fetchGraphQL,
  GET_CART_QUERY,
  ADD_TO_CART_MUTATION,
  UPDATE_CART_QUANTITY_MUTATION,
  REMOVE_FROM_CART_MUTATION,
  CREATE_ORDER_MUTATION,
} from "@/lib/graphql";

import type { ShippingLineInput } from "@/lib/graphql";

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

    // Build shippingLines array for WooCommerce to natively calculate the grand total
    const shippingLines: ShippingLineInput[] = [];
    if (shippingArea && shippingFee !== undefined && shippingFee > 0) {
      shippingLines.push({
        methodId: "flat_rate",
        methodTitle: `توصيل إلى ${shippingArea}`,
        total: shippingFee.toFixed(3),
      });
    }

    const input: Record<string, unknown> = {
      clientMutationId: "vapecart-create-order",
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
      shippingLines,
      metaData: [
        { key: "shipping_area", value: shippingArea || "" },
        { key: "shipping_fee", value: String(shippingFee ?? 0) },
      ],
    };

    const { data, sessionToken: newSessionToken } = await fetchGraphQL(
      CREATE_ORDER_MUTATION,
      { input },
      sessionToken
    );

    return {
      success: true,
      order: data?.createOrder?.order || null,
      sessionToken: newSessionToken || sessionToken || null,
    };
  } catch (error: any) {
    console.error("checkoutAction error:", error);
    return {
      success: false,
      error: error.message || "فشلت عملية إتمام الطلب",
      sessionToken: sessionToken || null,
    };
  }
}
