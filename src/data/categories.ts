import type { Page } from '../types';

export type NavItem = {
  label: string;
  page?: Page;
  items?: string[];
};

export const navLinks: NavItem[] = [
  {
    label: 'Rings for Her',
    items: ['Moissanite', 'Round Cut', 'Emerald Cut', 'Cushion Cut', 'Pear Cut', 'Asscher Cut', 'Oval Cut', 'Princess Cut', 'Natural Ruby', 'Natural Sapphire', 'Natural Emerald', 'Natural Topaz', 'Natural Citrine', 'Natural Amethyst', 'Freshwater Pearls', 'Cubic Zirconia']
  },
  {
    label: 'Earrings',
    items: ['Moissanite', 'Round Cut', 'Cushion Cut', 'Asscher Cut', 'Natural Ruby', 'Natural Sapphire', 'Natural Emerald', 'Natural Topaz', 'Natural Amethyst', 'Freshwater Pearl', 'Cubic Zirconia']
  },
  {
    label: 'Necklaces',
    items: ['Moissanite', 'Natural Ruby', 'Natural Sapphire', 'Natural Emerald', 'Natural Topaz', 'Natural Citrine', 'Natural Amethyst', 'Freshwater Pearl', 'Cubic Zirconia']
  },
  {
    label: 'Bracelets & Bangles',
    items: ['Bangles', 'Bracelets', 'Anklets']
  },
  {
    label: 'Men',
    items: ['Moissanite Rings', 'Natural Stone Rings', 'Aqeeq', 'Natural Ruby', 'Natural Emerald', 'Natural Sapphire', 'Natural Feroza', 'Bands & Plain Rings', 'Chain & Necklace', 'Cufflinks']
  },
  {
    label: 'Gifts',
    items: ['Eid Gifts', 'Wedding Gifts For Her', 'Wedding Gifts For Him', 'Valentine\'s Day Gifts']
  },
  {
    label: 'Engraving',
    page: 'shop'
  },
  {
    label: 'Genzo',
    items: ['Best Silver Jewellery in Pakistan 2026', 'Moissanite vs Diamond — Honest Comparison', 'Gold Prices — Why Smart Buyers Choose Silver', 'Men\'s Silver Jewellery Guide 2026', 'The Bezel Setting — Ring Trend of 2026']
  },
  {
    label: 'Our Story',
    page: 'about'
  }
];
