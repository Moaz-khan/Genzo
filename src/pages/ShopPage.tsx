import { useState, useMemo, useEffect } from 'react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

import { navLinks } from '../data/categories';
import { useNav } from '../context/NavContext';

const categoryOptions = [
  { id: 'all', label: 'All Jewellery', items: [] as string[] },
  ...navLinks
    .filter(link => link.items || link.page === 'shop')
    .map(link => ({
      id: link.label,
      label: link.label,
      items: link.items || []
    }))
];

const sortOptions = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'best-selling', label: 'Best Selling' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
];

const categoryBanners: Record<string, { title: string; image: string; description: string }> = {
  'all': {
    title: 'All Jewellery',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&h=700&fit=crop&auto=format',
    description: 'Explore our complete collection of handcrafted 92.5 sterling silver heirlooms.',
  },
  'Rings for Her': {
    title: 'Rings for Her',
    image: 'https://images.unsplash.com/photo-1656010280162-772358d9f4ed?w=1600&h=700&fit=crop&auto=format',
    description: 'Solitaires, bands, and statement rings hand-finished by master artisans.',
  },
  'Rings': {
    title: 'Rings',
    image: 'https://images.unsplash.com/photo-1656010280162-772358d9f4ed?w=1600&h=700&fit=crop&auto=format',
    description: 'Solitaires, bands, and statement rings hand-finished by master artisans.',
  },
  'Earrings': {
    title: 'Earrings',
    image: 'https://images.unsplash.com/photo-1692521248622-98a1da77b673?w=1600&h=700&fit=crop&auto=format',
    description: 'Studs, drops, and hoops crafted in mirror-polished 92.5 sterling silver.',
  },
  'Necklaces': {
    title: 'Necklaces',
    image: 'https://images.unsplash.com/photo-1585053736987-f817dc225fc5?w=1600&h=700&fit=crop&auto=format',
    description: 'Pendants, chokers, and layered chains designed to elevate every neckline.',
  },
  'Bracelets & Bangles': {
    title: 'Bracelets & Bangles',
    image: 'https://images.unsplash.com/photo-1631050165122-626a1377fbce?w=1600&h=700&fit=crop&auto=format',
    description: 'Intricate bangles, fine chain bracelets, and wrist cuffs.',
  },
  'Bracelets': {
    title: 'Bracelets',
    image: 'https://images.unsplash.com/photo-1631050165122-626a1377fbce?w=1600&h=700&fit=crop&auto=format',
    description: 'Intricate bangles, fine chain bracelets, and wrist cuffs.',
  },
  'Men': {
    title: "Men's Collection",
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1600&h=700&fit=crop&auto=format',
    description: 'Bold silver bands, natural gemstone rings, and signature chains for men.',
  },
  'Gifts': {
    title: 'Gift Collection',
    image: 'https://images.unsplash.com/photo-1673131158656-84601f4d00ea?w=1600&h=700&fit=crop&auto=format',
    description: 'Curated silver sets in luxury presentation boxes ready for gifting.',
  },
  'Gift Boxes': {
    title: 'Gift Boxes',
    image: 'https://images.unsplash.com/photo-1673131158656-84601f4d00ea?w=1600&h=700&fit=crop&auto=format',
    description: 'Curated silver sets in luxury presentation boxes ready for gifting.',
  },
  'Engraving': {
    title: 'Personalized Engraving',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1600&h=700&fit=crop&auto=format',
    description: 'Custom hand-engraved initials, dates, and names on pure sterling silver.',
  },
  'Chains': {
    title: 'Silver Chains',
    image: 'https://images.unsplash.com/photo-1685489807405-fdffb06aef2c?w=1600&h=700&fit=crop&auto=format',
    description: 'Twisted rope, box, and diamond-cut chains in 92.5 sterling silver.',
  },
  'Pendants': {
    title: 'Silver Pendants',
    image: 'https://images.unsplash.com/photo-1511253819057-5408d4d70465?w=1600&h=700&fit=crop&auto=format',
    description: 'Lunar crescents, floral motifs, and geometric charms.',
  },
  'Watches': {
    title: 'Silver Watches',
    image: 'https://images.unsplash.com/photo-1633934542430-0905ccb5f050?w=1600&h=700&fit=crop&auto=format',
    description: 'Precision timepieces with solid sterling silver bracelets and cases.',
  },
};

