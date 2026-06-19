<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Headless VapeCart Storefront Instructions & Rules

You are Antigravity, a professional AI pair-programmer. When writing or modifying any code in this repository, you must adhere strictly to the following architectural boundaries and guidelines.

---

## 🛠️ 1. Technical Architecture & Environment

* **Frontend:** Next.js (App Router, Version 16+) + TypeScript + Tailwind CSS / Vanilla CSS variables design system.
* **Backend:** Headless WordPress & WooCommerce via WPGraphQL.
* **Target Market:** Kuwait.
* **Currency:** Kuwaiti Dinar (**KWD** / **د.ك**).
* **Locale:** RTL Arabic (`ar_KW`).

---

## 🔍 2. 100% Frontend SEO & Metadata Control

* **SEO Plugin Bridge Querying is Forbidden:** Do **NOT** query Yoast SEO (`seo`) or RankMath fields in any GraphQL queries. This causes server-side database crashes and 404 errors.
* **Dynamic Generation:** All metadata must be generated dynamically on the frontend via the Next.js Metadata API (`generateMetadata`).
* **Meta Descriptions:**
  - Prioritize `shortDescription` -> Fallback to `description`.
  - Strictly strip HTML tags.
  - Truncate gracefully around **160 characters** on word boundaries (append `...`).
* **Canonical alternates:** Every dynamic route must explicitly include `alternates.canonical` pointing to the production root apex domain.
* **OpenGraph (OG) configurations:** Must always include title, description, url, siteName (`سحبة فيب`), locale (`ar_KW`), and product images.

---

## 🛡️ 3. Bulletproof Runtime Safety & Data Integrity

* **Defensive Coding:** Implement null-safety guards (`?.` and `??`) across all utilities, queries, and components.
* **Sanitation Utilities:** Text sanitation helpers (HTML stripping, truncation) must accept `string | null | undefined` and return clean default values (e.g. `""`) instead of throwing TypeErrors.
* **Fail-Safe UI:** Prevent unexpected page crashes by ensuring robust fallbacks for missing fields (e.g., missing price, empty descriptions, or unmapped stock status properties).

---

## ⚡ 4. Dynamic Server & Security Optimization

* **Sitemaps (`sitemap.ts`):** Must fetch active product/category slugs dynamically via custom GraphQL queries (strictly avoiding heavy SEO bridge plugin nodes).
* **Robots (`robots.ts`):** Point to the dynamic sitemap.
* **Security:** Suppress platform signatures by setting `poweredByHeader: false` in `next.config.mjs`.
* **Domain Consolidation:** Enforce permanent (301) redirects from the `www` subdomain to the root apex domain inside `next.config.mjs` redirects.
* **Global Metadata Assets:** Global metadata configuration in `layout.tsx` must inject mobile-optimized assets including Apple Touch Icons.

---

## 🗣️ 5. Terminology Rules (Strict)

* **Always Use:** نكهة, سحبة, كويل, ميش كويل, بودات, سحبات جاهزة, تانك, رقي, ايس, مبسم, قوة, سبيرمنت.
* **Never Use:** السائل الالكتروني, موشة, بطيخ, ملف, خراطيش, أنظمة البود, تبريد, قطعة فم.
