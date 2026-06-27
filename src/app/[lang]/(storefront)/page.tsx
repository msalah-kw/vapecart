import Link from "next/link";
import Image from "next/image";
import {
  fetchGraphQL,
  GET_LATEST_PRODUCTS_QUERY,
  GET_CATEGORIES_QUERY,
  WooProduct,
  WooCategory,
} from "@/lib/graphql";
import ProductCard from "@/app/components/ProductCard";
import { getLocalizedHref } from "@/lib/i18n";

/* ─── Homepage Categories Config ─── */
const HOMEPAGE_CATEGORIES = [
  {
    name: "اجهزة فيب",
    slug: "vape",
    image: "https://lightgrey-flamingo-522119.hostingersite.com/wp-content/uploads/2026/06/اجهزة-فيب.webp",
  },
  {
    name: "سحبات زقارة",
    slug: "pod-system",
    image: "https://lightgrey-flamingo-522119.hostingersite.com/wp-content/uploads/2026/06/زقارة.webp",
  },
  {
    name: "سحبات جاهزة",
    slug: "disposable",
    image: "https://lightgrey-flamingo-522119.hostingersite.com/wp-content/uploads/2026/06/سحبات-جاهزة.webp",
  },
  {
    name: "نكهات شيشة",
    slug: "freebase-eliquids",
    image: "https://lightgrey-flamingo-522119.hostingersite.com/wp-content/uploads/2026/06/نكهات-شيشة.webp",
  },
  {
    name: "نكهات زقارة",
    slug: "saltnic-flavors",
    image: "https://lightgrey-flamingo-522119.hostingersite.com/wp-content/uploads/2026/06/سولت.webp",
  },
  {
    name: "ايقوص",
    slug: "iqos",
    image: "https://lightgrey-flamingo-522119.hostingersite.com/wp-content/uploads/2026/06/ايقوص.webp",
  },
];

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  /* Fetch data in parallel */
  const [productsRes, categoriesRes] = await Promise.all([
    fetchGraphQL(GET_LATEST_PRODUCTS_QUERY, { first: 12, language: lang.toUpperCase() }, undefined, { revalidate: 60, language: lang.toUpperCase() }),
    fetchGraphQL(GET_CATEGORIES_QUERY, { language: lang.toUpperCase() }, undefined, { revalidate: 60, language: lang.toUpperCase() }),
  ]);

  const products: WooProduct[] = productsRes.data?.products?.nodes ?? [];
  const allCategories: WooCategory[] =
    categoriesRes.data?.productCategories?.nodes ?? [];

  return (
    <>
      {/* ═══ Hero Banner Section ═══ */}
      <section className="hero-banner" id="hero-banner">
        <div className="container">
          <Link href={getLocalizedHref("/shop", lang)} className="banner-link">
            <Image 
              src="https://lightgrey-flamingo-522119.hostingersite.com/wp-content/uploads/2026/06/بانر.webp" 
              alt="سحبة فيب - تسوق أفضل السحبات والنكهات في الكويت" 
              className="banner-image"
              width={1366}
              height={526}
              priority
              unoptimized
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          </Link>
        </div>
      </section>
 
      {/* ═══ Featured Categories ═══ */}
      <section className="section" id="categories">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">تسوّق حسب القسم</h2>
            <Link href={getLocalizedHref("/shop", lang)} className="section-link">
              جميع الأقسام
            </Link>
          </div>

          <div className="categories-grid">
            {HOMEPAGE_CATEGORIES.map((cat) => {
              const wooCat = allCategories.find((c) => c.slug === cat.slug);
              const count = wooCat ? wooCat.count : 0;
              return (
                <Link
                  href={getLocalizedHref(`/category/${cat.slug}`, lang)}
                  key={cat.slug}
                  className="category-card"
                  id={`category-${cat.slug}`}
                >
                  <div className="category-icon">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      width={120}
                      height={120}
                      unoptimized
                      className="category-icon-image"
                    />
                  </div>
                  <h3>{cat.name}</h3>
                  <span className="category-count">
                    {count} منتج
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Latest Products ═══ */}
      <section className="section" id="latest-products">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">أحدث المنتجات</h2>
            <Link href={getLocalizedHref("/shop", lang)} className="section-link">
              عرض الكل
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} lang={lang} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p>لا توجد منتجات حالياً</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
