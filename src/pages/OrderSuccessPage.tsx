import { useEffect, useRef } from 'react';
import { useNav } from '../context/NavContext';
import { useCart } from '../context/CartContext';

export default function OrderSuccessPage() {
  const { navigate } = useNav();
  const { lastOrder } = useCart();

  /* Animate cards in on mount */
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll<HTMLElement>('.order-item-card');
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(32px)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 150 + i * 110);
    });
  }, []);

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 4);
  const formattedDate = deliveryDate.toLocaleDateString('en-PK', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const paymentLabel: Record<string, string> = {
    cod:       'Cash on Delivery',
    jazzcash:  'JazzCash',
    easypaisa: 'EasyPaisa',
    bank:      'Bank Transfer',
    card:      'Debit / Credit Card',
  };

  const items     = lastOrder?.items     ?? [];
  const total     = lastOrder?.total     ?? 0;
  const shipping  = lastOrder?.shipping  ?? 0;
  const payment   = lastOrder?.paymentMethod ?? 'cod';
  const orderNum  = lastOrder?.orderNumber   ?? `GZ-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <main className="min-h-screen bg-charcoal relative overflow-hidden">
      {/* Ambient glow layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-gold/10 blur-[120px]" />
        <div className="absolute bottom-0 right-[15%] w-[400px] h-[400px] rounded-full bg-gold/8 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-14 sm:py-20" ref={containerRef}>

        {/* Header */}
        <div className="text-center mb-12 order-item-card">
          {/* Animated checkmark */}
          <div className="relative w-24 h-24 mx-auto mb-7">
            <div className="absolute inset-0 rounded-full bg-gold/20 animate-ping opacity-30" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-gold to-[#b8922e] flex items-center justify-center shadow-xl shadow-gold/30">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>

          <p className="text-[10px] font-sans tracking-[0.45em] text-gold font-semibold uppercase mb-2">Thank You</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-ivory mb-3">Order Confirmed!</h1>
          <p className="font-sans text-ivory/60 text-sm leading-relaxed max-w-md mx-auto">
            Your order <span className="text-gold font-semibold">{orderNum}</span> has been placed successfully. We're preparing your jewellery with love and care.
          </p>
        </div>

        {/* Meta info strip */}
        <div className="order-item-card grid grid-cols-3 gap-3 mb-10">
          {[
            { label: 'Order No.', value: orderNum },
            { label: 'Delivery', value: formattedDate.split(',')[0] + ', ' + formattedDate.split(' ').slice(-3).join(' ') },
            { label: 'Payment', value: paymentLabel[payment] ?? payment },
          ].map((info, i) => (
            <div key={i}
              className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-3 py-3 text-center">
              <p className="text-[9px] font-sans tracking-[0.3em] uppercase text-ivory/40 mb-1">{info.label}</p>
              <p className="font-sans text-xs font-semibold text-ivory leading-snug">{info.value}</p>
            </div>
          ))}
        </div>

        {/* ── PER-ITEM GLASSMORPHISM CARDS ── */}
        <div className="space-y-4 mb-10">
          {items.length === 0 ? (
            /* Fallback if no order data (page reloaded) */
            <div className="order-item-card rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 text-center">
              <p className="font-serif text-xl text-ivory mb-1">Your order has been placed!</p>
              <p className="text-ivory/50 font-sans text-sm">A confirmation will be sent to your phone.</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={item.cartId}
                className="order-item-card group relative rounded-2xl border border-white/10 bg-white/6 backdrop-blur-lg overflow-hidden shadow-xl shadow-black/30"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)' }}
              >
                {/* Gold shimmer accent */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

                <div className="flex gap-0">
                  {/* Product image */}
                  <div className="relative w-28 sm:w-36 shrink-0 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ minHeight: '140px' }}
                    />
                    {/* Dark overlay gradient on image */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-charcoal/40" />
                    {/* Item number badge */}
                    {items.length > 1 && (
                      <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-gold flex items-center justify-center shadow">
                        <span className="text-charcoal text-[10px] font-bold">{idx + 1}</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 px-5 py-5 flex flex-col justify-between min-w-0">
                    <div>
                      {/* Category badge */}
                      <span className="inline-block text-[9px] font-sans font-semibold tracking-[0.3em] uppercase text-gold/80 mb-2">
                        ✦ Sterling Silver
                      </span>

                      <h3 className="font-serif text-base sm:text-lg text-ivory leading-snug mb-1 truncate pr-2">
                        {item.name}
                      </h3>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.size && item.size !== 'One Size' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-sans text-ivory/60 bg-white/8 border border-white/10 rounded-full px-2.5 py-0.5">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                            Size {item.size}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[10px] font-sans text-ivory/60 bg-white/8 border border-white/10 rounded-full px-2.5 py-0.5">
                          Qty × {item.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Price row */}
                    <div className="flex items-end justify-between mt-4 pt-3 border-t border-white/10">
                      <div>
                        <p className="text-[9px] font-sans uppercase tracking-widest text-ivory/40 mb-0.5">Item Total</p>
                        <p className="font-serif text-xl text-gold font-semibold">
                          PKR {(item.price * item.quantity).toLocaleString()}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-[10px] font-sans text-ivory/40 mt-0.5">
                            PKR {item.price.toLocaleString()} each
                          </p>
                        )}
                      </div>

                      {/* Thank You stamp */}
                      <div className="flex flex-col items-center gap-0.5 opacity-70">
                        <div className="w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A44C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                        </div>
                        <p className="text-[8px] font-sans text-gold/70 uppercase tracking-widest">Thank You</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order total card */}
        <div className="order-item-card rounded-2xl border border-gold/20 bg-white/5 backdrop-blur-md px-6 py-5 mb-10">
          <div className="flex items-center justify-between text-xs font-sans text-ivory/50 mb-2">
            <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} item{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''})</span>
            <span>PKR {(total - shipping).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-sans text-ivory/50 mb-3 pb-3 border-b border-white/10">
            <span>Shipping</span>
            <span>{shipping === 0 ? <span className="text-green-400 font-semibold">Free</span> : `PKR ${shipping}`}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-serif text-ivory text-lg">Grand Total</span>
            <span className="font-serif text-gold text-2xl font-semibold">PKR {total.toLocaleString()}</span>
          </div>
        </div>

        {/* Progress tracker */}
        <div className="order-item-card flex items-center justify-center gap-0 mb-10">
          {['Confirmed', 'Processing', 'Shipped', 'Delivered'].map((s, i, arr) => (
            <div key={s} className="flex items-center">
              <div className={`flex flex-col items-center gap-1.5 ${i === 0 ? 'text-gold' : 'text-ivory/30'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs ${
                  i === 0 ? 'bg-gold border-gold text-charcoal font-bold' : 'border-white/15 text-ivory/30'
                }`}>
                  {i === 0 ? '✓' : i + 1}
                </div>
                <span className="text-[9px] font-sans uppercase tracking-wider hidden sm:block">{s}</span>
              </div>
              {i < arr.length - 1 && (
                <div className={`h-px w-10 sm:w-16 mx-1 mb-4 ${i === 0 ? 'bg-gold/40' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="order-item-card flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => navigate('account')}
            className="px-6 py-3 border border-gold/50 text-gold font-sans font-semibold text-sm rounded-xl hover:bg-gold hover:text-charcoal transition-all duration-200"
          >
            Track Order
          </button>
          <button
            onClick={() => navigate('shop')}
            className="px-6 py-3 bg-gold text-charcoal font-sans font-semibold text-sm rounded-xl hover:bg-[#b8922e] transition-colors shadow-lg shadow-gold/20"
          >
            Continue Shopping ✦
          </button>
        </div>

        <p className="order-item-card text-center mt-8 text-xs font-sans text-ivory/30 leading-relaxed">
          A confirmation SMS has been sent to your phone. Questions? Contact us on WhatsApp at +92 300 1234567.
        </p>
      </div>
    </main>
  );
}
