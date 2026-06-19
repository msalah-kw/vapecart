import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  fetchGraphQL,
  GET_PRODUCTS_BY_CATEGORY_QUERY,
  GET_STORE_FILTERS,
  WooProduct,
  truncateText,
} from "@/lib/graphql";
import ProductCard from "@/app/components/ProductCard";
import StoreFilters from "@/app/components/StoreFilters";
import ProductGridSkeleton from "@/app/components/ProductGridSkeleton";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; nicotine?: string; flavor?: string }>;
}

// Translate/Replace database content to conform with strict terminology requirements
function sanitizeTerminology(text: string): string {
  if (!text) return "";
  return text
    .replace(/تبريد/g, "ايس")
    .replace(/موشة/g, "سحبة")
    .replace(/حسب التوفر/g, "")
    .replace(/غيومك/g, "")
    .replace(/Ikon/gi, "Icon")
    .replace(/بطيخ/g, "رقي")
    .replace(/خراطيش/g, "بودات")
    .replace(/السائل الالكتروني/g, "النكهة")
    .replace(/أنظمة البود/g, "بودات")
    .replace(/بنك طاقة/gi, "باور بانك");
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  try {
    const { data } = await fetchGraphQL(GET_PRODUCTS_BY_CATEGORY_QUERY, {
      categorySlugId: decodedSlug,
      categorySlugStr: decodedSlug,
      first: 1,
    }, undefined, { revalidate: 60 });

    const category = data?.productCategory;

    if (!category) {
      return {
        title: "القسم غير موجود | سحبة فيب",
        description: "عذراً، هذا القسم غير متوفر حالياً.",
      };
    }

    const cleanTitle = sanitizeTerminology(category.name);
    const cleanDesc = category.description
      ? sanitizeTerminology(category.description)
      : `تصفح منتجات قسم ${cleanTitle} في متجر سحبة فيب بأفضل الأسعار وتوصيل سريع في الكويت.`;

    const title = `${cleanTitle} – سحبة فيب`;
    const description = truncateText(cleanDesc, 160);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sahbavape.com";
    const canonicalUrl = `${siteUrl}/category/${decodedSlug}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: "سحبة فيب",
        locale: "ar_KW",
        images: [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch (error) {
    console.error("Error generating metadata for category page:", error);
    return {
      title: "تصفح القسم | سحبة فيب",
      description: "تصفح منتجات الفيب حسب القسم.",
    };
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const { slug } = resolvedParams;
  const decodedSlug = decodeURIComponent(slug);

  const sort = resolvedSearchParams.sort;
  const nicotine = resolvedSearchParams.nicotine;
  const flavor = resolvedSearchParams.flavor;

  let categoryName = "";
  let categoryDescription = "";
  let productCount = 0;
  let isFound = false;
  let hasError = false;

  // Fetch Category Info & Store Filters
  let attributes = [];
  try {
    const [categoryRes, filtersRes] = await Promise.all([
      fetchGraphQL(GET_PRODUCTS_BY_CATEGORY_QUERY, {
        categorySlugId: decodedSlug,
        categorySlugStr: decodedSlug,
        first: 1, // Only to get category details
      }, undefined, { revalidate: 60 }),
      fetchGraphQL(GET_STORE_FILTERS, {}, undefined, { revalidate: 3600 })
    ]);

    if (categoryRes.data?.productCategory) {
      isFound = true;
      categoryName = sanitizeTerminology(categoryRes.data.productCategory.name);
      categoryDescription = sanitizeTerminology(
        categoryRes.data.productCategory.description || ""
      );
      productCount = categoryRes.data.productCategory.count || 0;
    }
    attributes = filtersRes.data?.productAttributes?.nodes || [];
  } catch (error) {
    console.error("[CategoryPage] Error fetching category page base details:", error);
    hasError = true;
  }

  if (!isFound) {
    if (hasError) {
      return (
        <div className="container">
          <div className="empty-state" style={{ margin: "4rem auto", textAlign: "center" }}>
            <div className="empty-state-icon" style={{ fontSize: "3rem" }}>⚠️</div>
            <p>حدث خطأ أثناء تحميل القسم. الرجاء المحاولة مرة أخرى لاحقاً.</p>
          </div>
        </div>
      );
    }
    notFound();
  }

  // Map sort parameter
  let orderby: { field: string; order: string }[] = [{ field: "DATE", order: "DESC" }];
  if (sort === "price_asc") {
    orderby = [{ field: "PRICE", order: "ASC" }];
  } else if (sort === "price_desc") {
    orderby = [{ field: "PRICE", order: "DESC" }];
  }

  // Map taxonomy filters
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
      {/* Breadcrumbs */}
      <nav className="breadcrumbs" aria-label="مسار التنقل">
        <Link href="/">الرئيسية</Link>
        <span className="separator">/</span>
        <Link href="/shop">المتجر</Link>
        <span className="separator">/</span>
        <span className="current" aria-current="page">
          {categoryName}
        </span>
      </nav>

      {/* Category Header */}
      <div className="shop-header" id="category-header">
        <h1>القسم: {categoryName}</h1>
        {categoryDescription && <p>{categoryDescription}</p>}
        <div className="shop-stats">
          <div className="shop-stat">
            <strong>{productCount}</strong> منتج في هذا القسم
          </div>
          <div className="shop-divider" />
          <div className="shop-stat">
            توصيل سريع <strong>خلال ساعات</strong>
          </div>
        </div>
      </div>

      {/* Layout Sidebar + Grid */}
      <div className="shop-page-layout">
        <StoreFilters attributes={attributes} />
        
        <div className="shop-content" id="category-products">
          <Suspense key={`${sort}-${nicotine}-${flavor}`} fallback={<ProductGridSkeleton />}>
            <CategoryProductsList
              categorySlugId={decodedSlug}
              categorySlugStr={decodedSlug}
              orderby={orderby}
              taxonomyFilter={taxonomyFilter}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

interface CategoryProductsListProps {
  categorySlugId: string;
  categorySlugStr: string;
  orderby: { field: string; order: string }[];
  taxonomyFilter: any;
}

async function CategoryProductsList({
  categorySlugId,
  categorySlugStr,
  orderby,
  taxonomyFilter,
}: CategoryProductsListProps) {
  let products: WooProduct[] = [];
  try {
    const { data } = await fetchGraphQL(
      GET_PRODUCTS_BY_CATEGORY_QUERY,
      {
        categorySlugId,
        categorySlugStr,
        first: 100,
        orderby,
        taxonomyFilter,
      },
      undefined,
      { cache: "no-store" } // Bypassing caching for filtered results
    );
    products = data?.products?.nodes || [];
  } catch (error) {
    console.error("Failed to fetch category products listing:", error);
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
