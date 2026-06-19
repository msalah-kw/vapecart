"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { WooProduct, cleanPrice, fetchGraphQL, GET_PRODUCT_BY_SLUG_QUERY } from "@/lib/graphql";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: WooProduct;
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

// Helper to safely URL-decode values (avoiding URIError)
function safeDecode(str: string): string {
  if (!str) return "";
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
}

// Helper to clean up WordPress slug corruption on attributes (e.g., cf%89-0-8 or cf-0-8 -> 0.8)
function cleanAttributeLabel(val: string): string {
  if (!val) return "";
  let decoded = safeDecode(val);
  
  let clean = decoded
    .replace(/cf%89-/gi, "")
    .replace(/cf\u0089-/gi, "")
    .replace(/cf\x89-/gi, "")
    .replace(/cf-/gi, "")
    .replace(/omega-/gi, "")
    .replace(/ohm-/gi, "");
    
  clean = clean.replace(/(\d+)-(\d+)/g, "$1.$2");
  return clean;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  
  // Card states
  const [adding, setAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [fullProduct, setFullProduct] = useState<WooProduct | null>(null);
  
  // Modal choice states
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [modalAdding, setModalAdding] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Portal mounted state
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const price = cleanPrice(product.price);
  const categoryName = product.productCategories?.nodes?.[0]?.name;
  const isVariable = product.__typename === "VariableProduct";

  const cleanName = sanitizeTerminology(product.name);
  const cleanCategoryName = categoryName ? sanitizeTerminology(categoryName) : "";

  // Dynamic Add to Cart Handler
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isVariable) {
      setShowModal(true);
      if (!fullProduct) {
        setModalLoading(true);
        setModalError(null);
        try {
          const { data } = await fetchGraphQL(GET_PRODUCT_BY_SLUG_QUERY, { id: product.slug });
          if (data?.product) {
            setFullProduct(data.product);
            // Pre-select first options if any (only for variation attributes)
            const initialAttrs: Record<string, string> = {};
            const variationAttrs = data.product.attributes?.nodes?.filter((attr: { variation: boolean }) => attr.variation) || [];
            variationAttrs.forEach((attr: { name: string; options: string[] }) => {
              if (attr.options && attr.options.length > 0) {
                initialAttrs[attr.name] = attr.options[0];
              }
            });
            setSelectedAttributes(initialAttrs);
          } else {
            setModalError("حدث خطأ أثناء تحميل بيانات المنتج.");
          }
        } catch (error) {
          console.error("Error loading product variations:", error);
          setModalError("فشل الاتصال بالخادم. الرجاء المحاولة مرة أخرى.");
        } finally {
          setModalLoading(false);
        }
      }
    } else {
      // Simple Product
      setAdding(true);
      try {
        await addToCart(product.databaseId, 1);
      } catch (error) {
        console.error("Error adding simple product to cart:", error);
      } finally {
        setAdding(false);
      }
    }
  };

  // Select Attribute inside Modal
  const handleSelectAttribute = (attrName: string, option: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attrName]: option,
    }));
  };

  const variationAttributes = fullProduct?.attributes?.nodes ? fullProduct.attributes.nodes.filter(attr => attr.variation) : [];
  const hasAttributes = variationAttributes.length > 0;
  const variationsIncomplete = isVariable && fullProduct && (!fullProduct.variations?.nodes || fullProduct.variations.nodes.length === 0);

  // Find variation matching selected attributes map
  const findMatchingVariation = () => {
    if (!fullProduct || !fullProduct.variations?.nodes || !fullProduct.attributes?.nodes || variationsIncomplete) return null;
    
    const selectedKeys = Object.keys(selectedAttributes);
    if (selectedKeys.length !== variationAttributes.length) return null;
    
    return fullProduct.variations.nodes.find((variation) => {
      const varAttrs = variation.attributes?.nodes || [];
      return varAttrs.every((attr) => {
        const selectedVal = selectedAttributes[attr.name];
        return safeDecode(selectedVal) === safeDecode(attr.value);
      });
    }) || null;
  };

  const matchingVariation = fullProduct ? findMatchingVariation() : null;
  const isOutOfStock = product.stockStatus === "OUT_OF_STOCK" || product.stockStatus === "OUTOFSTOCK";
  const isVariationOutOfStock = matchingVariation
    ? (matchingVariation.stockStatus === "OUT_OF_STOCK" || matchingVariation.stockStatus === "OUTOFSTOCK")
    : false;

  const canAddToCart = !isOutOfStock && !variationsIncomplete && (!isVariable || (fullProduct && !!matchingVariation && !isVariationOutOfStock));

  // Add Variation inside Modal
  const handleModalAdd = async () => {
    if (!canAddToCart || modalAdding || !fullProduct) return;
    setModalAdding(true);
    setModalError(null);

    const variationId = matchingVariation ? matchingVariation.databaseId : undefined;
    try {
      const success = await addToCart(product.databaseId, quantity, variationId);
      if (success) {
        setShowModal(false);
        // Reset selections
        setQuantity(1);
      } else {
        setModalError("حدث خطأ أثناء إضافة المنتج إلى السلة.");
      }
    } catch (error) {
      console.error("Error adding product to cart inside modal:", error);
      setModalError("حدث خطأ غير متوقع.");
    } finally {
      setModalAdding(false);
    }
  };

  // Determine display price inside modal
  const variationPrice = matchingVariation ? cleanPrice(matchingVariation.price) : null;
  const displayPrice = variationPrice || price;

  return (
    <div className="product-card" id={`product-${product.databaseId}`}>
      {/* 1. Product Image */}
      <Link href={`/product/${product.slug}`} className="product-card-image-link">
        <div className="product-card-image">
          {product.image?.sourceUrl ? (
            <Image
              src={product.image.sourceUrl}
              alt={product.image.altText || cleanName}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 992px) 33vw, 25vw"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="product-card-image-placeholder" aria-hidden="true">
              📦
            </div>
          )}
        </div>
      </Link>

      {/* Card Content Wrapper */}
      <div className="product-card-body">
        {/* 2. Product Name */}
        <Link href={`/product/${product.slug}`} className="product-card-title-link">
          <h3 className="product-card-title">{cleanName}</h3>
        </Link>

        {/* 3. Category Name */}
        {cleanCategoryName ? (
          <span className="product-card-category-name">{cleanCategoryName}</span>
        ) : (
          <span className="product-card-category-name-spacer">&nbsp;</span>
        )}

        {/* 4. Price */}
        <div className="product-card-price-container">
          {price ? (
            <span className="product-card-price">
              {price}
              <span className="currency">د.ك</span>
            </span>
          ) : (
            <span className="product-card-price-unavailable">السعر غير متوفر</span>
          )}
        </div>

        {/* 5. Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="product-card-add-to-cart-btn"
          disabled={adding}
        >
          {adding ? (
            <>
              <span className="spinner-mini"></span>
              جاري الإضافة...
            </>
          ) : isVariable ? (
            "اختر الخيارات"
          ) : (
            "أضف إلى السلة"
          )}
        </button>
      </div>

      {/* ─── QUICK ADD VARIATIONS MODAL ─── */}
      {showModal && mounted && createPortal(
        <div className="product-modal-overlay" onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowModal(false);
        }}>
          <div className="product-modal-content" onClick={(e) => {
            e.stopPropagation();
          }}>
            <button
              className="product-modal-close"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowModal(false);
              }}
              aria-label="إغلاق"
            >
              ✕
            </button>
            
            <div className="product-modal-body">
              {modalLoading ? (
                <div className="product-modal-loading">
                  <div className="spinner"></div>
                  <p>جاري تحميل الخيارات...</p>
                </div>
              ) : modalError ? (
                <div className="product-modal-error">
                  <p>{modalError}</p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowModal(false);
                    }}
                    className="btn btn-outline"
                    style={{ marginTop: "1rem" }}
                  >
                    إغلاق
                  </button>
                </div>
              ) : fullProduct ? (
                <div className="product-modal-product-details">
                  <div className="product-modal-header-info">
                    <img 
                      src={fullProduct.image?.sourceUrl || product.image?.sourceUrl || ""} 
                      alt={cleanName} 
                      className="product-modal-image-thumb" 
                    />
                    <div className="product-modal-title-price">
                      <h4 className="product-modal-title">{cleanName}</h4>
                      <div className="product-modal-price-section">
                        {displayPrice ? (
                          <span className="product-modal-price">
                            {displayPrice} <span className="currency">د.ك</span>
                          </span>
                        ) : (
                          <span className="product-modal-price-unavailable">السعر غير متوفر</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Attributes Selectors */}
                  {hasAttributes && (
                    <div className="product-modal-attributes">
                      {variationAttributes.map((attr) => {
                        const attrLabel = attr.label || attr.name.replace("pa_", "");
                        const selectedOption = selectedAttributes[attr.name];

                        return (
                          <div key={attr.name} className="product-attribute">
                            <span className="product-attribute-label">{attrLabel}:</span>
                            <div className="product-attribute-options">
                              {attr.options.map((option) => {
                                const isActive = selectedOption === option;
                                const matchedTerm = attr.terms?.nodes?.find(
                                  (t) => safeDecode(t.slug) === safeDecode(option)
                                );
                                const displayName = matchedTerm ? matchedTerm.name : cleanAttributeLabel(option);

                                return (
                                  <button
                                    key={option}
                                    type="button"
                                    className={`product-attribute-option ${isActive ? "active" : ""}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleSelectAttribute(attr.name, option);
                                    }}
                                  >
                                    {displayName}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Quantity selector & Add Button */}
                  <div className="product-modal-action-row">
                    <div className="quantity-selector">
                      <button
                        type="button"
                        className="quantity-btn decrement"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setQuantity(prev => Math.max(1, prev - 1));
                        }}
                        disabled={modalAdding}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        className="quantity-val"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        min="1"
                        disabled={modalAdding}
                        aria-label="الكمية"
                      />
                      <button
                        type="button"
                        className="quantity-btn increment"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setQuantity(prev => prev + 1);
                        }}
                        disabled={modalAdding}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className={`add-to-cart-btn btn btn-primary ${!canAddToCart ? "disabled-state" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleModalAdd();
                      }}
                      disabled={!canAddToCart || modalAdding}
                    >
                      {modalAdding
                        ? "جاري الإضافة..."
                        : isOutOfStock
                        ? "نفدت الكمية"
                        : variationsIncomplete
                        ? "غير متوفر: خيارات غير مكتملة"
                        : !matchingVariation
                        ? "اختر الخيارات للمتابعة"
                        : isVariationOutOfStock
                        ? "نفدت الكمية (هذا الخيار غير متوفر)"
                        : "أضف إلى السلة"}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
