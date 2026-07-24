import { useState } from 'react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import { useNav } from '../context/NavContext';
import { useCart } from '../context/CartContext';

export default function ProductDetailPage() {
  const { selectedProductId, navigate } = useNav();
  const { addToCart, wishlistIds, toggleWishlist } = useCart();

  const product = products.find(p => p.id === selectedProductId) ?? products[0];
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? 'One Size');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [added, setAdded] = useState(false);

  // Review states
  const [reviews, setReviews] = useState([
    { name: 'Farah M.', rating: 5, text: 'Absolutely stunning. The quality is exceptional for the price.', date: 'June 2026' },
    { name: 'Zainab A.', rating: 5, text: 'Ordered as a gift and she cried happy tears. Will order again!', date: 'May 2026' },
    { name: 'Hira B.', rating: 4, text: 'Beautiful piece, delivery was fast. Packaging felt very premium.', date: 'April 2026' },
  ]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewName, setNewReviewName] = useState('');

  const isWishlisted = wishlistIds.includes(product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: selectedSize,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewText.trim()) return;

    const newReview = {
      name: newReviewName,
      rating: newReviewRating,
      text: newReviewText,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };

    setReviews([newReview, ...reviews]);
    setShowReviewForm(false);
    setNewReviewName('');
    setNewReviewText('');
    setNewReviewRating(5);
  };

  return (
    <main className="bg-ivory">
      {/* Breadcrumb */}
      <div className="border-b border-warm-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs font-sans text-text-muted">
            <button onClick={() => navigate('home')} className="hover:text-gold">Home</button>
            <span>/</span>
            <button onClick={() => navigate('shop')} className="hover:text-gold">Shop</button>
            <span>/</span>
            <span className="text-charcoal font-medium capitalize">{product.category}</span>
            <span>/</span>
            <span className="text-charcoal font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
          {/* Left: Images */}
          <div>
            <div className="relative rounded-2xl overflow-hidden bg-beige aspect-square mb-4 border border-warm-border">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discount && (
                <span className="absolute top-4 left-4 px-2.5 py-1 bg-gold text-charcoal text-xs font-bold rounded">
                  -{discount}% OFF
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-gold' : 'border-warm-border hover:border-gold/50'
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div>
            <p className="text-[10px] font-sans tracking-widest text-text-muted uppercase mb-2 capitalize">
              {product.category}
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-charcoal mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(s => (
                  <svg key={s} width="14" height="14" viewBox="0 0 24 24"
                    fill={s <= Math.round(product.rating) ? '#C9A44C' : 'none'}
                    stroke="#C9A44C" strokeWidth="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-text-muted font-sans">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-sans font-bold text-2xl text-charcoal">
                PKR {product.price.toLocaleString()}
              </span>
              {product.comparePrice && (
                <span className="font-sans text-base text-text-muted line-through">
                  PKR {product.comparePrice.toLocaleString()}
                </span>
              )}
              {discount && (
                <span className="text-sm font-semibold text-success">
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Short description */}
            <p className="font-sans text-text-muted leading-relaxed mb-7 text-sm">
              {product.description}
            </p>

            {/* Size selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <p className="font-sans text-sm font-medium text-charcoal mb-3">
                  Size: <span className="text-gold">{selectedSize}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] py-2 px-3 rounded-lg border text-sm font-sans transition-all ${selectedSize === size
                          ? 'border-gold bg-gold/10 text-gold font-semibold'
                          : 'border-warm-border text-text-base hover:border-gold'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Buttons */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              {/* Quantity stepper */}
              <div className="flex items-center border border-warm-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-11 flex items-center justify-center text-text-muted hover:text-charcoal hover:bg-beige transition-colors"
                >
                  −
                </button>
                <span className="w-10 text-center font-sans text-sm text-charcoal font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-11 flex items-center justify-center text-text-muted hover:text-charcoal hover:bg-beige transition-colors"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3 rounded-lg font-sans font-semibold text-sm tracking-wide transition-colors ${added
                    ? 'bg-success text-white'
                    : 'bg-gold text-charcoal hover:bg-gold-dark'
                  }`}
              >
                {added ? '✓ Added to Cart' : 'Add to Cart'}
              </button>

              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-11 h-11 rounded-lg border flex items-center justify-center transition-all ${isWishlisted
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-warm-border text-text-muted hover:border-gold hover:text-gold'
                  }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 py-4 border-t border-b border-warm-border mb-6">
              {[
                { label: 'Authentic 92.5 Silver', icon: '🛡️' },
                { label: 'Free delivery above PKR 5K', icon: '🚚' },
                { label: 'Cash on Delivery', icon: '💵' },
                { label: '7-day easy returns', icon: '↩️' },
              ].map(badge => (
                <div key={badge.label} className="flex items-center gap-1.5 text-xs font-sans text-text-muted">
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>

            {/* Meta */}
            <div className="space-y-1.5 text-xs font-sans text-text-muted">
              <div>Material: <span className="text-charcoal font-medium">{product.material}</span></div>
              <div>Weight: <span className="text-charcoal font-medium">{product.weight}</span></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16 border-t border-warm-border">
          <div className="flex gap-0">
            {(['description', 'specs', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-sans font-medium capitalize transition-colors border-b-2 -mb-px ${activeTab === tab
                    ? 'border-gold text-gold'
                    : 'border-transparent text-text-muted hover:text-charcoal'
                  }`}
              >
                {tab === 'specs' ? 'Specifications' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="py-8 max-w-2xl">
            {activeTab === 'description' && (
              <div className="font-sans text-text-muted leading-relaxed text-sm space-y-4">
                <p>{product.description}</p>
                <p>
                  All Genzo Silver pieces are individually inspected before shipping. Each item is packaged in our signature ivory gift box with a satin ribbon and a care card. Perfect for gifting or treating yourself.
                </p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="space-y-3">
                {[
                  ['Material', product.material],
                  ['Weight', product.weight],
                  ['Category', product.category],
                  ['Purity', '92.5% Sterling Silver (925 Hallmark)'],
                  ['Finish', 'High-polish mirror finish'],
                  ['Care', 'Store in airtight pouch; avoid water and perfumes'],
                ].map(([key, val]) => (
                  <div key={key} className="flex gap-4 py-2 border-b border-warm-border/50 text-sm font-sans">
                    <span className="text-text-muted w-32 shrink-0">{key}</span>
                    <span className="text-charcoal">{val}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl text-charcoal">Customer Reviews</h3>
                  <button 
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="text-sm font-sans font-medium text-gold hover:text-gold-dark transition-colors border border-gold px-4 py-2 rounded-lg"
                  >
                    {showReviewForm ? 'Cancel' : 'Write a Review'}
                  </button>
                </div>

                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} className="bg-beige p-5 rounded-xl border border-warm-border space-y-4 mb-8">
                    <div>
                      <label className="block text-xs font-sans text-text-muted mb-1 uppercase tracking-wider">Your Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReviewRating(star)}
                            className="p-1 focus:outline-none"
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24"
                              fill={star <= newReviewRating ? '#C9A44C' : 'none'} 
                              stroke="#C9A44C" strokeWidth="1.5"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-sans text-text-muted mb-1 uppercase tracking-wider">Your Name</label>
                      <input 
                        type="text" 
                        required
                        value={newReviewName}
                        onChange={(e) => setNewReviewName(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-warm-border rounded-lg text-sm font-sans focus:outline-none focus:border-gold"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans text-text-muted mb-1 uppercase tracking-wider">Your Review</label>
                      <textarea 
                        required
                        value={newReviewText}
                        onChange={(e) => setNewReviewText(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-warm-border rounded-lg text-sm font-sans focus:outline-none focus:border-gold min-h-[100px] resize-y"
                        placeholder="What did you like about this product?"
                      ></textarea>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-charcoal text-white font-sans font-medium text-sm py-3 rounded-lg hover:bg-black transition-colors"
                    >
                      Submit Review
                    </button>
                  </form>
                )}

                <div className="space-y-5">
                  {reviews.map((review, i) => (
                    <div key={i} className="border-b border-warm-border pb-5 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gold/20 text-gold flex items-center justify-center text-xs font-bold uppercase">
                            {review.name[0]}
                          </div>
                          <span className="font-sans font-medium text-sm text-charcoal">{review.name}</span>
                        </div>
                        <span className="text-xs text-text-muted font-sans">{review.date}</span>
                      </div>
                      <div className="flex mb-2">
                        {[1, 2, 3, 4, 5].map(s => (
                          <svg key={s} width="12" height="12" viewBox="0 0 24 24"
                            fill={s <= review.rating ? '#C9A44C' : 'none'} stroke="#C9A44C" strokeWidth="2"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-sm font-sans text-text-muted">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-3xl text-charcoal mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
