const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "https://lightgrey-flamingo-522119.hostingersite.com/graphql";

/**
 * Core GraphQL fetch utility
 */
export async function fetchGraphQL(
  query: string,
  variables: Record<string, unknown> = {},
  sessionToken?: string,
  options?: {
    revalidate?: number | false;
    cache?: RequestCache;
  }
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (sessionToken) {
    headers["woocommerce-session"] = `Session ${sessionToken}`;
  }

  const fetchOptions: RequestInit = {
    method: "POST",
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  };

  if (options?.revalidate !== undefined) {
    fetchOptions.next = { revalidate: options.revalidate };
  } else if (options?.cache) {
    fetchOptions.cache = options.cache;
  } else {
    fetchOptions.cache = "no-store";
  }

  // ── DIAGNOSTIC: Log outgoing request ──
  console.log("[fetchGraphQL] ➤ Endpoint:", GRAPHQL_ENDPOINT);
  console.log("[fetchGraphQL] ➤ Variables:", JSON.stringify(variables));
  console.log("[fetchGraphQL] ➤ Query (first 120 chars):", query.trim().substring(0, 120));

  let res: Response;
  try {
    res = await fetch(GRAPHQL_ENDPOINT, fetchOptions);
  } catch (networkError) {
    console.error("[fetchGraphQL] ✖ NETWORK ERROR — fetch() threw:", networkError);
    throw networkError;
  }

  // ── DIAGNOSTIC: Log HTTP response status ──
  console.log("[fetchGraphQL] ➤ HTTP Status:", res.status, res.statusText);

  const rawText = await res.text();
  console.log("[fetchGraphQL] ➤ Raw response body (first 500 chars):", rawText.substring(0, 500));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: { data?: Record<string, any>; errors?: any[] };
  try {
    json = JSON.parse(rawText);
  } catch (parseError) {
    console.error("[fetchGraphQL] ✖ JSON PARSE ERROR — Response is not valid JSON.");
    console.error("[fetchGraphQL] ✖ Full raw body:", rawText.substring(0, 2000));
    throw new Error("GraphQL response was not valid JSON");
  }

  if (json.errors) {
    console.error("[fetchGraphQL] ✖ GraphQL Errors:", JSON.stringify(json.errors, null, 2));
    throw new Error("Failed to fetch API");
  }

  console.log("[fetchGraphQL] ✔ Success — data keys:", json.data ? Object.keys(json.data) : "null");

  return {
    data: json.data,
    sessionToken: res.headers.get("woocommerce-session") || null,
  };
}

/* ─────────────── Product Queries ─────────────── */

export const GET_ALL_PRODUCTS_QUERY = `
  query GetAllProducts($first: Int = 100) {
    products(first: $first) {
      nodes {
        id
        slug
        databaseId
        name
        image {
          sourceUrl
          altText
        }
        __typename
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
        }
        productCategories {
          nodes {
            name
            slug
          }
        }
      }
    }
  }
`;

export const GET_LATEST_PRODUCTS_QUERY = `
  query GetLatestProducts($first: Int = 12) {
    products(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        slug
        databaseId
        name
        image {
          sourceUrl
          altText
        }
        __typename
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
        }
        productCategories {
          nodes {
            name
            slug
          }
        }
      }
    }
  }
`;

export const GET_PRODUCT_BY_SLUG_QUERY = `
  query GetProductBySlug($id: ID!) {
    product(id: $id, idType: SLUG) {
      id
      databaseId
      slug
      name
      description
      shortDescription
      seo {
        title
        metaDesc
      }
      image {
        sourceUrl
        altText
      }
      galleryImages {
        nodes {
          sourceUrl
          altText
        }
      }
      productCategories {
        nodes {
          name
          slug
        }
      }
      ... on ProductWithAttributes {
        attributes {
          nodes {
            name
            label
            options
            variation
            visible
            ... on GlobalProductAttribute {
              terms {
                nodes {
                  name
                  slug
                }
              }
            }
          }
        }
      }
      ... on SimpleProduct {
        price
        regularPrice
      }
      ... on VariableProduct {
        price
        regularPrice
        variations {
          nodes {
            id
            databaseId
            name
            price
            regularPrice
            attributes {
              nodes {
                name
                value
              }
            }
          }
        }
      }
    }
  }
`;

/* ─────────────── Category Queries ─────────────── */

