import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchGraphQL,
  GET_PRODUCTS_BY_CATEGORY_QUERY,
  WooProduct,
  cleanPrice,
} from "@/lib/graphql";
import ProductCard from "@/app/components/ProductCard";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
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
    });

    const category = data?.productCategory;

    if (!category) {
      return {
        title: "القسم غير موجود | VapeCart",
        description: "عذراً، هذا القسم غير متوفر حالياً.",
      };
    }

    const cleanTitle = sanitizeTerminology(category.name);
    const cleanDesc = category.description
      ? sanitizeTerminology(category.description)
      : `تصفح منتجات قسم ${cleanTitle} في متجر VapeCart بأفضل الأسعار وتوصيل سريع في الكويت.`;

    return {
      title: `${cleanTitle} – VapeCart`,
      description: cleanDesc.slice(0, 160),
    };
  } catch (error) {
    console.error("Error generating metadata for category page:", error);
    return {
      title: "تصفح القسم | VapeCart",
      description: "تصفح منتجات الفيب حسب القسم.",
    };
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
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
    });

    if (data?.productCategory) {
      isFound = true;
      categoryName = sanitizeTerminology(data.productCategory.name);
      categoryDescription = sanitizeTerminology(
        data.productCategory.description || ""
      );
      productCount = data.productCategory.count || 0;
      products = data.products?.nodes ?? [];
    }
  } catch (error) {
    console.error("Error fetching category products:", error);
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

  return (
    <div className="container">
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

      {/* Product Grid */}
      <div className="shop-content" id="category-products">
        {products.length > 0 ? (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
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
