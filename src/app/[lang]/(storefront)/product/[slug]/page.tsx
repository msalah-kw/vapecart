import { cache } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { fetchGraphQLCached, GET_PRODUCT_BY_SLUG_QUERY, WooProduct, getProductReviewsSafe } from "@/lib/graphql";
import { cleanPrice, stripHtml, truncateText } from "@/lib/formatters";
import { sanitizeHtml } from "@/lib/sanitize";
import { getLocalizedHref } from "@/lib/i18n";
import ProductGallery from "./ProductGallery";
import AddToCartForm from "./AddToCartForm";
import { VariationProvider } from "./VariationProvider";
import { getDictionary } from "@/lib/dictionaries";

const DynamicReviews = dynamic(() => import("@/app/components/ProductReviews"), {
  ssr: true,
  loading: () => (
    <div 
      className="skeleton skeleton-active" 
      style={{ 
        height: "128px", 
        borderRadius: "var(--radius-md)", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        color: "var(--color-text-muted)",
        fontSize: "var(--font-size-base)",
        fontWeight: "500",
        border: "1px solid var(--color-border)",
        background: "var(--color-bg-card)",
        margin: "var(--space-xl) 0"
      }}
    >
      جاري تحميل التقييمات...
    </div>
  )
});


interface ProductPageProps {
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

// Memoized helper to fetch product details and share the network query across metadata & page render lifecycle
const getProductData = cache(async (slug: string, lang: string) => {
  const decodedSlug = decodeURIComponent(slug);
  const { data } = await fetchGraphQLCached(GET_PRODUCT_BY_SLUG_QUERY, { id: decodedSlug }, undefined, { revalidate: 3600, language: lang.toUpperCase() });
  return data?.product || null;
});

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug, lang } = await params;

  try {
    const product = await getProductData(slug, lang);

    if (!product) {
      return {
        title: "المنتج غير موجود | سحبة فيب",
        description: "عذراً، هذا المنتج غير متوفر حالياً.",
      };
    }

    const cleanTitle = sanitizeTerminology(product.name);
    const rawDesc = (typeof product.shortDescription === 'string' && product.shortDescription) || 
                    (typeof product.description === 'string' && product.description) || 
                    "";
    const cleanDesc = rawDesc ? truncateText(sanitizeTerminology(rawDesc), 160) : "";

    const title = `${cleanTitle} | سحبة فيب`;
    const description = cleanDesc || `تفاصيل ومواصفات ${cleanTitle} - سحبة فيب.`;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sahbavape.com";
    const canonicalUrl = `${siteUrl}/product/${product.slug}`;

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
        images: product.image?.sourceUrl ? [{ url: product.image.sourceUrl, alt: product.image.altText || cleanTitle }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: product.image?.sourceUrl ? [product.image.sourceUrl] : [],
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
  const resolvedParams = await params;
  console.log("[ProductPage] ➤ Raw params:", JSON.stringify(resolvedParams));
  const { slug, lang } = resolvedParams;
  const decodedSlug = decodeURIComponent(slug);
  console.log("[ProductPage] ➤ Decoded slug:", decodedSlug);

  let product: WooProduct | null = null;

  try {
    product = await getProductData(slug, lang);
  } catch (error) {
    console.error("[ProductPage] ✖ Error fetching product details:", error);
  }

  const dict = await getDictionary(lang);

  if (!product) {
    console.warn("[ProductPage] ⚠ product is null/undefined for slug:", decodedSlug, "→ calling notFound()");
    notFound();
  }

  // Safe fetch reviews in a separate call to protect product details page layout
  const reviewsData = await getProductReviewsSafe(product.id);

  const name = sanitizeTerminology(product.name);
  const description = typeof product.description === 'string' ? sanitizeTerminology(product.description) : "";
  const shortDescription = typeof product.shortDescription === 'string' ? sanitizeTerminology(product.shortDescription) : "";
  
  const price = cleanPrice(product.price);
  const regularPrice = cleanPrice(product.regularPrice);
  const isSale = regularPrice && price && parseFloat(regularPrice) > parseFloat(price);

  const categories = product.productCategories?.nodes || [];
  const primaryCategory = categories[0] || null;

  const galleryImages = product.galleryImages?.nodes || [];
  const attributes = product.attributes?.nodes || [];
  const variations = product.variations?.nodes || [];

  // ─── Product Structured Data (JSON-LD Schema) ───
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sahbavape.com";
  const canonicalUrl = `${siteUrl}/product/${product.slug}`;
  
  const rawLdDesc = (typeof product.shortDescription === 'string' && product.shortDescription) || 
                    (typeof product.description === 'string' && product.description) || 
                    "";
  const cleanLdDesc = rawLdDesc ? truncateText(sanitizeTerminology(rawLdDesc), 160) : "";
  
  const productImages = [
    ...(product.image?.sourceUrl ? [product.image.sourceUrl] : []),
    ...(galleryImages.map((img: { sourceUrl: string }) => img.sourceUrl).filter(Boolean) || [])
  ];

  const rawStock = product.stockStatus || "IN_STOCK";
  const isOutOfStock = rawStock === "OUT_OF_STOCK" || rawStock === "OUTOFSTOCK";
  const availability = isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock";

  const priceString = cleanPrice(product.price) || "0";

  // ─── Dynamic Brand Extraction ───
  // Attempt to extract brand from product attributes (e.g., 'brand', 'ماركة')
  const brandAttrNames = ["brand", "pa_brand", "ماركة", "pa_ماركة"];
  const brandAttr = attributes.find(
    (attr) => brandAttrNames.includes(attr.name?.toLowerCase()) || brandAttrNames.includes(attr.label?.toLowerCase() ?? "")
  );
  const dynamicBrandName = brandAttr?.options?.[0]
    ? (brandAttr.terms?.nodes?.[0]?.name || stripHtml(brandAttr.options[0]))
    : (primaryCategory ? sanitizeTerminology(primaryCategory.name) : undefined);

  // ─── Build Product JSON-LD ───
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "image": productImages,
    "description": cleanLdDesc || `تفاصيل ومواصفات المنتج ${name}`,
    "sku": product.databaseId?.toString() || product.id,
    "offers": {
      "@type": "Offer",
      "url": canonicalUrl,
      "priceCurrency": "KWD",
      "price": priceString,
      "priceValidUntil": "2027-12-31",
      "availability": availability,
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "سحبة فيب"
      }
    }
  };

  // Inject dynamic brand if resolved
  if (dynamicBrandName) {
    jsonLd["brand"] = {
      "@type": "Brand",
      "name": dynamicBrandName
    };
  }

  // Add AggregateRating only when reviews exist (avoids Google warnings)
  if (reviewsData.reviewCount > 0 && reviewsData.averageRating > 0) {
    jsonLd["aggregateRating"] = {
      "@type": "AggregateRating",
      "ratingValue": reviewsData.averageRating.toFixed(1),
      "reviewCount": reviewsData.reviewCount,
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  // ─── BreadcrumbList JSON-LD ───
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
      ...(primaryCategory ? [{
        "@type": "ListItem",
        "position": 3,
        "name": sanitizeTerminology(primaryCategory.name),
        "item": `${siteUrl}/category/${primaryCategory.slug}`
      }] : []),
      {
        "@type": "ListItem",
        "position": primaryCategory ? 4 : 3,
        "name": name,
        "item": canonicalUrl
      }
    ]
  };

  return (
    <main className="product-page-container container">
      {/* Product JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {/* Breadcrumbs / Navigation Trail */}
      <nav className="breadcrumbs" aria-label="مسار التنقل">
        <Link href={getLocalizedHref("/", lang)}>الرئيسية</Link>
        <span className="separator">/</span>
        <Link href={getLocalizedHref("/shop", lang)}>المتجر</Link>
        {primaryCategory && (
          <>
            <span className="separator">/</span>
            <Link href={getLocalizedHref(`/category/${primaryCategory.slug}`, lang)}>
              {sanitizeTerminology(primaryCategory.name)}
            </Link>
          </>
        )}
        <span className="separator">/</span>
        <span className="current" aria-current="page">{name}</span>
      </nav>

      {/* Product Details Grid */}
      <VariationProvider>
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
              <Link href={getLocalizedHref(`/category/${primaryCategory.slug}`, lang)}>
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
              className="product-short-description"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(shortDescription) }}
            />
          )}

          {/* Add to Cart client form (pills selector & qty) */}
          <AddToCartForm
            productId={product.databaseId}
            attributes={attributes}
            variations={variations}
            stockStatus={rawStock}
            dict={dict.cart}
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
      </VariationProvider>

      {/* Description Section */}
      {description && (
        <section className="product-description-tabs">
          <h2 className="description-tab-header">تفاصيل ومواصفات المنتج</h2>
          <div 
            className="product-full-description"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
          />
        </section>
      )}

      {/* Reviews Section with Terminology Sanitizer and Defensive Guards */}
      <DynamicReviews
        productId={product.databaseId}
        initialReviews={(reviewsData.reviews || [])
          .filter((edge: any) => edge && edge.node)
          .map((edge: any) => ({
            rating: edge.rating,
            node: {
              id: edge.node.id,
              databaseId: edge.node.databaseId,
              content: sanitizeTerminology(edge.node.content || ""),
              date: edge.node.date,
              status: edge.node.status,
              approved: edge.node.approved,
              author: edge.node.author ? {
                node: edge.node.author.node ? {
                  name: sanitizeTerminology(edge.node.author.node.name || "")
                } : null
              } : null
            }
          }))}
        averageRating={reviewsData.averageRating || 0}
        reviewCount={reviewsData.reviewCount || 0}
      />
    </main>
  );
}