export const GET_PRODUCTS_BY_CATEGORY_QUERY = `
  query GetProductsByCategory($categorySlugId: ID!, $categorySlugStr: String!, $first: Int = 100) {
    products(where: { category: $categorySlugStr }, first: $first) {
      nodes {
        id
        slug
        databaseId
        name
        image {
          sourceUrl
          altText
        }
        __typename
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
        }
        productCategories {
          nodes {
            name
            slug
          }
        }
      }
    }
    productCategory(id: $categorySlugId, idType: SLUG) {
      name
      description
      count
      seo {
        title
        metaDesc
      }
    }
  }
`;

export const GET_CATEGORIES_QUERY = `
  query GetCategories {
    productCategories(first: 50, where: { hideEmpty: true }) {
      nodes {
        id
        databaseId
        name
        slug
        count
        image {
          sourceUrl
        }
        parent {
          node {
            name
            slug
          }
        }
      }
    }
  }
`;

/* ─────────────── Type Definitions ─────────────── */

export interface SeoMetadata {
  title?: string | null;
  metaDesc?: string | null;
}

export interface WooProduct {
  __typename?: "SimpleProduct" | "VariableProduct";
  id: string;
  slug: string;
  databaseId: number;
  name: string;
  description?: string;
  shortDescription: string;
  seo?: SeoMetadata | null;
  image: {
    sourceUrl: string;
    altText: string;
  } | null;
  galleryImages?: {
    nodes: {
      sourceUrl: string;
      altText?: string;
    }[];
  } | null;
  attributes?: {
    nodes: {
      name: string;
      label: string | null;
      options: string[];
      variation: boolean;
      visible: boolean;
      terms?: {
        nodes: {
          name: string;
          slug: string;
        }[];
      } | null;
    }[];
  } | null;
  variations?: {
    nodes: {
      id: string;
      databaseId: number;
      name: string;
      price: string | null;
      regularPrice: string | null;
      attributes?: {
        nodes: {
          name: string;
          value: string;
        }[];
      } | null;
    }[];
  } | null;
  price: string | null;
  regularPrice: string | null;
  productCategories?: {
    nodes: {
      name: string;
      slug: string;
    }[];
  };
}

export interface WooCategory {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  count: number;
  seo?: SeoMetadata | null;
  image: {
    sourceUrl: string;
  } | null;
  parent: {
    node: {
      name: string;
      slug: string;
    };
  } | null;
}

/* ─────────────── Helper Functions ─────────────── */

/**
 * Strip HTML tags from WooCommerce descriptions
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

/**
 * Truncate text to approximately N characters, breaking at word boundaries
 */
export function truncateText(text: string, maxLen: number = 160): string {
  const clean = stripHtml(text);
  if (clean.length <= maxLen) return clean;
  return clean.substring(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

/**
 * Extract clean price string: "5.000 د.ك" → "5.000"
 * Returns the raw KWD price or null
 */
export function cleanPrice(priceHtml: string | null): string | null {
  if (!priceHtml) return null;
  const cleaned = priceHtml.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  const match = cleaned.match(/([\d,.]+)/);
  return match ? match[1] : null;
}

/* ─────────────── Cart Queries & Mutations ─────────────── */

export const GET_CART_QUERY = `
  query GetCart {
    cart {
      contents(first: 100) {
        nodes {
          key
          quantity
          subtotal
          total
          product {
            node {
              id
              databaseId
              slug
              name
              image {
                sourceUrl
                altText
              }
              ... on SimpleProduct {
                price
                regularPrice
              }
              ... on VariableProduct {
                price
                regularPrice
              }
            }
          }
          variation {
            node {
              id
              databaseId
              name
              price
              regularPrice
              image {
                sourceUrl
                altText
              }
            }
            attributes {
              name
              label
              value
            }
          }
        }
      }
      subtotal
      total
    }
  }
`;

export const ADD_TO_CART_MUTATION = `
  mutation AddToCart($productId: Int!, $quantity: Int!, $variationId: Int) {
    addToCart(input: { productId: $productId, quantity: $quantity, variationId: $variationId }) {
      cartItem {
        key
        quantity
      }
    }
  }
`;

export const UPDATE_CART_QUANTITY_MUTATION = `
  mutation UpdateCartQuantity($key: ID!, $quantity: Int!) {
    updateItemQuantities(input: { items: [{ key: $key, quantity: $quantity }] }) {
      cart {
        total
      }
    }
  }
`;

export const REMOVE_FROM_CART_MUTATION = `
  mutation RemoveFromCart($keys: [ID]!) {
    removeItemsFromCart(input: { keys: $keys }) {
      cart {
        total
      }
    }
  }
`;

export const CHECKOUT_MUTATION = `
  mutation Checkout($input: CheckoutInput!) {
    checkout(input: $input) {
      result
      order {
        databaseId
        orderKey
        total
        status
      }
    }
  }
`;

