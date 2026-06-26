import { cache } from "react";

const GRAPHQL_ENDPOINT = process.env.WORDPRESS_API_URL || "https://lightgrey-flamingo-522119.hostingersite.com/graphql";

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
    /** WPGraphQL Polylang — active language code (e.g. "ar", "en") */
    language?: string;
  }
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (sessionToken) {
    headers["woocommerce-session"] = `Session ${sessionToken}`;
  }

  // WPGraphQL Polylang: pass active language via Content-Language header
  if (options?.language) {
    headers["Content-Language"] = options.language;
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
    const isExpiredToken = json.errors.some(err => 
      err.message?.includes("invalid_token") || 
      err.message?.includes("Expired token")
    );
    if (isExpiredToken) {
      throw new Error("TOKEN_EXPIRED");
    }
    throw new Error("Failed to fetch API");
  }

  console.log("[fetchGraphQL] ✔ Success — data keys:", json.data ? Object.keys(json.data) : "null");

  return {
    data: json.data,
    sessionToken: res.headers.get("woocommerce-session") || null,
  };
}

/**
 * Request-memoized GraphQL fetch wrapper to deduplicate POST requests in the same render pass
 */
export const fetchGraphQLCached = cache(
  async (
    query: string,
    variables: Record<string, unknown> = {},
    sessionToken?: string,
    options?: {
      revalidate?: number | false;
      cache?: RequestCache;
      /** WPGraphQL Polylang — active language code (e.g. "ar", "en") */
      language?: string;
    }
  ) => {
    return fetchGraphQL(query, variables, sessionToken, options);
  }
);

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
          stockStatus
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
          stockStatus
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
        variations {
          nodes {
            id
            databaseId
            name
            price
            regularPrice
            stockStatus
            image {
              sourceUrl
              altText
            }
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

export const GET_PRODUCT_REVIEWS_QUERY = `
  query GetProductReviews($id: ID!) {
    product(id: $id, idType: ID) {
      id
      averageRating
      reviewCount
      reviews(first: 100) {
        edges {
          rating
          node {
            id
            databaseId
            content
            date
            status
            approved
            author {
              node {
                name
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
  query GetProductsByCategory(
    $categorySlugId: ID!
    $categorySlugStr: String!
    $first: Int = 100
  ) {
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
          stockStatus
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
          stockStatus
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
    }
  }
`;

export const GET_PRODUCTS_BY_SEARCH = `
  query GetProductsBySearch($searchQuery: String!, $first: Int = 50) {
    products(where: { search: $searchQuery }, first: $first) {
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
          stockStatus
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
          stockStatus
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

/* ─────────────── WordPress Pages Query (for Sitemap) ─────────────── */

export const GET_ALL_PAGES_QUERY = `
  query GetAllPages {
    pages(first: 100, where: { status: PUBLISH }) {
      nodes {
        slug
        modified
      }
    }
  }
`;

/* ─────────────── Type Definitions ─────────────── */

export interface WooProduct {
  __typename?: "SimpleProduct" | "VariableProduct";
  id: string;
  slug: string;
  databaseId: number;
  name: string;
  description?: string;
  shortDescription: string;
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
      stockStatus?: string | null;
      image?: {
        sourceUrl: string;
        altText?: string;
      } | null;
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
  salePrice?: string | null;
  stockStatus?: string | null;
  stockQuantity?: number | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  reviews?: {
    edges: {
      rating: number | null;
      node: {
        id: string;
        databaseId: number;
        content: string;
        date: string;
        status?: string | null;
        approved?: boolean | null;
        author?: {
          node?: {
            name?: string | null;
          } | null;
        } | null;
      };
    }[];
  } | null;
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
 * Safe fetch reviews for a product to prevent failures from crashing the main product load
 */
export async function getProductReviewsSafe(productId: string): Promise<{
  reviews: any[];
  averageRating: number;
  reviewCount: number;
}> {
  try {
    const { data } = await fetchGraphQL(GET_PRODUCT_REVIEWS_QUERY, { id: productId }, undefined, { revalidate: 60 });
    return {
      reviews: data?.product?.reviews?.edges || [],
      averageRating: data?.product?.averageRating || 0,
      reviewCount: data?.product?.reviewCount || 0
    };
  } catch (error) {
    console.error("[getProductReviewsSafe] ✖ Fail-safe triggered: Reviews failed to load.", error);
    return {
      reviews: [],
      averageRating: 0,
      reviewCount: 0
    };
  }
}

export const SUBMIT_PRODUCT_REVIEW = `
  mutation SubmitProductReview($input: WriteReviewInput!) {
    writeReview(input: $input) {
      clientMutationId
      rating
    }
  }
`;

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

export const CREATE_ORDER_MUTATION = `
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      order {
        databaseId
        orderKey
        total
        status
      }
    }
  }
`;

/* ─────────────── Checkout / Order Type Definitions ─────────────── */

export interface ShippingLineInput {
  methodId: string;
  methodTitle: string;
  total: string;
}

export interface CreateOrderLineItemInput {
  productId: number;
  quantity: number;
  variationId?: number;
}

export interface CreateOrderAddressInput {
  firstName: string;
  lastName: string;
  phone?: string;
  address1?: string;
  city?: string;
  country?: string;
  email?: string;
}

export interface CreateOrderInput {
  clientMutationId?: string;
  paymentMethod?: string;
  billing?: CreateOrderAddressInput;
  shipping?: CreateOrderAddressInput;
  lineItems?: CreateOrderLineItemInput[];
  shippingLines?: ShippingLineInput[];
  customerNote?: string;
  metaData?: { key: string; value: string }[];
  isPaid?: boolean;
}

