import type { Metadata } from "next";
import {
  fetchGraphQL,
  GET_ALL_PRODUCTS_QUERY,
  WooProduct,
} from "@/lib/graphql";
import ProductCard from "@/app/components/ProductCard";

export const metadata: Metadata = {
  title: "المتجر – جميع المنتجات | سحبة فيب",
  description:
    "تصفح جميع منتجات الفيب: سحبات جاهزة، بودات، نكهات سولت، نكهات فيب، كويلات، وأكثر. أسعار بالدينار الكويتي مع توصيل سريع.",
};

export default async function ShopPage() {
  const { data } = await fetchGraphQL(GET_ALL_PRODUCTS_QUERY, { first: 100 });
  const products: WooProduct[] = data?.products?.nodes ?? [];

  return (
    <div className="container">
      {/* ─── Shop Header ─── */}
      <div className="shop-header" id="shop-header">
        <h1>جميع المنتجات</h1>
        <p>تصفح تشكيلتنا الكاملة من أجهزة ونكهات الفيب</p>
        <div className="shop-stats">
          <div className="shop-stat">
            <strong>{products.length}</strong> منتج متوفر
          </div>
          <div className="shop-divider" />
          <div className="shop-stat">
            الأسعار بالـ <strong>دينار كويتي</strong>
          </div>
          <div className="shop-divider" />
          <div className="shop-stat">
            توصيل <strong>سريع</strong> لجميع مناطق الكويت
          </div>
        </div>
      </div>

      {/* ─── Product Grid ─── */}
      <div className="shop-content" id="shop-products">
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
    </div>
  );
}
