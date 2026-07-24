import { useState, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';

type Step = 'shipping' | 'payment' | 'review';

const paymentMethods = [
  { id: 'cod',       label: 'Cash on Delivery', description: 'Pay when your order arrives',        icon: '💵' },
  { id: 'jazzcash',  label: 'JazzCash',          description: 'Pay via JazzCash mobile wallet',     icon: '📱' },
  { id: 'easypaisa', label: 'EasyPaisa',          description: 'Pay via EasyPaisa mobile wallet',   icon: '📲' },
  { id: 'bank',      label: 'Bank Transfer',      description: 'Direct transfer to our bank account', icon: '🏦' },
  { id: 'card',      label: 'Debit / Credit Card', description: 'Visa, Mastercard, UnionPay',       icon: '💳' },
];

const walletDetails: Record<string, { name: string; number: string; accountTitle: string }> = {
  jazzcash: {
    name: 'JazzCash',
    number: '0300-1234567',
    accountTitle: 'Genzo Silver',
  },
  easypaisa: {
    name: 'EasyPaisa',
    number: '0311-9876543',
    accountTitle: 'Genzo Silver Store',
  },
  bank: {
    name: 'HBL Bank Transfer',
    number: 'PK86HABB0000123456789012',
    accountTitle: 'Genzo Silver Pvt Ltd',
  },
};

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="ml-2 text-[10px] font-sans font-bold px-2 py-0.5 rounded bg-gold/20 text-gold hover:bg-gold/40 transition-colors"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart, setLastOrder, addPlacedOrder } = useCart();
  const { user, isGuest } = useAuth();
  const { navigate } = useNav();

  const [step, setStep] = useState<Step>('shipping');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const proofRef = useRef<HTMLInputElement>(null);

  /* Card fields */
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvc: '',
  });

  const [form, setForm] = useState(() => {
    const nameParts = user?.name ? user.name.split(' ') : ['', ''];
    return {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      notes: '',
    };
  });

  const shipping = cartTotal >= 5000 ? 0 : 250;
  const total = cartTotal + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const formatCardNumber = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const [placingOrder, setPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    if (!user?.token || placingOrder) return;

    const orderNumber = `GZ-${Math.floor(100000 + Math.random() * 900000)}`;
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    
    const newOrder = {
      orderNumber,
      date: today,
      status: 'processing' as const,
      items: cartItems,
      total,
      shipping,
      paymentMethod,
    };

    setPlacingOrder(true);
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          orderNumber,
          shippingInfo: form,
          paymentMethod,
          items: cartItems,
          subtotal: cartTotal,
          shippingFee: shipping,
          total,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not save the order.');

      setLastOrder(newOrder);
      addPlacedOrder(newOrder);
      clearCart();
      navigate('success');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not save the order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const steps: { id: Step; label: string }[] = [
    { id: 'shipping', label: 'Shipping' },
    { id: 'payment',  label: 'Payment'  },
    { id: 'review',   label: 'Review'   },
  ];
  const stepIndex = steps.findIndex(s => s.id === step);

  const needsProof = paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa' || paymentMethod === 'bank';
  const isCard     = paymentMethod === 'card';

  return (
    <main className="bg-ivory min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-serif text-4xl text-charcoal mb-8">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center mb-10">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center gap-2 ${i <= stepIndex ? 'text-gold' : 'text-text-muted'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-sans font-bold border-2 transition-colors ${
                  i < stepIndex  ? 'bg-gold border-gold text-white' :
                  i === stepIndex ? 'border-gold text-gold' :
                  'border-warm-border text-text-muted'
                }`}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span className="text-sm font-sans font-medium hidden sm:block">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px w-8 sm:w-16 mx-2 transition-colors ${i < stepIndex ? 'bg-gold' : 'bg-warm-border'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">

            {/* ── SHIPPING STEP ── */}
            {step === 'shipping' && (
              <div className="bg-white rounded-xl border border-warm-border p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-serif text-xl text-charcoal">Shipping Information</h2>
                  {isGuest && (
                    <span className="text-xs font-sans font-semibold bg-gold/15 text-gold-dark px-3 py-1 rounded-full border border-gold/30">
                      👤 Ordering as {user?.userId ?? 'Guest'}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: 'firstName', label: 'First Name',     type: 'text',  placeholder: 'Ayesha'        },
                    { name: 'lastName',  label: 'Last Name',      type: 'text',  placeholder: 'Khan'          },
                    { name: 'email',     label: 'Email Address',  type: 'email', placeholder: 'ayesha@email.com' },
                    { name: 'phone',     label: 'Phone Number',   type: 'tel',   placeholder: '0300 1234567'  },
                  ].map(field => (
                    <div key={field.name}>
                      <label className="block text-xs font-sans font-medium text-text-muted mb-1.5 uppercase tracking-wide">{field.label}</label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={form[field.name as keyof typeof form]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 border border-warm-border rounded-lg text-sm font-sans bg-ivory text-text-base focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  ))}

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-sans font-medium text-text-muted mb-1.5 uppercase tracking-wide">Street Address</label>
                    <input
                      type="text" name="address" value={form.address} onChange={handleChange}
                      placeholder="House 5, Block A, DHA Phase 5"
                      className="w-full px-4 py-2.5 border border-warm-border rounded-lg text-sm font-sans bg-ivory focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>

                  {[
                    { name: 'city', label: 'City', placeholder: 'Lahore' },
                    { name: 'postalCode', label: 'Postal Code', placeholder: '54000' },
                  ].map(field => (
                    <div key={field.name}>
                      <label className="block text-xs font-sans font-medium text-text-muted mb-1.5 uppercase tracking-wide">{field.label}</label>
                      <input
                        type="text" name={field.name} value={form[field.name as keyof typeof form]}
                        onChange={handleChange} placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 border border-warm-border rounded-lg text-sm font-sans bg-ivory focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs font-sans font-medium text-text-muted mb-1.5 uppercase tracking-wide">Province</label>
                    <select name="province" value={form.province} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-warm-border rounded-lg text-sm font-sans bg-ivory focus:outline-none focus:border-gold transition-colors">
                      <option value="">Select province</option>
                      <option>Punjab</option>
                      <option>Sindh</option>
                      <option>KPK</option>
                      <option>Balochistan</option>
                      <option>Islamabad</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-sans font-medium text-text-muted mb-1.5 uppercase tracking-wide">Order Notes (optional)</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                      placeholder="Special instructions or gift message..."
                      className="w-full px-4 py-2.5 border border-warm-border rounded-lg text-sm font-sans bg-ivory resize-none focus:outline-none focus:border-gold transition-colors" />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button onClick={() => setStep('payment')}
                    className="px-8 py-3 bg-gold text-charcoal font-sans font-semibold text-sm rounded-lg hover:bg-gold-dark transition-colors">
                    Continue to Payment →
                  </button>
                </div>
              </div>
            )}

            {/* ── PAYMENT STEP ── */}
            {step === 'payment' && (
              <div className="bg-white rounded-xl border border-warm-border p-6 space-y-6">
                <h2 className="font-serif text-xl text-charcoal">Payment Method</h2>

                {/* Method selector */}
                <div className="space-y-3">
                  {paymentMethods.map(method => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === method.id ? 'border-gold bg-gold/5' : 'border-warm-border hover:border-gold/50'
                      }`}
                    >
                      <input type="radio" name="payment" value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={e => { setPaymentMethod(e.target.value); setProofFile(null); }}
                        className="accent-gold" />
                      <span className="text-xl">{method.icon}</span>
                      <div>
                        <p className="font-sans font-medium text-sm text-charcoal">{method.label}</p>
                        <p className="font-sans text-xs text-text-muted">{method.description}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* ── WALLET / BANK DETAILS PANEL ── */}
                {needsProof && walletDetails[paymentMethod] && (
                  <div className="rounded-2xl border border-gold/30 overflow-hidden">
                    {/* Dark header */}
                    <div className="bg-charcoal px-5 py-4">
                      <p className="text-[10px] tracking-[0.3em] uppercase font-sans text-gold/80 font-semibold mb-0.5">Send Payment To</p>
                      <h3 className="font-serif text-base text-ivory">{walletDetails[paymentMethod].name} Account Details</h3>
                    </div>

                    {/* Details */}
                    <div className="bg-[#FDFBF7] px-5 py-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-sans text-text-muted mb-0.5">Account Title</p>
                          <p className="font-sans font-semibold text-sm text-charcoal">{walletDetails[paymentMethod].accountTitle}</p>
                        </div>
                        <CopyBtn text={walletDetails[paymentMethod].accountTitle} />
                      </div>
                      <div className="h-px bg-warm-border" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-sans text-text-muted mb-0.5">
                            {paymentMethod === 'bank' ? 'IBAN / Account No.' : 'Mobile Number'}
                          </p>
                          <p className="font-mono font-bold text-charcoal tracking-widest text-sm">{walletDetails[paymentMethod].number}</p>
                        </div>
                        <CopyBtn text={walletDetails[paymentMethod].number} />
                      </div>
                      <div className="h-px bg-warm-border" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-sans text-text-muted mb-0.5">Amount to Send</p>
                          <p className="font-sans font-bold text-gold text-base">PKR {total.toLocaleString()}</p>
                        </div>
                        <CopyBtn text={String(total)} />
                      </div>
                    </div>

                    {/* Proof Upload */}
                    <div className="bg-white border-t border-warm-border px-5 py-5">
                      <p className="text-xs font-sans font-semibold text-charcoal mb-1">Upload Payment Screenshot / Proof</p>
                      <p className="text-[11px] font-sans text-text-muted mb-3">After sending the payment, upload a screenshot as proof to confirm your order.</p>

                      <input
                        ref={proofRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => setProofFile(e.target.files?.[0] ?? null)}
                      />

                      {proofFile ? (
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-gold/40 bg-gold/5">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-warm-border shrink-0">
                            <img
                              src={URL.createObjectURL(proofFile)}
                              alt="proof"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-sans font-semibold text-charcoal truncate">{proofFile.name}</p>
                            <p className="text-[10px] font-sans text-text-muted">{(proofFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <button
                            onClick={() => { setProofFile(null); if (proofRef.current) proofRef.current.value = ''; }}
                            className="text-text-muted hover:text-red-500 transition-colors text-lg leading-none"
                          >✕</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => proofRef.current?.click()}
                          className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gold/30 hover:border-gold/60 rounded-xl py-6 transition-colors bg-gold/3 hover:bg-gold/5"
                        >
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A44C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                          <p className="text-xs font-sans font-semibold text-gold">Click to Upload Screenshot</p>
                          <p className="text-[10px] font-sans text-text-muted">PNG, JPG, JPEG supported</p>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ── CARD DETAILS PANEL ── */}
                {isCard && (
                  <div className="rounded-2xl border border-gold/30 overflow-hidden">
                    <div className="bg-charcoal px-5 py-4">
                      <p className="text-[10px] tracking-[0.3em] uppercase font-sans text-gold/80 font-semibold mb-0.5">Secure Payment</p>
                      <h3 className="font-serif text-base text-ivory">Enter Card Details</h3>
                    </div>

                    {/* Visual card preview */}
                    <div className="bg-gradient-to-br from-charcoal to-[#2d2412] px-5 py-5 flex justify-center">
                      <div className="w-full max-w-xs rounded-2xl bg-gradient-to-br from-[#C9A44C] via-[#b8922e] to-[#8a6a1f] p-5 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-8">
                            <span className="font-serif text-white/90 text-sm font-semibold tracking-wider">GENZO</span>
                            <svg width="40" height="28" viewBox="0 0 40 28" fill="none"><rect width="40" height="28" rx="4" fill="white" fillOpacity=".15"/><circle cx="15" cy="14" r="8" fill="white" fillOpacity=".5"/><circle cx="25" cy="14" r="8" fill="white" fillOpacity=".3"/></svg>
                          </div>
                          <p className="font-mono text-white text-lg tracking-widest mb-4">
                            {cardForm.cardNumber || '•••• •••• •••• ••••'}
                          </p>
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-white/60 text-[9px] uppercase tracking-widest mb-0.5">Card Holder</p>
                              <p className="text-white text-xs font-semibold uppercase tracking-wide">{cardForm.cardHolder || 'YOUR NAME'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white/60 text-[9px] uppercase tracking-widest mb-0.5">Expires</p>
                              <p className="text-white text-xs font-semibold">{cardForm.expiry || 'MM/YY'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card inputs */}
                    <div className="bg-[#FDFBF7] px-5 py-5 space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-sans text-text-muted mb-1.5">Card Number</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={19}
                          placeholder="1234 5678 9012 3456"
                          value={cardForm.cardNumber}
                          onChange={e => setCardForm(f => ({ ...f, cardNumber: formatCardNumber(e.target.value) }))}
                          className="w-full px-4 py-2.5 border border-warm-border rounded-lg text-sm font-mono bg-ivory focus:outline-none focus:border-gold transition-colors tracking-widest"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-sans text-text-muted mb-1.5">Card Holder Name</label>
                        <input
                          type="text"
                          placeholder="Ayesha Khan"
                          value={cardForm.cardHolder}
                          onChange={e => setCardForm(f => ({ ...f, cardHolder: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-warm-border rounded-lg text-sm font-sans bg-ivory focus:outline-none focus:border-gold transition-colors uppercase"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-sans text-text-muted mb-1.5">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardForm.expiry}
                            onChange={e => setCardForm(f => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                            className="w-full px-4 py-2.5 border border-warm-border rounded-lg text-sm font-mono bg-ivory focus:outline-none focus:border-gold transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-sans text-text-muted mb-1.5">CVC / CVV</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="•••"
                            maxLength={4}
                            value={cardForm.cvc}
                            onChange={e => setCardForm(f => ({ ...f, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                            className="w-full px-4 py-2.5 border border-warm-border rounded-lg text-sm font-mono bg-ivory focus:outline-none focus:border-gold transition-colors"
                          />
                        </div>
                      </div>
                      <p className="flex items-center gap-1.5 text-[10px] font-sans text-text-muted">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9A44C" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        Your card details are encrypted and secure.
                      </p>
                    </div>
                  </div>
                )}

                {/* COD info */}
                {paymentMethod === 'cod' && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-gold/8 border border-gold/20">
                    <span className="text-gold text-lg mt-0.5">💵</span>
                    <div>
                      <p className="font-sans text-sm font-semibold text-charcoal mb-1">Cash on Delivery</p>
                      <p className="font-sans text-xs text-text-muted leading-relaxed">
                        Pay <span className="font-bold text-charcoal">PKR {total.toLocaleString()}</span> in cash when your order arrives at your doorstep. No advance payment required.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <button onClick={() => setStep('shipping')} className="text-sm font-sans text-text-muted hover:text-charcoal">← Back</button>
                  <button onClick={() => setStep('review')}
                    className="px-8 py-3 bg-gold text-charcoal font-sans font-semibold text-sm rounded-lg hover:bg-gold-dark transition-colors">
                    Review Order →
                  </button>
                </div>
              </div>
            )}

            {/* ── REVIEW STEP ── */}
            {step === 'review' && (
              <div className="bg-white rounded-xl border border-warm-border p-6">
                <h2 className="font-serif text-xl text-charcoal mb-6">Review Your Order</h2>

                <div className="mb-5 p-4 bg-beige rounded-lg">
                  <p className="text-xs font-sans tracking-widest text-text-muted uppercase mb-2">Shipping to</p>
                  <p className="font-sans text-sm text-charcoal font-medium">{form.firstName} {form.lastName}</p>
                  <p className="font-sans text-sm text-text-muted">{form.address}</p>
                  <p className="font-sans text-sm text-text-muted">{form.city}, {form.province} {form.postalCode}</p>
                  <p className="font-sans text-sm text-text-muted">{form.phone}</p>
                </div>

                <div className="mb-5 p-4 bg-beige rounded-lg flex items-center gap-3">
                  <span className="text-xl">{paymentMethods.find(m => m.id === paymentMethod)?.icon}</span>
                  <div>
                    <p className="text-xs font-sans tracking-widest text-text-muted uppercase mb-0.5">Payment</p>
                    <p className="font-sans text-sm text-charcoal font-medium">{paymentMethods.find(m => m.id === paymentMethod)?.label}</p>
                  </div>
                  {proofFile && (
                    <div className="ml-auto flex items-center gap-2 text-xs font-sans text-green-600 font-semibold">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                      Proof Uploaded
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {cartItems.map(item => (
                    <div key={item.cartId} className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg bg-beige shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-sans text-charcoal font-medium">{item.name}</p>
                        {item.size !== 'One Size' && <p className="text-xs font-sans text-text-muted">Size {item.size}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-sans text-charcoal font-semibold">PKR {(item.price * item.quantity).toLocaleString()}</p>
                        <p className="text-xs text-text-muted font-sans">×{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-between">
                  <button onClick={() => setStep('payment')} className="text-sm font-sans text-text-muted hover:text-charcoal">← Back</button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                    className="px-8 py-3.5 bg-gold text-charcoal font-sans font-bold text-sm rounded-lg hover:bg-gold-dark transition-colors"
                  >
                    {placingOrder ? 'Saving Order…' : `Place Order — PKR ${total.toLocaleString()}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Order Summary */}
          <div className="h-fit lg:sticky lg:top-24">
            <div className="bg-white rounded-xl border border-warm-border p-5">
              <h3 className="font-serif text-lg text-charcoal mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {cartItems.map(item => (
                  <div key={item.cartId} className="flex items-center gap-2.5">
                    <div className="relative">
                      <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded bg-beige shrink-0" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-charcoal text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <p className="flex-1 text-xs font-sans text-charcoal leading-tight">{item.name}</p>
                    <p className="text-xs font-sans font-semibold text-charcoal shrink-0">PKR {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-warm-border pt-3 space-y-2 text-xs font-sans">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span>PKR {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600 font-semibold">Free</span> : `PKR ${shipping}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-charcoal text-sm pt-1 border-t border-warm-border mt-1">
                  <span>Total</span>
                  <span>PKR {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
