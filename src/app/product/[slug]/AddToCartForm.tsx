'use client';

import { useState } from "react";
import { useCart } from "@/context/CartContext";

interface AttributeNode {
  name: string;
  label: string | null;
  options: string[];
  variation: boolean;
  visible: boolean;
  terms?: {
    nodes: {
      name: string;
      slug: string;
    }[];
  } | null;
}

interface VariationNode {
  id: string;
  databaseId: number;
  name: string;
  price: string | null;
  regularPrice: string | null;
  attributes?: {
    nodes: {
      name: string;
      value: string;
    }[];
  } | null;
}

interface AddToCartFormProps {
  productId: number;
  attributes: AttributeNode[] | null;
  variations: VariationNode[] | null;
}

// Helper to clean up WordPress slug corruption on attributes (e.g., cf%89-0-8 or cf-0-8 -> 0.8)
function cleanAttributeLabel(val: string): string {
  if (!val) return "";
  let decoded = val;
  try {
    decoded = decodeURIComponent(val);
  } catch (e) {}
  
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

export default function AddToCartForm({ productId, attributes, variations }: AddToCartFormProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleQuantityChange = (val: number) => {
    if (val < 1) return;
    setQuantity(val);
  };

  const handleSelectAttribute = (attrName: string, option: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attrName]: option
    }));
  };

  const hasAttributes = attributes && attributes.length > 0;
  const isVariable = hasAttributes && variations && variations.length > 0;

  // Find variation matching selected attributes map
  const findMatchingVariation = () => {
    if (!variations || !hasAttributes) return null;
    
    const selectedKeys = Object.keys(selectedAttributes);
    if (selectedKeys.length !== attributes.length) return null;

    return variations.find(variation => {
      const varAttrs = variation.attributes?.nodes || [];
      return varAttrs.every(attr => {
        const selectedVal = selectedAttributes[attr.name];
        return selectedVal === attr.value;
      });
    }) || null;
  };

  const matchingVariation = isVariable ? findMatchingVariation() : null;
  const canAddToCart = !isVariable || !!matchingVariation;

  const handleAdd = async () => {
    if (!canAddToCart || isAdding) return;
    setIsAdding(true);
    setSuccess(false);

    const variationId = matchingVariation ? matchingVariation.databaseId : undefined;
    const isAdded = await addToCart(productId, quantity, variationId);

    setIsAdding(false);
    if (isAdded) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  // Determine button label text
  let btnText = "أضف إلى السلة";
  if (isAdding) {
    btnText = "جاري الإضافة...";
  } else if (success) {
    btnText = "تمت الإضافة بنجاح!";
  } else if (isVariable && !matchingVariation) {
    const selectedCount = Object.keys(selectedAttributes).length;
    btnText = selectedCount === 0 ? "اختر الخيارات للمتابعة" : "أكمل بقية الخيارات";
  }

  return (
    <div className="add-to-cart-form-container">
      {/* Attribute/Variation Selectors */}
      {hasAttributes && (
        <div className="product-attributes">
          {attributes.map((attr) => {
            const attrLabel = attr.label || attr.name.replace("pa_", "");
            const selectedOption = selectedAttributes[attr.name];

            return (
              <div key={attr.name} className="product-attribute">
                <span className="product-attribute-label">{attrLabel}:</span>
                <div className="product-attribute-options">
                  {attr.options.map((option) => {
                    const isActive = selectedOption === option;
                    const matchedTerm = attr.terms?.nodes?.find(
                      (t) => t.slug === option
                    );
                    const displayName = matchedTerm ? matchedTerm.name : cleanAttributeLabel(option);

                    return (
                      <button
                        key={option}
                        type="button"
                        className={`product-attribute-option ${isActive ? "active" : ""}`}
                        onClick={() => handleSelectAttribute(attr.name, option)}
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

      {/* Quantity Selector and Add to Cart Button */}
      <div className="product-cart-ui">
        <div className="quantity-selector">
          <button
            type="button"
            className="quantity-btn decrement"
            onClick={() => handleQuantityChange(quantity - 1)}
            aria-label="تقليل الكمية"
            disabled={isAdding}
          >
            −
          </button>
          <input
            type="number"
            className="quantity-val"
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            min="1"
            aria-label="الكمية"
            disabled={isAdding}
          />
          <button
            type="button"
            className="quantity-btn increment"
            onClick={() => handleQuantityChange(quantity + 1)}
            aria-label="زيادة الكمية"
            disabled={isAdding}
          >
            +
          </button>
        </div>

        <button
          type="button"
          className={`add-to-cart-btn ${success ? "success-state" : ""} ${!canAddToCart ? "disabled-state" : ""}`}
          onClick={handleAdd}
          disabled={!canAddToCart || isAdding}
        >
          {success ? (
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 18c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7 18c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm1.71-1.74l.03-.12h9.11c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.66-.11-1.48-.87-1.48H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7l1.1-2z"/>
            </svg>
          )}
          {btnText}
        </button>
      </div>
    </div>
  );
}
