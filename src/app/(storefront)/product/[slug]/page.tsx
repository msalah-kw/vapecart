import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchGraphQL, GET_PRODUCT_BY_SLUG_QUERY, cleanPrice, truncateText, WooProduct, getProductReviewsSafe } from "@/lib/graphql";
import ProductGallery from "./ProductGallery";
import AddToCartForm from "./AddToCartForm";
import ProductReviews from "@/app/components/ProductReviews";

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
  const { slug } = resolvedParams;
  const decodedSlug = decodeURIComponent(slug);
  console.log("[ProductPage] ➤ Decoded slug:", decodedSlug);

  let product: WooProduct | null = null;

  try {
    const { data } = await fetchGraphQL(GET_PRODUCT_BY_SLUG_QUERY, { id: decodedSlug }, undefined, { revalidate: 60 });
    console.log("[ProductPage] ➤ Raw data received:", JSON.stringify(data)?.substring(0, 500));
    product = data?.product;
  } catch (error) {
    console.error("[ProductPage] ✖ Error fetching product details:", error);
  }

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

  // Product Structured Data (JSON-LD Schema)
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

  const jsonLd = {
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
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  return (
    <main className="product-page-container container">
      {/* Product JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
            stockStatus={rawStock}
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

      {/* Reviews Section with Terminology Sanitizer and Defensive Guards */}
      <ProductReviews
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
