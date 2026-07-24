import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNav } from '../context/NavContext';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
  processing: 'bg-blue-50 text-blue-600 border border-blue-200',
  shipped: 'bg-purple-50 text-purple-600 border border-purple-200',
  delivered: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-600 border border-red-200',
};

const paymentLabelMap: Record<string, string> = {
  cod: 'Cash on Delivery',
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
  bank: 'Bank Transfer',
  card: 'Debit / Credit Card',
};

type Section = 'orders' | 'wishlist' | 'addresses' | 'profile' | 'password';

export default function AccountPage() {
  const { wishlistIds, placedOrders } = useCart();
  const { navigate } = useNav();
  const [section, setSection] = useState<Section>('orders');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));

  const sidebarLinks: { id: Section; label: string }[] = [
    { id: 'orders', label: `My Orders ${placedOrders.length > 0 ? `(${placedOrders.length})` : ''}` },
    { id: 'wishlist', label: 'Wishlist' },
    { id: 'addresses', label: 'Saved Addresses' },
    { id: 'profile', label: 'My Profile' },
    { id: 'password', label: 'Change Password' },
  ];

  const toggleExpandOrder = (orderNum: string) => {
    setExpandedOrderId(prev => prev === orderNum ? null : orderNum);
  };

  return (
    <main className="bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-serif text-4xl text-charcoal mb-8">My Account</h1>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-52 shrink-0 hidden md:block">
            <div className="bg-white rounded-xl border border-warm-border overflow-hidden">
              {/* User avatar */}
              <div className="p-5 border-b border-warm-border">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-2">
                  <span className="font-serif text-gold text-lg font-bold">A</span>
                </div>
                <p className="font-sans font-semibold text-sm text-charcoal">Ayesha Khan</p>
                <p className="font-sans text-xs text-text-muted">ayesha@email.com</p>
              </div>
              <nav className="py-2">
                {sidebarLinks.map(link => (
                  <button
                    key={link.id}
                    onClick={() => setSection(link.id)}
                    className={`w-full text-left px-5 py-2.5 text-sm font-sans transition-colors ${
                      section === link.id
                        ? 'text-gold bg-gold/5 font-medium border-l-2 border-gold'
                        : 'text-text-base hover:text-gold hover:bg-beige'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
                <div className="border-t border-warm-border mt-2 pt-2">
                  <button
                    onClick={() => navigate('home')}
                    className="w-full text-left px-5 py-2.5 text-sm font-sans text-danger hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Mobile tabs */}
          <div className="flex md:hidden gap-2 overflow-x-auto pb-1 mb-4 -mt-2 w-full">
            {sidebarLinks.map(link => (
              <button
                key={link.id}
                onClick={() => setSection(link.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-sans border transition-colors ${
                  section === link.id
                    ? 'bg-gold text-charcoal border-gold font-medium'
                    : 'border-warm-border text-text-base'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Orders Section */}
            {section === 'orders' && (
              <div>
                <h2 className="font-serif text-2xl text-charcoal mb-5">
                  My Orders
                  {placedOrders.length > 0 && (
                    <span className="text-text-muted text-sm font-sans font-normal ml-2">
                      ({placedOrders.length} placed order{placedOrders.length !== 1 ? 's' : ''})
                    </span>
                  )}
                </h2>

                {placedOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-warm-border p-12 text-center shadow-xs">
                    <div className="w-16 h-16 rounded-full bg-gold/10 text-gold flex items-center justify-center mx-auto mb-4">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 0 1-8 0"/>
                      </svg>
                    </div>
                    <h3 className="font-serif text-xl text-charcoal mb-2">No orders placed yet</h3>
                    <p className="text-text-muted font-sans text-xs sm:text-sm mb-6 max-w-sm mx-auto">
                      When you place orders from the shop, your order details and delivery status will show up right here.
                    </p>
                    <button
                      onClick={() => navigate('shop')}
                      className="px-6 py-2.5 bg-gold text-charcoal font-sans font-semibold text-xs rounded-lg hover:bg-gold-dark transition-colors shadow-xs"
                    >
                      Explore Collection →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {placedOrders.map(order => {
                      const isExpanded = expandedOrderId === order.orderNumber;
                      const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

                      return (
                        <div
                          key={order.orderNumber}
                          className="bg-white rounded-2xl border border-warm-border shadow-xs overflow-hidden transition-all"
                        >
                          {/* Order Summary Row */}
                          <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center shrink-0 text-gold font-bold">
                                🛍️
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-sans font-bold text-sm text-charcoal">{order.orderNumber}</span>
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold capitalize ${statusStyles[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                                    {order.status}
                                  </span>
                                </div>
                                <p className="font-sans text-xs text-text-muted mt-0.5">
                                  {order.date} • {itemCount} item{itemCount !== 1 ? 's' : ''} • {paymentLabelMap[order.paymentMethod] ?? order.paymentMethod}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="font-sans font-bold text-charcoal text-base">
                                PKR {order.total.toLocaleString()}
                              </span>
                              <button
                                onClick={() => toggleExpandOrder(order.orderNumber)}
                                className="px-3.5 py-1.5 text-xs font-sans font-semibold text-gold hover:bg-gold/10 border border-gold/40 rounded-lg transition-colors flex items-center gap-1.5"
                              >
                                <span>{isExpanded ? 'Hide Details' : 'View Items'}</span>
                                <svg
                                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                  fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                                >
                                  <path d="M19 9l-7 7-7-7"/>
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Expanded Items Drawer */}
                          {isExpanded && (
                            <div className="border-t border-warm-border bg-beige/40 p-5 space-y-3">
                              <p className="text-[11px] font-sans font-bold tracking-widest text-text-muted uppercase mb-3">
                                Items in Order ({order.items.length} product{order.items.length !== 1 ? 's' : ''})
                              </p>
                              <div className="divide-y divide-warm-border">
                                {order.items.map(item => (
                                  <div key={item.cartId} className="py-3 flex items-center gap-3">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-12 h-12 object-cover rounded-lg bg-white border border-warm-border shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-sans font-semibold text-charcoal truncate">{item.name}</p>
                                      <div className="flex items-center gap-2 text-[11px] font-sans text-text-muted mt-0.5">
                                        {item.size && item.size !== 'One Size' && (
                                          <span>Size: <strong className="text-charcoal">{item.size}</strong></span>
                                        )}
                                        <span>Qty: <strong className="text-charcoal">{item.quantity}</strong></span>
                                      </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="text-xs font-sans font-bold text-charcoal">
                                        PKR {(item.price * item.quantity).toLocaleString()}
                                      </p>
                                      {item.quantity > 1 && (
                                        <p className="text-[10px] font-sans text-text-muted">
                                          (PKR {item.price.toLocaleString()} each)
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="pt-3 border-t border-warm-border flex justify-between items-center text-xs font-sans text-text-muted">
                                <span>Shipping: {order.shipping === 0 ? <strong className="text-green-600">FREE</strong> : `PKR ${order.shipping}`}</span>
                                <span>Total Paid: <strong className="text-gold text-sm font-bold">PKR {order.total.toLocaleString()}</strong></span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist */}
            {section === 'wishlist' && (
              <div>
                <h2 className="font-serif text-2xl text-charcoal mb-5">
                  Wishlist
                  {wishlistProducts.length > 0 && (
                    <span className="text-text-muted text-base font-sans font-normal ml-2">
                      ({wishlistProducts.length} items)
                    </span>
                  )}
                </h2>
                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-warm-border">
                    <p className="font-serif text-2xl text-charcoal mb-2">Your wishlist is empty</p>
                    <p className="text-text-muted font-sans text-sm mb-6">
                      Heart the pieces you love while browsing the shop.
                    </p>
                    <button
                      onClick={() => navigate('shop')}
                      className="px-6 py-3 bg-gold text-charcoal font-sans font-semibold text-sm rounded-lg hover:bg-gold-dark transition-colors"
                    >
                      Browse Shop
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                    {wishlistProducts.map(p => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses */}
            {section === 'addresses' && (
              <div>
                <h2 className="font-serif text-2xl text-charcoal mb-5">Saved Addresses</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border-2 border-gold p-5 relative">
                    <span className="absolute top-3 right-3 text-[10px] font-sans font-bold text-gold tracking-widest">DEFAULT</span>
                    <p className="font-sans font-semibold text-sm text-charcoal mb-1">Ayesha Khan</p>
                    <p className="font-sans text-xs text-text-muted leading-relaxed">
                      House 5, Block A, DHA Phase 5<br />
                      Pakistan, Punjab 54000<br />
                      +92 300 1234567
                    </p>
                    <div className="flex gap-3 mt-4">
                      <button className="text-xs font-sans text-gold border-b border-gold pb-0.5">Edit</button>
                      <button className="text-xs font-sans text-text-muted border-b border-text-muted pb-0.5">Delete</button>
                    </div>
                  </div>
                  <button className="h-36 rounded-xl border-2 border-dashed border-warm-border text-text-muted hover:border-gold hover:text-gold transition-colors flex flex-col items-center justify-center gap-2 text-sm font-sans">
                    <span className="text-2xl">+</span>
                    Add New Address
                  </button>
                </div>
              </div>
            )}

            {/* Profile */}
            {section === 'profile' && (
              <div>
                <h2 className="font-serif text-2xl text-charcoal mb-5">My Profile</h2>
                <div className="bg-white rounded-xl border border-warm-border p-6 max-w-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'First Name', value: 'Ayesha' },
                      { label: 'Last Name', value: 'Khan' },
                      { label: 'Email', value: 'ayesha@email.com' },
                      { label: 'Phone', value: '0300 1234567' },
                    ].map(field => (
                      <div key={field.label}>
                        <label className="block text-xs font-sans font-medium text-text-muted mb-1.5 uppercase tracking-wide">
                          {field.label}
                        </label>
                        <input
                          type="text"
                          defaultValue={field.value}
                          className="w-full px-4 py-2.5 border border-warm-border rounded-lg text-sm font-sans bg-ivory text-text-base"
                        />
                      </div>
                    ))}
                  </div>
                  <button className="mt-5 px-6 py-2.5 bg-gold text-charcoal font-sans font-semibold text-sm rounded-lg hover:bg-gold-dark transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Password */}
            {section === 'password' && (
              <div>
                <h2 className="font-serif text-2xl text-charcoal mb-5">Change Password</h2>
                <div className="bg-white rounded-xl border border-warm-border p-6 max-w-md">
                  <div className="space-y-4">
                    {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
                      <div key={label}>
                        <label className="block text-xs font-sans font-medium text-text-muted mb-1.5 uppercase tracking-wide">
                          {label}
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2.5 border border-warm-border rounded-lg text-sm font-sans bg-ivory text-text-base"
                        />
                      </div>
                    ))}
                    <button className="w-full py-2.5 bg-gold text-charcoal font-sans font-semibold text-sm rounded-lg hover:bg-gold-dark transition-colors mt-2">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
