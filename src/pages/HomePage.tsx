/**
 * HomePage.tsx — Genzo Silver, 2026 refresh
 * -------------------------------------------------------------
 * Drop this in place of your existing pages/HomePage.tsx.
 * Keeps your existing imports (products, categories, ProductCard, useNav)
 * and your existing Tailwind design tokens (bg-charcoal, text-gold, bg-ivory,
 * bg-beige, border-warm-border, text-text-muted, etc.) — nothing new to
 * configure in tailwind.config.
 *
 * A few assumptions about your `product` shape, since I don't have your
 * data/products.ts file. If a field name differs, adjust inside
 * <ModernProductCard/> — everything else is untouched:
 *   id, name, image (or images[0]), category, price, oldPrice?,
 *   rating, reviewCount, isNew?, isBestSeller?
 *
 * New route needed: navigate('login') should render your new LoginPage.tsx
 * (see the "Collect Your Gift" tile in the social bento section).
 */

import { useEffect, useRef, useState } from 'react';
import { products, categories } from '../data/products';
import { useNav } from '../context/NavContext';
import { useCart } from '../context/CartContext';

/* ------------------------------------------------------------------ */
/*  Small utility: fade/slide an element in once it enters viewport   */
/* ------------------------------------------------------------------ */
function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/* ------------------------------------------------------------------ */
/*  Hero — rotating background instead of one static faded photo      */
/* ------------------------------------------------------------------ */
const heroImages = [
  'https://images.unsplash.com/photo-1633934542430-0905ccb5f050?w=1600&h=1000&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1600&h=1000&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&h=1000&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1600&h=1000&fit=crop&auto=format',
];

