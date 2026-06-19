# GraphQL Data Fetching Strategy

This document details the WPGraphQL and WooGraphQL query guidelines, defensive response handling, and query restrictions.

---

## 🌐 Endpoint & Fetch Mechanism

* **GraphQL Endpoint:** `https://lightgrey-flamingo-522119.hostingersite.com/graphql`
* **Fetch Pattern:** Use native `fetch` API inside Next.js Server Components.
* **Caching & Revalidation:** Utilize Next.js fetch caching policies (e.g., `{ next: { revalidate: 3600 } }` or ISR tagging) to guarantee fast page loads and reduced load on the WordPress server.

---

## 🚫 Critical Query Restriction: No SEO Plugins Bridge

To prevent database crashes, heavy CPU queries, and unexpected `404` errors:
* **100% FORBIDDEN:** Do **NOT** query Yoast SEO (`seo`) or RankMath bridge fields inside any GraphQL queries.
* **Metadata Responsibility:** All metadata generation is controlled strictly and dynamically on the **frontend** using Next.js Metadata APIs. The backend must only be queried for core content (title, description/excerpt, images, attributes).

---

## 📋 Required GraphQL Schema Queries

All GraphQL queries must be written defensively. Ensure only necessary fields are queried and default fallback values are mapped.

### 1. Catalog & Slug Queries (for Dynamic Sitemaps & Static Paths)
* Query active product slugs, category slugs, and page slugs.
* Retrieve only the slugs and modification dates to construct dynamic maps.

```graphql
query GetProductSlugs($first: Int) {
  products(first: $first, where: { status: "PUBLISH" }) {
    nodes {
      slug
      modified
    }
  }
}

query GetCategorySlugs($first: Int) {
  productCategories(first: $first) {
    nodes {
      slug
    }
  }
}
```

### 2. Single Product Page Query
* Query product fields including `name`, `databaseId`, `slug`, `description`, `shortDescription`, `image`, `galleryImages`, and attributes.
* **Defensive Mapping:** Do not assume fields like price, image, or description are populated.

```graphql
query GetProductBySlug($id: ID!) {
  product(id: $id, idType: SLUG) {
    id
    databaseId
    name
    slug
    description
    shortDescription
    image {
      sourceUrl
      altText
    }
    ... on SimpleProduct {
      price
      regularPrice
      salePrice
      stockStatus
      stockQuantity
    }
    ... on VariableProduct {
      price
      regularPrice
      salePrice
      stockStatus
      stockQuantity
    }
  }
}
```

---

## 🛡️ Response Validation & Fallbacks

Every fetch handler must validate the GraphQL response envelope:

1. **Check for GraphQL errors:** Always check `response.errors` and log them, while returning a safe empty state or throwing a controlled next.js `notFound()` handler.
2. **Defensive default values mapping:**
   - Map `image` -> use a local placeholder image asset if the backend returns `null`.
   - Map `shortDescription` -> if null/empty, fallback to `description` (cleanly stripped of HTML).
   - Map `price` -> if missing, handle gracefully (e.g., do not show `NaN` or crash).
