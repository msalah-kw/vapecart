import ProductGridSkeleton from "@/app/components/ProductGridSkeleton";

export default function ShopLoading() {
  return (
    <div className="container" style={{ padding: "var(--space-2xl) var(--space-lg)" }}>
      <ProductGridSkeleton />
    </div>
  );
}
