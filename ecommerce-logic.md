# E-commerce Cart & Checkout Logic

This document specifies cart state management, WooCommerce session persistence, local shipping calculations, checkout validations, and data integrity fallbacks.

---

## 🛒 Cart State Management & Persistence

1. **Client-Side Cart:**
   - Use standard React Context API (`CartContext`) for managing shopping cart state on the client side. Avoid heavy external libraries (Redux, MobX).
2. **WooCommerce Session Tokens (`woocommerce-session`):**
   - WooCommerce requires session state tracking for guest users.
   - For all WooGraphQL cart mutations (add, remove, update), capture the `woocommerce-session` header returned by the server.
   - Store this token in `localStorage` or `cookies` and append it to subsequent GraphQL headers:
     ```text
     "woocommerce-session": "Bearer <session_token>"
     ```
   - This prevents cart items from disappearing when the guest refreshes or transitions between routes.

---

## 🚚 Kuwait Shipping Zones & Fees

The delivery calculations are custom-configured on the client to accommodate the Kuwait local market structure:

1. **Shipping Area Mapping:**
   - Map Kuwaiti municipalities and areas (e.g., Hawally, Al-Ahmadi, Salmiya, Farwaniya, Jahra, Mubarak Al-Kabeer).
2. **Dynamic Fee Calculation:**
   - Apply specific flat shipping fees in KWD based on the selected region.
   - Calculate shipping zone inputs on the client and pass the correct shipping method database ID and fee using the checkout GraphQL mutation.

---

## 🔒 Checkout Validation

Ensure rigorous client-side form validations are met before triggering checkout mutations:
* **Phone Number validation:** Verify local Kuwaiti format (e.g., 8-digit mobile numbers starting with 5, 6, 9, or landlines starting with 2).
* **Address validation:** Confirm fields for Region, Block, Street, and House/Apartment Number are present.
* **Name validation:** Clean inputs from unwanted control characters.

---

## 🛡️ Robust UI Fallbacks & Fail-safes

Never allow WooCommerce product configuration inconsistencies to crash the frontend storefront. Implement these safety guards:

* **Missing/Unpublished Price:**
   - If a product regular price or price is empty, zero, or null: hide the add-to-cart controls, display a `"سعر المنتج غير متوفر / اتصل بنا"` message, and offer a WhatsApp action link.
* **Unmapped Stock Status:**
   - Map API stock statuses (`IN_STOCK`, `OUT_OF_STOCK`, `ON_BACKORDER`) defensively.
   - If a status is null or not recognized, default safely to Out of Stock (`"غير متوفر"`) and disable purchase actions.
* **Variation Parsing Fail-safes:**
   - For variable products, verify the availability of attributes and attribute options before rendering option selection menus.
   - Provide standard default options if WooCommerce attributes are partially populated.