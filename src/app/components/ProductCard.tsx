import Image from "next/image";
import Link from "next/link";
import { WooProduct, truncateText, cleanPrice } from "@/lib/graphql";

interface ProductCardProps {
  product: WooProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const price = cleanPrice(product.price);
  const description = truncateText(product.shortDescription || "", 160);
  const categoryName = product.productCategories?.nodes?.[0]?.name;

  return (
    <Link href={`/product/${product.slug}`} className="product-card" id={`product-${product.databaseId}`}>
      {/* Image */}
      <div className="product-card-image">
        {product.image?.sourceUrl ? (
          <Image
            src={product.image.sourceUrl}
            alt={product.image.altText || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 992px) 33vw, 25vw"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="product-card-image-placeholder" aria-hidden="true">
            📦
          </div>
        )}
        {categoryName && (
          <span className="product-card-category">{categoryName}</span>
        )}
      </div>

      {/* Body */}
      <div className="product-card-body">
        <h3 className="product-card-title">{product.name}</h3>

        {description && (
          <p className="product-card-description">{description}</p>
        )}

        <div className="product-card-footer">
          {price ? (
            <span className="product-card-price">
              {price}
              <span className="currency">د.ك</span>
            </span>
          ) : (
            <span className="product-card-price-unavailable">السعر غير متوفر</span>
          )}
        </div>
      </div>
    </Link>
  );
}
