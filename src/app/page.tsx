import Link from "next/link";
import {
  fetchGraphQL,
  GET_LATEST_PRODUCTS_QUERY,
  GET_CATEGORIES_QUERY,
  WooProduct,
  WooCategory,
} from "@/lib/graphql";
import ProductCard from "@/app/components/ProductCard";

/* ─── Homepage Categories Config ─── */
const HOMEPAGE_CATEGORIES = [
  { name: "فيب", slug: "vape", icon: "💨" },
  { name: "سحبة زقارة", slug: "pod-system", icon: "🔌" },
  { name: "سحبات جاهزة", slug: "disposable", icon: "🔋" },
  { name: "نكهات فيب", slug: "freebase-eliquids", icon: "🧪" },
  { name: "نكهات سولت", slug: "saltnic-flavors", icon: "🧂" },
  { name: "بودات جاهزة", slug: "closed-pods", icon: "📦" },
  { name: "بودات تعبئة", slug: "refillable-pods", icon: "🔄" },
  { name: "كويلات", slug: "coils", icon: "⚡" },
  { name: "ايقوص", slug: "iqos", icon: "🚬" },
  { name: "اكياس نيكوتين", slug: "nicotine-pouches", icon: "📦" },
  { name: "زقاير وتبغ", slug: "tobacco", icon: "🍂" },
  { name: "شيشة ومعسل", slug: "hookah", icon: "🫧" },
];

export default async function HomePage() {
  /* Fetch data in parallel */
  const [productsRes, categoriesRes] = await Promise.all([
    fetchGraphQL(GET_LATEST_PRODUCTS_QUERY, { first: 12 }),
    fetchGraphQL(GET_CATEGORIES_QUERY),
  ]);

  const products: WooProduct[] = productsRes.data?.products?.nodes ?? [];
  const allCategories: WooCategory[] =
    categoriesRes.data?.productCategories?.nodes ?? [];

  return (
    <>
      {/* ═══ Hero Section ═══ */}
      <section className="hero" id="hero">
        <div className="container">
          <div className="hero-content">
            <span className="hero-badge">متجر الكويت الأول للفيب</span>
            <h1>تسوّق أفضل السحبات والنكهات</h1>
            <p>
              تشكيلة واسعة من سحبات جاهزة، بودات، ونكهات فيب وسولت بأسعار
              منافسة. توصيل سريع لجميع مناطق الكويت.
            </p>
            <div className="hero-actions">
              <Link href="/shop" className="btn btn-primary">
                تصفح المتجر
              </Link>
              <Link href="/category/disposable" className="btn btn-outline">
                سحبات جاهزة
              </Link>
            </div>
          </div>
        </div>
      </section>
 
      {/* ═══ Featured Categories ═══ */}
      <section className="section" id="categories">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">تسوّق حسب القسم</h2>
            <Link href="/shop" className="section-link">
              جميع الأقسام
            </Link>
          </div>

          <div className="categories-grid">
            {HOMEPAGE_CATEGORIES.map((cat) => {
              const wooCat = allCategories.find((c) => c.slug === cat.slug);
              const count = wooCat ? wooCat.count : 0;
              return (
                <Link
                  href={`/category/${cat.slug}`}
                  key={cat.slug}
                  className="category-card"
                  id={`category-${cat.slug}`}
                >
                  <div className="category-icon">{cat.icon}</div>
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
            <Link href="/shop" className="section-link">
              عرض الكل
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
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
