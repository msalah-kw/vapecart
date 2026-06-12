# Next.js App Router Structure
Define the exact folder structure within the `app/` directory:

- `/` -> Homepage (Showcasing top categories like سحبات جاهزة and نكهات).
- `/shop` -> Main catalog page.
- `/product/[slug]` -> Dynamic single product page. Must fetch product details (prices, attributes like كويل or قوة) and generate accurate SEO metadata (descriptions restricted to ~160 characters).
- `/category/[slug]` -> Dynamic category archive.
- `/cart` -> Client-side cart review page.
- `/checkout` -> Final checkout flow.

**Navigation Rules:** Use Next.js `<Link>` component for all internal routing to ensure instantaneous page transitions without full reloads.