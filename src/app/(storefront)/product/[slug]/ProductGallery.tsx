'use client';

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useVariation } from "./VariationProvider";

interface ImageNode {
  sourceUrl: string;
  altText?: string;
}

interface ProductGalleryProps {
  mainImage: ImageNode | null;
  galleryImages: ImageNode[] | null;
  productName: string;
}

export default function ProductGallery({ mainImage, galleryImages, productName }: ProductGalleryProps) {
  const { selectedVariationImage } = useVariation();
  const [activeIndex, setActiveIndex] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Reset active image index to 0 and scroll into view when a UNIQUE variation image is selected
  useEffect(() => {
    if (selectedVariationImage) {
      setActiveIndex(0);
      
      // Only scroll if the variation image is different from the main product image
      if (mainImage?.sourceUrl !== selectedVariationImage.sourceUrl) {
        if (galleryRef.current) {
          galleryRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
  }, [selectedVariationImage, mainImage?.sourceUrl]);

  const displayMainImage = selectedVariationImage || mainImage;

  // Combine main image with gallery images, filtering out duplicates
  const allImages: ImageNode[] = [];
  if (displayMainImage) {
    allImages.push(displayMainImage);
  }
  
  if (galleryImages) {
    galleryImages.forEach(img => {
      if (img.sourceUrl && !allImages.some(existing => existing.sourceUrl === img.sourceUrl)) {
        allImages.push(img);
      }
    });
  }

  const activeImage = allImages[activeIndex] || null;

  return (
    <div className="product-gallery" ref={galleryRef}>
      {/* Main Image */}
      <div className="product-gallery-main">
        {activeImage ? (
          <Image
            src={activeImage.sourceUrl}
            alt={activeImage.altText || productName}
            fill
            priority
            unoptimized
            sizes="(max-width: 992px) 100vw, 50vw"
            className="product-gallery-main-image"
          />
        ) : (
          <div className="product-gallery-placeholder" aria-hidden="true">
            📦
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="product-gallery-thumbs">
          {allImages.map((img, index) => (
            <button
              key={index}
              className={`product-gallery-thumb ${index === activeIndex ? "active" : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`عرض الصورة ${index + 1}`}
              type="button"
            >
              <Image
                src={img.sourceUrl}
                alt={img.altText || `${productName} thumbnail ${index + 1}`}
                fill
                unoptimized
                sizes="80px"
                style={{ objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
