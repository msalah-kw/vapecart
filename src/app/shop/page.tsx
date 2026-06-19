import type { Metadata } from "next";
import { Suspense } from "react";
import {
  fetchGraphQL,
  GET_ALL_PRODUCTS_QUERY,
  GET_STORE_FILTERS,
  WooProduct,
} from "@/lib/graphql";
import ProductCard from "@/app/components/ProductCard";
import StoreFilters from "@/app/components/StoreFilters";
import ProductGridSkeleton from "@/app/components/ProductGridSkeleton";

export const metadata: Metadata = {
  title: "المتجر – جميع المنتجات | سحبة فيب",
  description:
    "تصفح جميع منتجات الفيب: سحبات جاهزة، بودات، نكهات سولت، نكهات فيب، كويلات، وأكثر. أسعار بالدينار الكويتي مع توصيل سريع.",
};

interface ShopPageProps {
  searchParams: Promise<{ sort?: string; nicotine?: string; flavor?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedSearchParams = await searchParams;
  const sort = resolvedSearchParams.sort;
  const nicotine = resolvedSearchParams.nicotine;
  const flavor = resolvedSearchParams.flavor;

  // Fetch filters dynamically on the server (cache for 1 hour since attributes change rarely)
  let attributes = [];
  try {
    const filtersRes = await fetchGraphQL(GET_STORE_FILTERS, {}, undefined, { revalidate: 3600 });
    attributes = filtersRes.data?.productAttributes?.nodes || [];
  } catch (error) {
    console.error("Failed to fetch store filters:", error);
  }

  // Translate URL Sort Parameter to WPGraphQL Input
  let orderby: { field: string; order: string }[] = [{ field: "DATE", order: "DESC" }];
  if (sort === "price_asc") {
    orderby = [{ field: "PRICE", order: "ASC" }];
  } else if (sort === "price_desc") {
    orderby = [{ field: "PRICE", order: "DESC" }];
  }

  // Translate URL Filter Parameters to WPGraphQL Taxonomy Filters
  const filters = [];
  if (nicotine) {
    const nicotineTerms = nicotine.split(",").filter(Boolean);
    if (nicotineTerms.length > 0) {
      filters.push({
        taxonomy: "PA_NICOTINE",
        terms: nicotineTerms,
        field: "SLUG",
        operator: "IN"
      });
    }
  }
  if (flavor) {
    const flavorTerms = flavor.split(",").filter(Boolean);
    if (flavorTerms.length > 0) {
      filters.push({
        taxonomy: "PA_FLAVOR",
        terms: flavorTerms,
        field: "SLUG",
        operator: "IN"
      });
    }
  }

  const taxonomyFilter = filters.length > 0 ? {
    relation: "AND",
    filters
  } : null;

  return (
    <div className="container" style={{ paddingBottom: "3rem" }}>
      {/* ─── Shop Header ─── */}
      <div className="shop-header" id="shop-header">
        <h1>جميع المنتجات</h1>
        <p>تصفح تشكيلتنا الكاملة من أجهزة ونكهات الفيب</p>
        <div className="shop-stats">
          <div className="shop-stat">
            توصيل <strong>سريع</strong> لجميع مناطق الكويت
          </div>
          <div className="shop-divider" />
          <div className="shop-stat">
            الأسعار بالـ <strong>دينار كويتي</strong>
          </div>
        </div>
      </div>

      {/* ─── Layout: Sidebar + Grid ─── */}
      <div className="shop-page-layout">
        <StoreFilters attributes={attributes} />
        
        <div className="shop-content" id="shop-products">
          <Suspense key={`${sort}-${nicotine}-${flavor}`} fallback={<ProductGridSkeleton />}>
            <ShopProductsList orderby={orderby} taxonomyFilter={taxonomyFilter} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

interface ShopProductsListProps {
  orderby: { field: string; order: string }[];
  taxonomyFilter: any;
}

async function ShopProductsList({ orderby, taxonomyFilter }: ShopProductsListProps) {
  let products: WooProduct[] = [];
  try {
    const res = await fetchGraphQL(
      GET_ALL_PRODUCTS_QUERY,
      { first: 100, orderby, taxonomyFilter },
      undefined,
      { cache: "no-store" } // Bypassing caching for filtered results
    );
    products = res.data?.products?.nodes || [];
  } catch (error) {
    console.error("Failed to fetch products for listing:", error);
  }

  if (products.length === 0) {
    return (
      <div className="empty-state" style={{ margin: "2rem auto", textAlign: "center" }}>
        <div className="empty-state-icon" style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
        <p style={{ fontSize: "1.1rem", color: "var(--color-text-secondary)" }}>
          لا توجد منتجات تطابق الفلاتر المحددة. جرب إزالة بعض الفلاتر.
        </p>
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
