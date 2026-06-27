import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchGraphQL,
  GET_PRODUCTS_BY_CATEGORY_QUERY,
  WooProduct,
} from "@/lib/graphql";
import { truncateText } from "@/lib/formatters";
import ProductCard from "@/app/components/ProductCard";
import { getLocalizedHref } from "@/lib/i18n";

interface CategoryPageProps {
  params: Promise<{ slug: string; lang: string }>;
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
  const { slug, lang } = await params;
  const decodedSlug = decodeURIComponent(slug);

  try {
    const { data } = await fetchGraphQL(GET_PRODUCTS_BY_CATEGORY_QUERY, {
      categorySlugId: decodedSlug,
      categorySlugStr: decodedSlug,
      first: 1,
      language: lang.toUpperCase(),
    }, undefined, { revalidate: 60, language: lang.toUpperCase() });

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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const { slug, lang } = resolvedParams;
  const decodedSlug = decodeURIComponent(slug);

  let products: WooProduct[] = [];
  let categoryName = "";
  let categoryDescription = "";
  let productCount = 0;
  let isFound = false;
  let hasError = false;

  try {
    const { data } = await fetchGraphQL(GET_PRODUCTS_BY_CATEGORY_QUERY, {
      categorySlugId: decodedSlug,
      categorySlugStr: decodedSlug,
      first: 100,
      language: lang.toUpperCase(),
    }, undefined, { revalidate: 60, language: lang.toUpperCase() });



    if (data?.productCategory) {
      isFound = true;
      categoryName = sanitizeTerminology(data.productCategory.name);
      categoryDescription = sanitizeTerminology(
        data.productCategory.description || ""
      );
      productCount = data.productCategory.count || 0;
      products = data.products?.nodes ?? [];
    } else {
    }
  } catch (error) {
    console.error("[CategoryPage] ✖ Error fetching category products:", error);
    hasError = true;
  }

  if (!isFound) {
    if (hasError) {
      return (
        <div className="container">
          <div className="empty-state" style={{ margin: "4rem auto", textAlign: "center" }}>
            <div className="empty-state-icon" style={{ fontSize: "3rem" }}>⚠️</div>
            <p>حدث خطأ أثناء تحميل المنتجات. الرجاء المحاولة مرة أخرى لاحقاً.</p>
          </div>
        </div>
      );
    }
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sahbavape.com";

  // BreadcrumbList JSON-LD
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "الرئيسية",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "المتجر",
        "item": `${siteUrl}/shop`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": categoryName,
        "item": `${siteUrl}/category/${decodedSlug}`
      }
    ]
  };

  return (
    <div className="container">
      {/* Breadcrumb JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {/* Breadcrumbs */}
      <nav className="breadcrumbs" aria-label="مسار التنقل">
        <Link href={getLocalizedHref("/", lang)}>الرئيسية</Link>
        <span className="separator">/</span>
        <Link href={getLocalizedHref("/shop", lang)}>المتجر</Link>
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

      {/* Product Grid */}
      <div className="shop-content" id="category-products">
        {products.length > 0 ? (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} lang={lang} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <p>لا توجد منتجات حالياً في هذا القسم</p>
          </div>
        )}
      </div>
    </div>
  );
}