function Hero({ navigate }: { navigate: any }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % heroImages.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-charcoal">
      {heroImages.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1500 ease-in-out"
          style={{ backgroundImage: `url('${src}')`, opacity: i === index ? 0.55 : 0 }}
        />
      ))}
      <div className="absolute inset-0 bg-linear-to-r from-charcoal via-charcoal/70 to-charcoal/20" />
      <div className="absolute inset-0 bg-linear-to-t from-charcoal via-transparent to-transparent" />

      <div className="absolute bottom-8 left-4 sm:left-6 lg:left-8 flex gap-2 z-10">
        {heroImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'w-8 bg-gold' : 'w-3 bg-ivory/40 hover:bg-ivory/70'
              }`}
          />
        ))}
      </div>

      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-24 z-10">
        <div className="max-w-xl">
          <p className="text-[10px] tracking-[0.4em] font-sans text-gold font-medium mb-5 uppercase flex items-center gap-3">
            <span className="w-8 h-px bg-gold" />
            Handcrafted in Pakistan
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-ivory leading-tight mb-6">
            Silver that
            <br />
            <em className="italic text-gold-dark">speaks</em> for
            <br />
            itself.
          </h1>
          <p className="text-ivory/70 font-sans text-lg leading-relaxed mb-10 max-w-md">
            92.5 sterling silver jewellery, made by hand in Pakistan. Each piece is an heirloom in the making.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('shop')}
              className="px-8 py-4 bg-gold text-charcoal font-sans font-semibold text-sm tracking-wide rounded-lg hover:bg-gold-dark transition-colors"
            >
              Shop Now
            </button>
            <button
              onClick={() => navigate('about')}
              className="px-8 py-4 border border-ivory/40 text-ivory font-sans font-semibold text-sm tracking-wide rounded-lg hover:border-gold hover:text-gold transition-colors"
            >
              Our Story
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Shop by Category — image tiles instead of plain circles           */
/* ------------------------------------------------------------------ */
function CategoryTiles({ navigate }: { navigate: any }) {
  const { setShopFilter } = useNav();
  return (
    <section className="py-20 bg-ivory">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-[0.4em] font-sans text-gold font-medium mb-3 uppercase">Explore</p>
          <h2 className="font-serif text-4xl text-charcoal">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setShopFilter(cat.label, null);
                navigate('shop');
              }}
              className="group relative aspect-3/4 rounded-2xl overflow-hidden ring-1 ring-warm-border hover:ring-gold transition-all duration-300"
            >
              <img
                src={cat.image}
                alt={cat.label}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-charcoal/85 via-charcoal/10 to-transparent" />
              <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-ivory/0 group-hover:bg-gold flex items-center justify-center transition-all duration-300 translate-y-[-6px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-charcoal">
                  <path d="M7 17 17 7M7 7h10v10" />
                </svg>
              </div>
              <span className="absolute bottom-3 left-3 right-3 text-left text-xs sm:text-sm font-sans font-semibold text-ivory">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Featured Collections — asymmetric bento instead of a plain scroller */
/* ------------------------------------------------------------------ */
const featuredCollections = [
  {
    title: 'The Lunar Edit',
    description: 'Crescent moons and celestial motifs for quiet dreamers.',
    image: 'https://images.unsplash.com/photo-1511253819057-5408d4d70465?w=1000&h=1200&fit=crop&auto=format',
    tag: 'Trending',
  },
  {
    title: 'Everyday Elegance',
    description: 'Minimal pieces designed to be worn every single day.',
    image: 'https://images.unsplash.com/photo-1656010280162-772358d9f4ed?w=900&h=650&fit=crop&auto=format',
    tag: 'Bestseller',
  },
  {
    title: 'Gift Collection',
    description: 'Curated sets, beautifully packaged. Ready to gift.',
    image: 'https://images.unsplash.com/photo-1673131158656-84601f4d00ea?w=900&h=650&fit=crop&auto=format',
    tag: 'Limited',
  },
];

function FeaturedCollections({ navigate }: { navigate: any }) {
  const [big, top, bottom] = featuredCollections;
  const Tile = ({ col, className = '' }: { col: typeof big; className?: string }) => (
    <button
      onClick={() => navigate('shop')}
      className={`group relative rounded-2xl overflow-hidden text-left ${className}`}
    >
      <img
        src={col.image}
        alt={col.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-linear-to-t from-charcoal/90 via-charcoal/20 to-transparent group-hover:from-charcoal/95 transition-all" />
      <span className="absolute top-4 left-4 text-[10px] tracking-[0.2em] uppercase font-sans font-semibold text-charcoal bg-gold px-3 py-1 rounded-full">
        {col.tag}
      </span>
      <div className="absolute inset-x-0 bottom-0 p-6">
        <h3 className="font-serif text-2xl text-ivory mb-1">{col.title}</h3>
        <p className="text-ivory/70 text-sm font-sans mb-3 max-w-xs">{col.description}</p>
        <span className="inline-flex items-center gap-1 text-xs font-sans text-gold font-medium tracking-wide border-b border-gold pb-0.5 group-hover:gap-2 transition-all">
          Shop Collection
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </span>
      </div>
    </button>
  );

  return (
    <section className="py-20 bg-beige">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-[0.4em] font-sans text-gold font-medium mb-3 uppercase">Curated</p>
          <h2 className="font-serif text-4xl text-charcoal">Featured Collections</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-auto md:h-[560px]">
          <Tile col={big} className="h-[320px] md:h-full" />
          <div className="grid grid-rows-2 gap-5 h-[560px] md:h-full">
            <Tile col={top} className="h-full" />
            <Tile col={bottom} className="h-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  The Genzo Promise — cards stagger in one after another on scroll  */
/* ------------------------------------------------------------------ */
const trustFeatures = [
  {
    title: 'Authentic 92.5 Silver',
    description: 'Every piece is stamped and certified. No plating, no compromise.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Secure Payment',
    description: 'COD, JazzCash, EasyPaisa, and bank transfer — all safe.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    title: 'Fast Delivery',
    description: '2–5 business days across Pakistan. Same-day in Karachi.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    title: 'Cash on Delivery',
    description: 'Pay when it arrives at your door — no upfront risk.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

function GenzoPromise() {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);

  return (
    <section className="py-20 bg-charcoal">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-[10px] tracking-[0.4em] font-sans text-gold font-medium mb-3 uppercase">Why Genzo</p>
          <h2 className="font-serif text-4xl text-ivory">The Genzo Promise</h2>
        </div>
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustFeatures.map((feat, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center p-6 rounded-xl border border-ivory/10 hover:border-gold/40 hover:-translate-y-1 transition-all duration-500"
              style={{
                transitionProperty: 'opacity, transform',
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(24px)',
                transitionDelay: `${i * 180}ms`,
                transitionDuration: '700ms',
              }}
            >
              <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-4">
                {feat.icon}
              </div>
              <h3 className="font-serif text-lg text-ivory mb-2">{feat.title}</h3>
              <p className="text-ivory/50 text-sm font-sans leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Modern product card (used for Best Sellers / New Arrivals)        */
/*  Adjust field names below to match your real `product` type.       */
/* ------------------------------------------------------------------ */
function ModernProductCard({ product }: { product: any }) {
  const { addToCart, wishlistIds, toggleWishlist } = useCart();
  const { navigate } = useNav();
  const [added, setAdded] = useState(false);

  const img = product.image || product.images?.[0];
  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : product.oldPrice && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : null;
  const isWishlisted = wishlistIds.includes(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: img,
      size: product.sizes?.[0] ?? 'One Size',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      className="group cursor-pointer"
      onClick={() => navigate('product', product.id)}
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-beige mb-3">
        <img
          src={img}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isNew && (
            <span className="text-[10px] font-sans font-bold uppercase tracking-wide bg-charcoal text-ivory px-2.5 py-1 rounded-full">New</span>
          )}
          {discount && (
            <span className="text-[10px] font-sans font-bold uppercase tracking-wide bg-gold text-charcoal px-2.5 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          {product.isBestSeller && !product.isNew && (
            <span className="text-[10px] font-sans font-bold uppercase tracking-wide bg-ivory text-charcoal px-2.5 py-1 rounded-full border border-warm-border">
              Bestseller
            </span>
          )}
        </div>

        <button
          onClick={handleWishlist}
          aria-label="Add to wishlist"
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isWishlisted
              ? 'bg-gold text-white shadow-md'
              : 'bg-ivory/90 text-charcoal hover:bg-ivory hover:text-gold'
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke={isWishlisted ? 'currentColor' : '#1a1a1a'} strokeWidth="1.8">
            <path d="M12 21s-7.5-4.6-10-9.1C.6 8.2 2.4 4.5 6 4c2-.3 3.7.7 6 3 2.3-2.3 4-3.3 6-3 3.6.5 5.4 4.2 4 7.9-2.5 4.5-10 9.1-10 9.1z" />
          </svg>
        </button>

        <div className="absolute inset-x-3 bottom-3 z-10 translate-y-14 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={handleAddToCart}
            className={`w-full py-2.5 text-xs font-sans font-semibold tracking-wide rounded-lg flex items-center justify-center gap-2 transition-colors ${
              added
                ? 'bg-success text-white'
                : 'bg-ivory/95 hover:bg-ivory text-charcoal shadow-md hover:bg-gold hover:text-charcoal'
            }`}
          >
            {added ? (
              '✓ Added to Cart'
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></svg>
                Quick Add
              </>
            )}
          </button>
        </div>
      </div>

      <p className="text-[10px] font-sans uppercase tracking-wide text-gold font-medium mb-1 capitalize">{product.category}</p>
      <h3 className="font-serif text-base text-charcoal mb-1 line-clamp-1 group-hover:text-gold-dark transition-colors">{product.name}</h3>
      {product.rating && (
        <div className="flex items-center gap-1 mb-1.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(s => (
              <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s <= Math.round(product.rating) ? '#C9A44C' : '#e5ddcf'}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          {(product.reviews || product.reviewCount) && (
            <span className="text-[11px] text-text-muted font-sans ml-1">({product.reviews || product.reviewCount})</span>
          )}
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="font-sans font-semibold text-sm text-charcoal">PKR {product.price?.toLocaleString?.() ?? product.price}</span>
        {(product.comparePrice || product.oldPrice) && (
          <span className="font-sans text-xs text-text-muted line-through">PKR {(product.comparePrice || product.oldPrice)?.toLocaleString?.()}</span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Best Sellers + New Arrivals sections                              */
/* ------------------------------------------------------------------ */
function BestSellers() {
  const bestSellersRef = useRef<HTMLDivElement>(null);
  const bestSellers = products.filter((p: any) => p.isBestSeller).slice(0, 8);

  const scroll = (dir: 'left' | 'right') => {
    bestSellersRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  return (
    <section className="py-20 bg-ivory">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-1/3 flex flex-col shrink-0 justify-center text-left">
            <p className="text-[10px] tracking-[0.4em] font-sans text-gold font-medium mb-2 uppercase">Popular</p>
            <h2 className="font-serif text-5xl text-charcoal mb-4">Best Sellers</h2>
            <p className="font-sans text-text-muted text-sm leading-relaxed max-w-sm mb-6">
              Discover our most loved pieces. Handcrafted with precision and designed to make a statement.
            </p>
            <div className="flex gap-2">
              <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full border border-warm-border flex items-center justify-center hover:bg-gold hover:border-gold hover:text-white transition-colors" aria-label="Previous">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full border border-warm-border flex items-center justify-center hover:bg-gold hover:border-gold hover:text-white transition-colors" aria-label="Next">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
          </div>

          <div className="lg:w-2/3 overflow-hidden">
            <div ref={bestSellersRef} className="flex overflow-x-auto gap-5 pb-4 snap-x snap-mandatory scroll-smooth scrollbar-none">
              {bestSellers.map((product: any) => (
                <div key={product.id} className="w-[200px] sm:w-[220px] snap-start shrink-0">
                  <ModernProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NewArrivals({ navigate }: { navigate: any }) {
  const newArrivals = products.filter((p: any) => p.isNew).slice(0, 4);
  return (
    <section className="py-20 bg-beige">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] tracking-[0.4em] font-sans text-gold font-medium mb-2 uppercase">Just In</p>
            <h2 className="font-serif text-4xl text-charcoal">New Arrivals</h2>
          </div>
          <button
            onClick={() => navigate('shop')}
            className="text-sm font-sans text-gold hover:text-gold-dark font-medium border-b border-gold hover:border-gold-dark transition-colors pb-0.5"
          >
            View All →
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product: any) => (
            <ModernProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Social bento — Instagram / Facebook / TikTok / Collect Your Gift  */
/* ------------------------------------------------------------------ */
const instagramImages = [
  'https://images.unsplash.com/photo-1633934542430-0905ccb5f050?w=400&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1701450706884-9cd56416ac6c?w=400&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1585053736987-f817dc225fc5?w=400&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1673131158656-84601f4d00ea?w=400&h=400&fit=crop&auto=format',
];

function SocialBento() {
  return (
    <section className="py-20 bg-ivory">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.4em] font-sans text-gold font-medium mb-3 uppercase">Community</p>
          <h2 className="font-serif text-4xl text-charcoal">Join the Genzo Circle</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-4 h-auto lg:h-[440px]">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/p/DaqFm11grGQ/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative col-span-2 lg:row-span-2 rounded-3xl overflow-hidden bg-charcoal min-h-[300px] lg:min-h-0"
          >
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 opacity-70 group-hover:opacity-90 transition-opacity">
              {instagramImages.map((img, i) => (
                <img key={i} src={img} alt="" className="w-full h-full object-cover" />
              ))}
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-charcoal via-charcoal/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="w-10 h-10 rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>
              </div>
              <h3 className="font-serif text-2xl text-ivory mb-1">@genzosilver</h3>
              <p className="text-ivory/60 text-sm font-sans">Follow for daily styling & behind-the-scenes</p>
            </div>
          </a>

          {/* Facebook */}
          <a
            href="#"
            className="group relative rounded-3xl overflow-hidden bg-linear-to-br from-[#1877F2] to-[#0d5fce] p-6 flex flex-col justify-between min-h-[140px]"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" /></svg>
            <div>
              <h3 className="font-sans font-semibold text-white text-lg">Like our Page</h3>
              <p className="text-white/70 text-xs font-sans">Offers & new drops first</p>
            </div>
          </a>

          {/* Claim Your Gift */}
          <a
            href="#"
            className="group relative rounded-3xl overflow-hidden bg-gold/10 p-6 flex flex-col justify-between border border-gold/30 min-h-[300px] lg:min-h-0 lg:row-span-2 col-span-2 sm:col-span-1"
          >
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-gold/20 rounded-full blur-3xl"></div>
            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold mb-4 relative z-10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
            </div>
            <div className="relative z-10 mt-auto">
              <h3 className="font-serif font-bold text-charcoal text-2xl mb-2">Claim Your Gift</h3>
              <p className="text-charcoal/70 text-sm font-sans mb-5">Sign up today and get a surprise gift with your first jewelry purchase.</p>
              <button className="px-5 py-2.5 rounded-full bg-charcoal text-white text-sm font-medium w-fit hover:bg-black transition-colors flex items-center gap-2">
                Get it now
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </a>

          {/* TikTok */}
          <a
            href="#"
            className="group relative rounded-3xl overflow-hidden bg-charcoal p-6 flex flex-col justify-between min-h-[140px]"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M16.6 5.82c-.9-.98-1.4-2.26-1.4-3.65h-3.02v13.4c0 1.5-1.22 2.71-2.72 2.71a2.72 2.72 0 0 1-2.71-2.71c0-1.5 1.22-2.72 2.71-2.72.28 0 .55.05.8.13v-3.08a5.9 5.9 0 0 0-.8-.06A5.75 5.75 0 0 0 3.7 15.5a5.75 5.75 0 0 0 5.76 5.76 5.75 5.75 0 0 0 5.75-5.76V9.4a8.85 8.85 0 0 0 5.17 1.65V8.03c-1.36 0-2.6-.5-3.78-1.62v-.6z" /></svg>
            <div>
              <h3 className="font-sans font-semibold text-ivory text-lg">Watch Reels</h3>
              <p className="text-ivory/50 text-xs font-sans">See pieces come to life</p>
            </div>
          </a>

        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Testimonials — refreshed cards                                    */
/* ------------------------------------------------------------------ */
const testimonials = [
  { name: 'Ayesha Tariq', location: 'Pakistan', rating: 5, text: "I ordered the Crescent Moon Ring for my sister's birthday and she absolutely loved it. The packaging felt as premium as the ring itself.", avatar: 'AT', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop' },
  { name: 'Sara Khan', location: 'Karachi', rating: 5, text: 'Finally a Pakistani jewellery brand that actually delivers on quality. My Rose Thorn Bracelet arrived in two days and it is stunning.', avatar: 'SK', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop' },
  { name: 'Nadia Hussain', location: 'Islamabad', rating: 5, text: 'The Collection Set was a gift to myself and I have zero regrets. You can tell real craftsmanship went into each piece.', avatar: 'NH', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop' },
  { name: 'Fatima Ali', location: 'Lahore', rating: 5, text: 'The details on the necklace are just beautiful. Customer service was also very helpful when I needed to change my address.', avatar: 'FA', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop' },
  { name: 'Zainab Raza', location: 'Peshawar', rating: 5, text: 'I bought this for my wedding and it looked stunning. Everyone asked me where I got it from. Highly recommended!', avatar: 'ZR', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop' },
];

function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => trackRef.current?.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });

  return (
    <section className="py-20 bg-charcoal">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[10px] tracking-[0.4em] font-sans text-gold font-medium mb-3 uppercase">Reviews</p>
            <h2 className="font-serif text-4xl text-ivory">What Our Customers Say</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full border border-ivory/20 flex items-center justify-center hover:bg-gold hover:border-gold hover:text-charcoal text-ivory transition-colors" aria-label="Previous">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full border border-ivory/20 flex items-center justify-center hover:bg-gold hover:border-gold hover:text-charcoal text-ivory transition-colors" aria-label="Next">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>

        <div ref={trackRef} className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-none">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="relative bg-ivory/4 backdrop-blur rounded-3xl p-6 sm:p-8 border border-ivory/10 hover:border-gold/40 shadow-none w-[280px] sm:w-[320px] snap-start shrink-0 flex flex-col transition-colors"
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" className="text-gold/25 mb-3">
                <path d="M9.5 8.5c-2.2 0-4 1.8-4 4s1.8 4 4 4v2c-3.3 0-6-2.7-6-6s2.7-6 6-6v2zm9 0c-2.2 0-4 1.8-4 4s1.8 4 4 4v2c-3.3 0-6-2.7-6-6s2.7-6 6-6v2z" fill="currentColor" />
              </svg>
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map(s => (
                  <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="#C9A44C" className="mr-0.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="font-serif text-base text-ivory/90 leading-relaxed mb-6 grow">{t.text}</p>
              <div className="flex items-center gap-3 pt-4 border-t border-ivory/10 mt-auto">
                {t.image ? (
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-ivory/20" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center text-gold font-serif font-bold text-sm border border-gold/20">
                    {t.avatar}
                  </div>
                )}
                <div>
                  <p className="font-sans font-semibold text-sm text-ivory">{t.name}</p>
                  <p className="font-sans text-xs text-ivory/50">{t.location} · Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function HomePage() {
  const { navigate } = useNav();

  return (
    <main>
      <Hero navigate={navigate} />
      <CategoryTiles navigate={navigate} />
      <FeaturedCollections navigate={navigate} />
      <BestSellers />
      <GenzoPromise />
      <NewArrivals navigate={navigate} />
      <Testimonials />
      <SocialBento />
    </main>
  );
}