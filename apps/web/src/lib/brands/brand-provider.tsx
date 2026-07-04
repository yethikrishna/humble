'use client';

import { createContext, useContext } from 'react';
import type { Brand } from './types';
import { DEFAULT_BRAND } from './config';

const BrandContext = createContext<Brand>(DEFAULT_BRAND);

export function BrandProvider({
  brand,
  children,
}: {
  brand: Brand;
  children: React.ReactNode;
}) {
  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export function useBrand(): Brand {
  return useContext(BrandContext);
}
