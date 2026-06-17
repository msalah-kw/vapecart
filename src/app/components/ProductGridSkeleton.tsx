export default function ProductGridSkeleton() {
  const placeholders = Array.from({ length: 8 });

  return (
    <div className="products-grid">
      {placeholders.map((_, i) => (
        <div key={i} className="product-card skeleton-active">
          <div className="product-card-image">
            <div className="skeleton skeleton-img" />
          </div>
          <div className="product-card-body" style={{ gap: "12px", display: "flex", flexDirection: "column" }}>
            {/* Title */}
            <div className="skeleton skeleton-text" style={{ width: "80%", marginTop: "8px" }} />
            {/* Category */}
            <div className="skeleton skeleton-text" style={{ width: "30%" }} />
            {/* Price */}
            <div className="skeleton skeleton-text" style={{ width: "40%", marginBottom: "8px" }} />
            {/* Button */}
            <div className="skeleton skeleton-btn" />
          </div>
        </div>
      ))}
    </div>
  );
}
