import ProductGridSkeleton from "@/app/components/ProductGridSkeleton";

export default function Loading() {
  return (
    <div className="search-page-container container">
      <h1 className="search-page-title">البحث عن المنتجات</h1>
      <div className="search-results-section" style={{ marginTop: "2.5rem" }}>
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
