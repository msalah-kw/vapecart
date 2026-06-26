'use client';

import React, { createContext, useContext, useState } from 'react';

interface ImageNode {
  sourceUrl: string;
  altText?: string;
}

type VariationContextType = {
  selectedVariationImage: ImageNode | null;
  setSelectedVariationImage: (image: ImageNode | null) => void;
};

const VariationContext = createContext<VariationContextType>({
  selectedVariationImage: null,
  setSelectedVariationImage: () => {},
});

export const VariationProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedVariationImage, setSelectedVariationImage] = useState<ImageNode | null>(null);

  return (
    <VariationContext.Provider value={{ selectedVariationImage, setSelectedVariationImage }}>
      {children}
    </VariationContext.Provider>
  );
};

export const useVariation = () => useContext(VariationContext);
