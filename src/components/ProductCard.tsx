import { useState } from 'react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useNav } from '../context/NavContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, wishlistIds, toggleWishlist } = useCart();
  const { navigate } = useNav();
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const isWishlisted = wishlistIds.includes(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: product.sizes?.[0] ?? 'One Size',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;

  return (
    <div
      className="group bg-white rounded-xl border border-warm-border overflow-hidden cursor-pointer transition-shadow hover:shadow-lg hover:shadow-charcoal/5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate('product', product.id)}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-beige aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${hovered ? 'scale-105' : 'scale-100'}`}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="px-2 py-0.5 bg-charcoal text-ivory text-[10px] font-sans font-medium tracking-widest rounded">
              NEW
            </span>
          )}
          {discount && (
            <span className="px-2 py-0.5 bg-gold text-charcoal text-[10px] font-sans font-bold rounded">
              -{discount}%
            </span>
          )}
          {product.isBestSeller && !product.isNew && (
            <span className="px-2 py-0.5 bg-ivory text-charcoal text-[10px] font-sans font-medium tracking-widest rounded border border-warm-border">
              BESTSELLER
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isWishlisted
              ? 'bg-gold text-white'
              : 'bg-white/80 text-text-muted hover:bg-white hover:text-gold backdrop-blur-sm'
          }`}
          aria-label="Add to wishlist"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Quick Add */}
        <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${hovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <button
            onClick={handleAddToCart}
            className={`w-full py-3 text-sm font-sans font-semibold tracking-wide transition-colors ${
              added
                ? 'bg-success text-white'
                : 'bg-charcoal text-ivory hover:bg-gold hover:text-charcoal'
            }`}
          >
            {added ? '✓ Added to Cart' : 'Quick Add'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] font-sans tracking-widest text-text-muted uppercase mb-1 capitalize">
          {product.category}
        </p>
        <h3 className="font-serif text-base text-charcoal mb-2 leading-tight group-hover:text-gold-dark transition-colors">
          {product.name}
        </h3>

        {/* Stars */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(star => (
              <svg
                key={star}
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill={star <= Math.round(product.rating) ? '#C9A44C' : 'none'}
                stroke="#C9A44C"
                strokeWidth="2"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          <span className="text-[10px] text-text-muted font-sans">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-sans font-semibold text-charcoal">
            PKR {product.price.toLocaleString()}
          </span>
          {product.comparePrice && (
            <span className="text-sm text-text-muted font-sans line-through">
              {product.comparePrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
