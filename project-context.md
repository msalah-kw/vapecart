# Project Context & Overview

This document defines the high-level context, environment, and core settings for the **VapeCart Headless Store** project. All developers and AI agents must adhere to these foundations.

---

## 📌 Core Architecture

The project is structured as a modern, decoupled Headless E-commerce application:

* **Frontend:** Next.js (App Router) + TypeScript + Vanilla CSS (using custom semantic variables defined in `src/app/globals.css` with a pure HTML/CSS structure, no Tailwind).
* **Backend:** Headless WordPress (WooCommerce) + WPGraphQL + WooGraphQL.
* **API Endpoint:** `https://lightgrey-flamingo-522119.hostingersite.com/graphql`

---

## 🔄 i18n Rollback & Single-Language Architecture

The codebase operates on a high-performance, single-language Arabic structure. The previous i18n/Polylang multi-language implementation was permanently rolled back to prioritize maximum loading speed, clean DOM rendering, and simple, flat SEO routing. All page layout templates default strictly to `lang="ar"` and `dir="rtl"`.

---

## 🇰🇼 Target Market & Localization

The application is specialized exclusively for the **Kuwait market**. All locale, currency, and content structures must strictly reflect local standards:

* **Currency:** Kuwaiti Dinar (**KWD** / **د.ك**). Every price tag, cart computation, and checkout total must strictly use KWD currency.
* **Locale:** Arabic (Kuwait) - `ar_KW`. The global layout specifies `lang="ar"` and `dir="rtl"`.
* **Locale Configuration:** Global metadata must define `locale: 'ar_KW'` within OpenGraph configurations.

---

## 🔒 Security & Domain Consolidation

To mask backend infrastructure and maintain optimal search engine indexing authority:

1. **Infrastructure Masking:**
   - The `poweredByHeader` property must be set to `false` in `next.config.mjs` to suppress the `X-Powered-By: Next.js` header.
2. **Domain Consolidation (Canonicalization):**
   - Direct all traffic to the root apex domain by enforcing a permanent (301) redirect from the `www` subdomain (e.g., `www.sahbavape.com`) to the apex domain (`https://sahbavape.com`) inside `next.config.mjs`.

---

## 🏷️ Core Taxonomy & Main Categories

The product catalog is organized into the following primary categories, using approved Kuwaiti terminology:

* **سحبات جاهزة** (Disposable Vapes)
* **نكهات** (E-Liquids / Salt Nicotine)
* **بودات** (Replacement Pods)
* **كويلات** (Coils)
* **تانكات** (Tanks)
* **زقاير تيريا** (Terea Cigarettes)
* **زقاير هييتس** (Heets Cigarettes)