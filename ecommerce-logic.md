# E-commerce Cart & Checkout Logic
- **Cart State Management:** Use React Context API to manage the cart locally on the client side. No heavy state libraries.
- **WooCommerce Sessions:** Handle `woocommerce-session` tokens in the HTTP headers for all WooGraphQL mutations (Add to Cart, Remove, Update). This is critical to keep the guest cart persistent.
- **Shipping Zones:** The checkout process must dynamically read the selected region (e.g., Hawally, Al-Ahmadi, Salmiya) and apply the appropriate delivery fee in KWD via the GraphQL mutation.
- **Checkout Process:** Execute standard WooGraphQL checkout mutations. Ensure all form validations (Name, Phone, Address) are handled strictly on the client side before sending the mutation.