export default function ShopPage() {
  const { shopCategory, shopSubCategory, setShopFilter, navigate } = useNav();
  const [selectedCategory, setSelectedCategory] = useState(shopCategory || 'all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(shopSubCategory || null);
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState(15000);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    setSelectedCategory(shopCategory || 'all');
    setSelectedSubCategory(shopSubCategory || null);
    setPage(1);
  }, [shopCategory, shopSubCategory]);

  // Listen for search events from Navbar
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const query = String(e.detail || '').trim();
      if (query) {
        setSearchQuery(query);
        setSelectedCategory('all');
        setSelectedSubCategory(null);
        setShopFilter(null, null);
        setPage(1);
      }
    };
    window.addEventListener('shop-search', handler as EventListener);
    return () => window.removeEventListener('shop-search', handler as EventListener);
  }, [setShopFilter]);

  const filtered = useMemo(() => {
    let result = [...products];

    // Apply search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      const catMapping: Record<string, string> = {
        'Rings for Her': 'rings',
        'Men': 'rings',
        'Earrings': 'earrings',
        'Necklaces': 'necklaces',
        'Bracelets & Bangles': 'bracelets',
        'Gifts': 'gift-boxes',
      };
      const mapped = catMapping[selectedCategory];
      if (mapped) {
        result = result.filter(p => p.category === mapped);
      } else {
        result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
      }
    }

    if (selectedSubCategory) {
      result = result.filter(p => p.name.toLowerCase().includes(selectedSubCategory.toLowerCase()) || p.description.toLowerCase().includes(selectedSubCategory.toLowerCase()));
    }

    result = result.filter(p => p.price <= priceRange);

    if (showInStockOnly) {
      result = result.filter(p => p.inStock);
    }

    switch (sortBy) {
      case 'newest':
        result = result.filter(p => p.isNew).concat(result.filter(p => !p.isNew));
        break;
      case 'best-selling':
        result = result.filter(p => p.isBestSeller).concat(result.filter(p => !p.isBestSeller));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [selectedCategory, selectedSubCategory, sortBy, priceRange, showInStockOnly]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const currentBanner = categoryBanners[selectedCategory] ?? {
    title: selectedCategory,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&h=700&fit=crop&auto=format',
    description: 'Handcrafted 92.5 sterling silver jewellery made in Pakistan.',
  };

  return (
    <main className="bg-ivory min-h-screen">
      {/* Dynamic Hero Banner */}
      <div className="relative min-h-[240px] sm:min-h-[300px] flex items-center justify-center overflow-hidden bg-charcoal">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
          style={{ backgroundImage: `url('${currentBanner.image}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/75 to-charcoal/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-charcoal/40" />

        <div className="relative text-center px-4 py-10 max-w-4xl mx-auto z-10">
          <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase font-sans text-gold font-semibold mb-3 flex items-center justify-center gap-2">
            <span className="w-6 h-px bg-gold/60 inline-block" />
            {selectedSubCategory ? selectedSubCategory : 'GENZO SILVER COLLECTION'}
            <span className="w-6 h-px bg-gold/60 inline-block" />
          </p>

          {/* Outlined Heading */}
          <h1
            className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-widest text-transparent drop-shadow-md select-none transition-all duration-500"
            style={{
              WebkitTextStroke: '1.5px #E8D39E',
              textShadow: '0 0 25px rgba(201, 164, 76, 0.25)',
            }}
          >
            {currentBanner.title}
          </h1>

          <p className="mt-3 text-ivory/80 font-sans text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            {currentBanner.description}
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-ivory/10 border border-ivory/20 backdrop-blur-xs text-[11px] font-sans text-ivory/90">
            <span>✨ {filtered.length} piece{filtered.length !== 1 ? 's' : ''} available</span>
          </div>
        </div>
      </div>

      <div className="w-full px-0 py-8">
        <div className="flex flex-col lg:flex-row gap-0">
          {/* Left Sidebar — Full Left, Narrow */}
          <aside className="hidden lg:flex lg:flex-col w-60 xl:w-64 shrink-0 self-start sticky top-20 min-h-screen border-r border-warm-border bg-[#FDFBF7]">
            <div className="px-5 py-7 space-y-7">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-warm-border">
                <h2 className="font-serif text-base text-charcoal font-semibold flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C9A44C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  Categories & Filters
                </h2>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSubCategory(null);
                    setShopFilter(null, null);
                    setPriceRange(15000);
                    setShowInStockOnly(false);
                    setSortBy('featured');
                    setPage(1);
                  }}
                  className="text-xs font-sans text-gold hover:text-gold-dark font-medium underline"
                >
                  Reset
                </button>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-sans text-[11px] font-bold tracking-widest text-text-muted uppercase mb-3">
                  Categories
                </h3>
                <ul className="space-y-1">
                  {categoryOptions.map(cat => (
                    <li key={cat.id}>
                      <button
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setSelectedSubCategory(null);
                          setShopFilter(cat.id === 'all' ? null : cat.id, null);
                          setPage(1);
                        }}
                        className={`text-sm font-sans w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                          selectedCategory === cat.id
                            ? 'bg-gold/15 text-gold font-semibold border-l-2 border-gold'
                            : 'text-text-base hover:bg-beige hover:text-gold'
                        }`}
                      >
                        <span>{cat.label}</span>
                        {cat.items.length > 0 && (
                          <span className="text-[10px] text-text-muted font-sans font-normal opacity-70">
                            ({cat.items.length})
                          </span>
                        )}
                      </button>

                      {/* Subcategories */}
                      {selectedCategory === cat.id && cat.items.length > 0 && (
                        <ul className="mt-1 ml-3 pl-3 border-l border-gold/30 space-y-1 py-1">
                          {cat.items.map((sub, idx) => (
                            <li key={idx}>
                              <button
                                onClick={() => {
                                  setSelectedSubCategory(sub);
                                  setShopFilter(cat.id, sub);
                                  setPage(1);
                                }}
                                className={`text-xs font-sans w-full text-left px-2.5 py-1 rounded transition-colors ${
                                  selectedSubCategory === sub
                                    ? 'text-gold font-medium bg-gold/10'
                                    : 'text-text-muted hover:text-gold hover:bg-beige'
                                }`}
                              >
                                {sub}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range */}
              <div className="pt-4 border-t border-warm-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-sans text-[11px] font-bold tracking-widest text-text-muted uppercase">
                    Max Price
                  </h3>
                  <span className="text-xs font-sans font-semibold text-gold">
                    PKR {priceRange.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={15000}
                  step={500}
                  value={priceRange}
                  onChange={e => { setPriceRange(Number(e.target.value)); setPage(1); }}
                  className="w-full accent-gold cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-sans text-text-muted mt-1">
                  <span>PKR 1,000</span>
                  <span>PKR 15,000</span>
                </div>
              </div>

              {/* Availability */}
              <div className="pt-4 border-t border-warm-border">
                <h3 className="font-sans text-[11px] font-bold tracking-widest text-text-muted uppercase mb-3">
                  Availability
                </h3>
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-beige/50 hover:bg-beige transition-colors">
                  <input
                    type="checkbox"
                    checked={showInStockOnly}
                    onChange={e => { setShowInStockOnly(e.target.checked); setPage(1); }}
                    className="accent-gold w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="text-xs font-sans text-charcoal font-medium">In Stock Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Center — Main Products Section */}
          <div className="flex-1 min-w-0 px-5 xl:px-8">
            {/* Breadcrumb Navigation — Placed directly above the Product Cards */}
            <div className="bg-white rounded-xl border border-warm-border px-4 py-3 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <nav className="flex items-center gap-2 text-xs font-sans text-text-muted">
                <span onClick={() => navigate('home')} className="hover:text-gold cursor-pointer flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  Home
                </span>
                <span>/</span>
                <span
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSubCategory(null);
                    setShopFilter(null, null);
                  }}
                  className="hover:text-gold cursor-pointer font-medium"
                >
                  Shop
                </span>
                {selectedCategory !== 'all' && (
                  <>
                    <span>/</span>
                    <span className="text-charcoal font-semibold">{categoryOptions.find(c => c.id === selectedCategory)?.label || selectedCategory}</span>
                  </>
                )}
                {selectedSubCategory && (
                  <>
                    <span>/</span>
                    <span className="text-gold font-semibold">{selectedSubCategory}</span>
                  </>
                )}
              </nav>

              {/* Sort + Mobile Filter button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="lg:hidden flex items-center gap-2 text-xs font-sans text-text-base border border-warm-border px-3 py-1.5 rounded-lg hover:border-gold transition-colors bg-beige"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="8" y1="12" x2="20" y2="12" />
                    <line x1="12" y1="18" x2="20" y2="18" />
                  </svg>
                  Filters
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted font-sans font-medium hidden sm:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={e => { setSortBy(e.target.value); setPage(1); }}
                    className="border border-warm-border rounded-lg px-3 py-1.5 text-xs font-sans text-text-base bg-ivory focus:outline-none focus:border-gold cursor-pointer"
                  >
                    {sortOptions.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile filters drawer */}
            {filtersOpen && (
              <div className="lg:hidden mb-6 p-5 bg-white rounded-xl border border-warm-border space-y-6 shadow-sm">
                <div>
                  <h3 className="font-sans text-xs font-semibold tracking-widest text-text-muted uppercase mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setSelectedSubCategory(null);
                          setShopFilter(cat.id === 'all' ? null : cat.id, null);
                          setPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-sans border transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-gold text-charcoal border-gold font-medium'
                            : 'border-warm-border text-text-base hover:border-gold'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedCategory !== 'all' && categoryOptions.find(c => c.id === selectedCategory)?.items.length! > 0 && (
                  <div>
                    <h3 className="font-sans text-xs font-semibold tracking-widest text-text-muted uppercase mb-3">Subcategory</h3>
                    <div className="flex flex-wrap gap-2">
                      {categoryOptions.find(c => c.id === selectedCategory)?.items.map((sub, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedSubCategory(sub);
                            setShopFilter(selectedCategory, sub);
                            setPage(1);
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-sans border transition-colors ${
                            selectedSubCategory === sub
                              ? 'bg-gold text-charcoal border-gold'
                              : 'border-warm-border text-text-base hover:border-gold'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-sans text-xs font-semibold tracking-widest text-text-muted uppercase mb-3">
                    Price up to PKR {priceRange.toLocaleString()}
                  </h3>
                  <input
                    type="range"
                    min={1000}
                    max={15000}
                    step={500}
                    value={priceRange}
                    onChange={e => setPriceRange(Number(e.target.value))}
                    className="w-full accent-gold"
                  />
                </div>
              </div>
            )}

            {/* Product Grid */}
            {paginated.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-warm-border">
                <p className="font-serif text-2xl text-charcoal mb-2">No pieces found</p>
                <p className="text-text-muted font-sans text-sm mb-4">Try adjusting your filters or price range</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSubCategory(null);
                    setShopFilter(null, null);
                    setPriceRange(15000);
                    setShowInStockOnly(false);
                  }}
                  className="px-5 py-2 bg-gold text-charcoal text-xs font-sans font-semibold rounded-lg hover:bg-gold-dark transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {paginated.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-warm-border text-text-muted hover:border-gold hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-sans transition-colors ${
                      p === page
                        ? 'bg-gold text-charcoal font-semibold shadow-xs'
                        : 'border border-warm-border text-text-base hover:border-gold hover:text-gold'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-warm-border text-text-muted hover:border-gold hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  →
                </button>
              </div>
            )}
          </div>

          {/* Right Panel — Tall Luxury Card */}
          <aside className="hidden xl:flex flex-col w-64 shrink-0 self-start sticky top-20 gap-5 py-7 pr-5">

            {/* Trust & Authenticity Card */}
            <div className="bg-charcoal rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-gradient-to-br from-gold/20 to-transparent px-5 pt-6 pb-4 border-b border-white/10">
                <p className="text-[10px] tracking-[0.3em] font-sans text-gold/80 uppercase font-semibold mb-1">Certified Quality</p>
                <h3 className="font-serif text-base text-ivory font-semibold leading-snug">Why Shop with Genzo?</h3>
              </div>
              <div className="px-5 py-5 space-y-4">
                {[
                  { icon: '✦', label: '92.5 Sterling Silver', sub: 'Hallmark Certified' },
                  { icon: '🚚', label: 'Fast Delivery', sub: 'All over Pakistan' },
                  { icon: '↩', label: '7-Day Easy Return', sub: 'Hassle-free policy' },
                  { icon: '💳', label: 'Cash on Delivery', sub: 'Pay when you receive' },
                  { icon: '📦', label: 'Gift Packaging', sub: 'Luxury box included' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-gold text-base mt-0.5 shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-ivory text-xs font-sans font-semibold leading-tight">{item.label}</p>
                      <p className="text-ivory/50 text-[10px] font-sans mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo Code Card */}
            <div className="bg-gradient-to-br from-[#F7F3EC] to-[#EDE5D4] rounded-2xl border border-gold/20 shadow-sm overflow-hidden">
              <div className="px-5 pt-5 pb-4">
                <p className="text-[10px] tracking-[0.3em] font-sans text-gold uppercase font-bold mb-2">✨ Exclusive Offer</p>
                <h3 className="font-serif text-sm text-charcoal font-semibold leading-snug mb-1">First Order Discount</h3>
                <p className="text-[11px] font-sans text-text-muted leading-relaxed mb-4">Get <span className="font-bold text-gold">10% OFF</span> on your first order. Use code at checkout:</p>
                <div className="flex items-center justify-between bg-white rounded-xl border border-gold/30 px-4 py-2.5 mb-3">
                  <span className="font-mono text-sm font-bold text-charcoal tracking-widest">GENZO10</span>
                  <button
                    onClick={() => navigator.clipboard.writeText('GENZO10')}
                    className="text-[10px] font-sans font-semibold text-gold hover:text-gold-dark transition-colors uppercase tracking-wide"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-[10px] font-sans text-text-muted text-center">Valid for new customers only</p>
              </div>
            </div>

            {/* WhatsApp Support */}
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl px-5 py-4 hover:bg-[#25D366]/20 transition-colors group"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <div>
                <p className="text-xs font-sans font-semibold text-charcoal group-hover:text-[#25D366] transition-colors">Need Help?</p>
                <p className="text-[10px] font-sans text-text-muted">Chat on WhatsApp</p>
              </div>
              <svg className="ml-auto w-4 h-4 text-text-muted group-hover:text-[#25D366] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>

          </aside>
        </div>
      </div>
    </main>
  );
}
