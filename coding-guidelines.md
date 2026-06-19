# Coding & Design Guidelines

This document outlines the visual, styling, typographic, and runtime safety guidelines for the storefront.

---

## 🎨 Styling & Layout System

1. **Aesthetics & Performance:**
   - Use Next.js (App Router) + TypeScript + Tailwind CSS as the core styling framework.
   - Supplement with pure CSS variables in `globals.css` to govern the core design system tokens (colors, spacings, border radii, shadows).
   - Ensure the layout is fluid and fully responsive on all mobile, tablet, and desktop breakpoints.
2. **Container Boundary:**
   - The maximum layout container width must be restricted to exactly `1600px`.
3. **Mobile & Asset Optimization:**
   - Web fonts (e.g., *Tajawal*) must be loaded locally with `font-display: swap` for optimal Core Web Vitals.
   - Global metadata must inject mobile-optimized assets, including high-resolution **Apple Touch Icons** (`apple-touch-icon`).

---

## 🛡️ Bulletproof Runtime Safety & Data Integrity

To prevent runtime errors, page crashes, or white-screen-of-death (WSOD) failures, you must implement strict **defensive programming** patterns:

1. **Null-Safety Guards:**
   - Always implement optional chaining (`?.`) and fallback default values (`??`) when accessing API data, especially product attributes, descriptions, pricing, and media URLs.
2. **Text Sanitation & Truncation Utilities:**
   - All sanitation functions (e.g., stripping HTML tags, truncating text) must accept `string | null | undefined` and safely return clean defaults (such as `""` or custom fallback text) instead of throwing runtime `TypeErrors`.
   - Implement clean HTML-stripping regex helper functions that fail gracefully.
3. **UI Fallbacks for Missing Database Fields:**
   - If a product has a missing price or empty string, show a fallback message (e.g., `"اتصل بنا"` / `"Price on Request"`) and safely disable add-to-cart rather than breaking the layout.
   - If stock status is missing, unmapped, or null, safely default to `"Out of Stock"` (`"غير متوفر"`).
   - If descriptions or category contents are missing, provide a friendly default layout.

---

## 🗣️ Terminology & Localization Rules

RTL (Right-to-Left) Arabic support is mandatory. Use the local Kuwaiti terminology strictly; never use standard Arabic translation equivalents that sound unnatural to local customers.

### 🟢 STRICTLY USE (Kuwait Market Terms)
* **نكهة** / **نكهات** (instead of السائل الالكتروني / سوائل)
* **سحبة** / **سحبات** / **سحبات جاهزة** (instead of موشة / أنظمة البود)
* **كويل** / **كويلات** (instead of ملف)
* **ميش كويل**
* **بودات** (instead of خراطيش)
* **تانك** / **تانكات**
* **رقي** (instead of بطيخ)
* **ايس** (instead of تبريد / بارد)
* **مبسم** (instead of قطعة فم)
* **قوة** (for nicotine strength / wattage)
* **سبيرمنت** (instead of نعناع منعش)

### 🔴 NEVER USE (Forbidden Terms)
* **السائل الالكتروني** (Too formal, unnatural)
* **موشة** (Incorrect local context)
* **بطيخ** (Must use local term **رقي**)
* **ملف** (Must use local term **كويل**)
* **خراطيش** (Must use local term **بودات**)
* **أنظمة البود**
* **تبريد** (Must use local term **ايس**)
* **قطعة فم** (Must use local term **مبسم**)

### ⚠️ AVOID
* Filler phrases like: `"حسب التوفر"`, `"كما هو موضح بالصورة"`, or placeholders.
* Keep copy direct, punchy, and sales-focused.