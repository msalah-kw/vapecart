import type { MetadataRoute } from "next";
import {
  fetchGraphQL,
  GET_ALL_PRODUCTS_QUERY,
  GET_CATEGORIES_QUERY,
  GET_ALL_PAGES_QUERY,
} from "@/lib/graphql";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sahbavape.com";

  // Fetch all product, category, and WP page slugs in parallel (Arabic = primary locale for SEO)
  const [productsRes, categoriesRes, pagesRes] = await Promise.all([
    fetchGraphQL(GET_ALL_PRODUCTS_QUERY, { first: 500 }, undefined, { revalidate: 3600 }),
    fetchGraphQL(GET_CATEGORIES_QUERY, {}, undefined, { revalidate: 3600 }),
    fetchGraphQL(GET_ALL_PAGES_QUERY, {}, undefined, { revalidate: 3600 }),
  ]);

  const products = productsRes.data?.products?.nodes ?? [];
  const categories = categoriesRes.data?.productCategories?.nodes ?? [];
  const pages = pagesRes.data?.pages?.nodes ?? [];

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Product pages
  const productRoutes: MetadataRoute.Sitemap = products.map(
    (product: { slug: string }) => ({
      url: `${siteUrl}/product/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })
  );

  // Category pages
  const categoryRoutes: MetadataRoute.Sitemap = categories.map(
    (category: { slug: string }) => ({
      url: `${siteUrl}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })
  );

  // WordPress static pages (about, FAQ, policies, etc.)
  // Exclude pages that are already handled by other routes or shouldn't be indexed
  const excludedPageSlugs = new Set(["cart", "checkout", "shop", "my-account", "sample-page"]);
  const pageRoutes: MetadataRoute.Sitemap = pages
    .filter((page: { slug: string }) => !excludedPageSlugs.has(page.slug))
    .map((page: { slug: string; modified?: string }) => ({
      url: `${siteUrl}/${page.slug}`,
      lastModified: page.modified ? new Date(page.modified) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...pageRoutes];
}
