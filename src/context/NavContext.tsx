import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Page } from '../types';

interface NavContextType {
  page: Page;
  navigate: (page: Page, productId?: number) => void;
  selectedProductId: number | null;
  shopCategory: string | null;
  shopSubCategory: string | null;
  setShopFilter: (category: string | null, subCategory?: string | null) => void;
}

const NavContext = createContext<NavContextType | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>('home');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [shopCategory, setShopCategory] = useState<string | null>(null);
  const [shopSubCategory, setShopSubCategory] = useState<string | null>(null);

  const setShopFilter = (category: string | null, subCategory: string | null = null) => {
    setShopCategory(category);
    setShopSubCategory(subCategory);
  };

  const navigate = (p: Page, productId?: number) => {
    setPage(p);
    if (productId !== undefined) setSelectedProductId(productId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NavContext.Provider value={{ page, navigate, selectedProductId, shopCategory, shopSubCategory, setShopFilter }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}
