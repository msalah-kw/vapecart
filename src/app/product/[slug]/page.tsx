import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchGraphQL, GET_PRODUCT_BY_SLUG_QUERY, cleanPrice, truncateText } from "@/lib/graphql";
import ProductGallery from "./ProductGallery";
import AddToCartForm from "./AddToCartForm";

interface ProductPageProps {
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

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  try {
    const { data } = await fetchGraphQL(GET_PRODUCT_BY_SLUG_QUERY, { id: decodedSlug }, undefined, { revalidate: 60 });
    const product = data?.product;

    if (!product) {
      return {
        title: "المنتج غير موجود | سحبة فيب",
        description: "عذراً، هذا المنتج غير متوفر حالياً.",
      };
    }

    const cleanTitle = sanitizeTerminology(product.name);
    const rawDesc = product.shortDescription || product.description || "";
    const cleanDesc = truncateText(sanitizeTerminology(rawDesc), 160);

    const seo = product.seo;
    const title = seo?.title || `${cleanTitle} | سحبة فيب`;
    const description = seo?.metaDesc || cleanDesc;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: product.image?.sourceUrl ? [{ url: product.image.sourceUrl }] : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata for product page:", error);
    return {
      title: "تفاصيل المنتج | سحبة فيب",
      description: "عرض تفاصيل المنتج ومواصفاته.",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  let product = null;

  try {
    const { data } = await fetchGraphQL(GET_PRODUCT_BY_SLUG_QUERY, { id: decodedSlug }, undefined, { revalidate: 60 });
    product = data?.product;
  } catch (error) {
    console.error("Error fetching product details:", error);
  }

  if (!product) {
    notFound();
  }

  const name = sanitizeTerminology(product.name);
  const description = sanitizeTerminology(product.description || "");
  const shortDescription = sanitizeTerminology(product.shortDescription || "");
  
  const price = cleanPrice(product.price);
  const regularPrice = cleanPrice(product.regularPrice);
  const isSale = regularPrice && price && parseFloat(regularPrice) > parseFloat(price);

  const categories = product.productCategories?.nodes || [];
  const primaryCategory = categories[0] || null;

  const galleryImages = product.galleryImages?.nodes || [];
  const attributes = product.attributes?.nodes || [];
  const variations = product.variations?.nodes || [];

  return (
    <main className="product-page-container container">
      {/* Breadcrumbs / Navigation Trail */}
      <nav className="breadcrumbs" aria-label="مسار التنقل">
        <Link href="/">الرئيسية</Link>
        <span className="separator">/</span>
        <Link href="/shop">المتجر</Link>
        {primaryCategory && (
          <>
            <span className="separator">/</span>
            <Link href={`/category/${primaryCategory.slug}`}>
              {sanitizeTerminology(primaryCategory.name)}
            </Link>
          </>
        )}
        <span className="separator">/</span>
        <span className="current" aria-current="page">{name}</span>
      </nav>

      {/* Product Details Grid */}
      <div className="product-details-grid">
        {/* Gallery Column */}
        <ProductGallery
          mainImage={product.image}
          galleryImages={galleryImages}
          productName={name}
        />

        {/* Info Column */}
        <div className="product-info">
          {primaryCategory && (
            <div className="product-meta-category">
              <Link href={`/category/${primaryCategory.slug}`}>
                {sanitizeTerminology(primaryCategory.name)}
              </Link>
            </div>
          )}

          <h1 className="product-title">{name}</h1>

          {/* Price */}
          <div className="product-price-section">
            {price ? (
              <>
                <span className="product-price">
                  {price}
                  <span className="currency">د.ك</span>
                </span>
                {isSale && (
                  <span className="product-price-regular">
                    {regularPrice} د.ك
                  </span>
                )}
              </>
            ) : (
              <span className="product-price-unavailable">السعر غير متوفر</span>
            )}
          </div>

          {/* Short Excerpt */}
          {shortDescription && (
            <div 
              className="product-short-desc"
              dangerouslySetInnerHTML={{ __html: shortDescription }}
            />
          )}

          {/* Add to Cart client form (pills selector & qty) */}
          <AddToCartForm
            productId={product.databaseId}
            attributes={attributes}
            variations={variations}
          />

          {/* Feature Badges */}
          <div className="product-features-badges">
            <div className="feature-badge">
              <span className="feature-badge-icon" aria-hidden="true">⚡️</span>
              <span className="feature-badge-title">توصيل سريع</span>
              <span className="feature-badge-desc">خلال ساعات داخل الكويت</span>
            </div>
            <div className="feature-badge">
              <span className="feature-badge-icon" aria-hidden="true">🛡️</span>
              <span className="feature-badge-title">أصلي 100%</span>
              <span className="feature-badge-desc">منتجات أصلية مضمونة</span>
            </div>
            <div className="feature-badge">
              <span className="feature-badge-icon" aria-hidden="true">💳</span>
              <span className="feature-badge-title">دفع آمن</span>
              <span className="feature-badge-desc">الدفع نقداً أو بالبطاقة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      {description && (
        <section className="product-description-tabs">
          <h2 className="description-tab-header">تفاصيل ومواصفات المنتج</h2>
          <div 
            className="description-content"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </section>
      )}
    </main>
  );
}
