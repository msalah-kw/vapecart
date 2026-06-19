# Next.js App Router Structure & SEO Metadata

This document defines the Next.js directory structure, routing rules, dynamic server files (sitemaps, robots), and frontend-driven SEO metadata standards.

---

## 📁 Directory Structure

```text
src/
└── app/
    ├── layout.tsx               # Root Layout with global metadata & fonts
    ├── page.tsx                 # Homepage (Top categories and featured products)
    ├── shop/
    │   └── page.tsx             # Product Catalog listing
    ├── product/
    │   └── [slug]/
    │       └── page.tsx         # Single Product Detail (Dynamic metadata and JSON-LD)
    ├── category/
    │   └── [slug]/
    │       └── page.tsx         # Category Catalog (Dynamic pagination and metadata)
    ├── cart/
    │   └── page.tsx             # Shopping Cart (Client-side)
    ├── checkout/
    │   └── page.tsx             # Checkout Flow
    ├── sitemap.ts               # Dynamic Sitemap generator
    ├── robots.ts                # Dynamic Robots.txt provider
    └── globals.css              # Global styles, Tailwind directives & custom CSS
```

---

## 🔗 Navigation Rules

* Use Next.js `<Link>` component for all internal route transitions.
* Ensure all links have exact routes to avoid internal redirects.

---

## ⚡ Dynamic Server Files (Sitemap & Robots)

SEO configuration must be fully automated on the frontend to reflect backend updates dynamically:

1. **`sitemap.ts` (Dynamic Sitemap):**
   - Must fetch active product slugs, category slugs, and page slugs directly via custom GraphQL queries (excluding heavy SEO plugin queries).
   - Resolve URLs using the root domain and return an array compliant with the Next.js Sitemap type.
2. **`robots.ts` / `robots.txt`:**
   - Must point directly to the dynamic sitemap URL (e.g., `https://sahbavape.com/sitemap.xml`).
   - Specify crawling instructions (e.g., allow all except checkout/cart areas).

---

## 🔍 Frontend-Controlled SEO & Metadata (`generateMetadata`)

All SEO metadata is generated 100% on the frontend using Next.js Metadata API. Do **NOT** query or depend on WooCommerce/WordPress SEO bridge plugins (Yoast, RankMath, etc.) to prevent slow database execution and runtime crashes.

### 1. Alternate Canonical URL Control
* Every dynamic route (Product, Category, Custom Page) must generate its own explicit canonical URL:
  ```typescript
  alternates: {
    canonical: `https://sahbavape.com/product/${slug}`,
  }
  ```
* This prevents duplicate content penalties from search engines and aggregates SEO link authority.

### 2. Meta Description Extraction Rules
Meta descriptions must be clean, readable, and fit search engine limits:
* **Priority:** Extract WooCommerce `shortDescription` first. If empty, fallback to the full `description`.
* **Sanitation:** The content must be strictly stripped of all HTML tags.
* **Truncation:** Truncate gracefully around **160 characters** on exact word boundaries (do not cut a word in half) and append a clean ellipse (`...`).
* **Null Safety:** Safe guards must protect this logic if both descriptions are null or undefined, returning a global default store description.

### 3. OpenGraph (OG) Requirements
Every dynamic page must output a fully structured OpenGraph block:
* `title`: Page/product name.
* `description`: Dynamically stripped and truncated description.
* `url`: Canonical page URL.
* `siteName`: Default brand name (`"سحبة فيب"`).
* `locale`: Strictly set to `'ar_KW'`.
* `images`: Featured product or category image URLs (with backup placeholder fallback).