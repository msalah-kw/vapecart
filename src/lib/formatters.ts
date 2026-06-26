/**
 * Strip HTML tags from strings
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

/**
 * Truncate text to approximately N characters, breaking at word boundaries
 */
export function truncateText(text: string | null | undefined, maxLen: number = 160): string {
  if (!text) return "";
  const clean = stripHtml(text);
  if (clean.length <= maxLen) return clean;
  return clean.substring(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

/**
 * Extract clean price string: "5.000 د.ك" → "5.000"
 * Returns the raw KWD price or null
 */
export function cleanPrice(priceHtml: string | null | undefined): string | null {
  if (!priceHtml) return null;
  const cleaned = priceHtml.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  const match = cleaned.match(/([\d,.]+)/);
  return match ? match[1] : null;
}
