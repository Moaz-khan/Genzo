import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNav } from '../context/NavContext';

const SHIPPING_THRESHOLD = 5000;
const SHIPPING_COST = 250;

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { navigate } = useNav();
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');

  const discount = appliedCoupon === 'GENZO10' ? Math.round(cartTotal * 0.1) : 0;
  const shipping = cartTotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = cartTotal - discount + shipping;

  const handleApplyCoupon = () => {
    if (coupon.toUpperCase() === 'GENZO10') {
      setAppliedCoupon('GENZO10');
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
      setAppliedCoupon('');
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="bg-ivory min-h-screen flex items-center justify-center">
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-beige flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8A8377" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h2 className="font-serif text-3xl text-charcoal mb-3">Your cart is empty</h2>
          <p className="text-text-muted font-sans text-sm mb-8">
            Discover our handcrafted silver jewellery collection.
          </p>
          <button
            onClick={() => navigate('shop')}
            className="px-8 py-3 bg-gold text-charcoal font-sans font-semibold text-sm rounded-lg hover:bg-gold-dark transition-colors"
          >
            Start Shopping
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-serif text-4xl text-charcoal mb-8">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div
                key={item.cartId}
                className="bg-white rounded-xl border border-warm-border p-4 flex items-start gap-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  onClick={() => navigate('product', item.productId)}
                  className="w-20 h-20 object-cover rounded-lg bg-beige cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3
                        className="font-serif text-base text-charcoal cursor-pointer hover:text-gold transition-colors"
                        onClick={() => navigate('product', item.productId)}
                      >
                        {item.name}
                      </h3>
                      {item.size !== 'One Size' && (
                        <p className="text-xs font-sans text-text-muted mt-0.5">Size: {item.size}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="text-text-muted hover:text-danger transition-colors shrink-0 p-1"
                      aria-label="Remove"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-warm-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-charcoal hover:bg-beige transition-colors text-sm"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-sans text-charcoal">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-charcoal hover:bg-beige transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-sans font-semibold text-charcoal text-sm">
                      PKR {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Coupon */}
            <div className="bg-white rounded-xl border border-warm-border p-5">
              <h3 className="font-sans text-sm font-semibold text-charcoal mb-3">Coupon Code</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  placeholder="Enter coupon code (try GENZO10)"
                  className="flex-1 px-4 py-2.5 border border-warm-border rounded-lg text-sm font-sans bg-ivory text-text-base placeholder-text-muted"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="px-5 py-2.5 border border-gold text-gold text-sm font-sans font-semibold rounded-lg hover:bg-gold hover:text-charcoal transition-colors"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-danger text-xs font-sans mt-2">{couponError}</p>}
              {appliedCoupon && (
                <p className="text-success text-xs font-sans mt-2">
                  🎉 Coupon applied! You're saving PKR {discount.toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('shop')}
                className="text-sm font-sans text-gold hover:text-gold-dark border-b border-gold hover:border-gold-dark transition-colors pb-0.5"
              >
                ← Continue Shopping
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-xl border border-warm-border p-6">
              <h2 className="font-serif text-xl text-charcoal mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm font-sans mb-5">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="text-charcoal">PKR {cartTotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Coupon discount (GENZO10)</span>
                    <span>−PKR {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-text-muted">
                  <span>Shipping</span>
                  <span className="text-charcoal">
                    {shipping === 0 ? (
                      <span className="text-success font-medium">Free</span>
                    ) : (
                      `PKR ${shipping}`
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-text-muted">
                    Add PKR {(SHIPPING_THRESHOLD - cartTotal).toLocaleString()} more for free delivery
                  </p>
                )}
              </div>

              <div className="border-t border-warm-border pt-4 mb-6">
                <div className="flex justify-between font-semibold">
                  <span className="font-serif text-base text-charcoal">Total</span>
                  <span className="font-sans text-xl text-charcoal">PKR {total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('checkout')}
                className="w-full py-3.5 bg-gold text-charcoal font-sans font-semibold text-sm tracking-wide rounded-lg hover:bg-gold-dark transition-colors"
              >
                Proceed to Checkout
              </button>

              {/* Payment icons */}
              <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                {['COD', 'JazzCash', 'EasyPaisa', 'Bank'].map(m => (
                  <span key={m} className="px-2 py-0.5 border border-warm-border rounded text-[10px] font-sans text-text-muted">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
