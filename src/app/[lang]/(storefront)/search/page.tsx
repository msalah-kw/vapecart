import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchGraphQL, GET_PRODUCTS_BY_SEARCH, WooProduct } from "@/lib/graphql";
import ProductCard from "@/app/components/ProductCard";
import SearchInput from "@/app/components/SearchInput";
import ProductGridSkeleton from "@/app/components/ProductGridSkeleton";

export const metadata: Metadata = {
  title: "البحث – سحبة فيب",
  description: "ابحث عن أفضل سحبات وبودات ونكهات الفيب في الكويت بأفضل الأسعار.",
  robots: {
    index: false,
    follow: true,
  },
};

interface SearchPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { lang } = await params;
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q;
  const searchQuery = typeof q === "string" ? q.trim() : "";

  return (
    <main className="search-page-container container">
      <h1 className="search-page-title">البحث عن المنتجات</h1>
      
      <div className="search-bar-section">
        <Suspense fallback={<div className="search-fallback">جاري التحميل...</div>}>
          <SearchInput autoFocus />
        </Suspense>
      </div>

      <div className="search-results-section" style={{ marginTop: "2rem" }}>
        {searchQuery ? (
          <Suspense key={searchQuery} fallback={<ProductGridSkeleton />}>
            <SearchResultsList searchQuery={searchQuery} lang={lang} />
          </Suspense>
        ) : (
          <div className="search-empty-state">
            <span className="search-empty-icon" aria-hidden="true">🔍</span>
            <p className="search-empty-text">اكتب اسم المنتج للبحث...</p>
          </div>
        )}
      </div>
    </main>
  );
}

async function SearchResultsList({ searchQuery, lang }: { searchQuery: string, lang: string }) {
  let products: WooProduct[] = [];
  let errorMsg = "";

  try {
    const { data } = await fetchGraphQL(
      GET_PRODUCTS_BY_SEARCH,
      { searchQuery },
      undefined,
      { cache: "no-store", language: lang.toUpperCase() } // Search results shouldn't be cached long-term to ensure freshness
    );
    products = data?.products?.nodes || [];
  } catch (error) {
    console.error("Search fetch error:", error);
    errorMsg = "حدث خطأ أثناء جلب نتائج البحث. يرجى المحاولة مرة أخرى.";
  }

  if (errorMsg) {
    return (
      <div className="search-error-state">
        <p>{errorMsg}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="search-empty-state">
        <span className="search-empty-icon" aria-hidden="true">😔</span>
        <p className="search-empty-text">لم يتم العثور على منتجات مطابقة لبحثك "{searchQuery}"</p>
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} lang={lang} />
      ))}
    </div>
  );
}
