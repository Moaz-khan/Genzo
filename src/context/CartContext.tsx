import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CartItem } from '../types';
import { useAuth } from './AuthContext';
import { products } from '../data/products';

export interface OrderSnapshot {
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: CartItem[];
  total: number;
  shipping: number;
  paymentMethod: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'cartId' | 'quantity'>) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  wishlistIds: number[];
  toggleWishlist: (id: number) => void;
  lastOrder: OrderSnapshot | null;
  setLastOrder: (order: OrderSnapshot) => void;
  placedOrders: OrderSnapshot[];
  addPlacedOrder: (order: OrderSnapshot) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, ensureGuest } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [lastOrder, setLastOrderState] = useState<OrderSnapshot | null>(null);
  const [placedOrders, setPlacedOrders] = useState<OrderSnapshot[]>(() => {
    return [];
  });

  useEffect(() => {
    try {
      if (user?.userId) localStorage.setItem(`genzo_placed_orders_${user.userId}`, JSON.stringify(placedOrders));
    } catch {
      // ignore
    }
  }, [placedOrders]);

  useEffect(() => {
    setCartItems([]);
    setWishlistIds([]);
    setPlacedOrders(() => {
      try {
        const saved = user?.userId ? localStorage.getItem(`genzo_placed_orders_${user.userId}`) : null;
        return saved ? JSON.parse(saved) : [];
      } catch { return []; }
    });
    if (!user?.userId || !user.token) return;
    fetch('/api/account/cart', { headers: { Authorization: `Bearer ${user.token}` } })
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (data?.items) setCartItems(data.items); })
      .catch(() => undefined);
    fetch(`/api/users/${encodeURIComponent(user.userId)}/orders`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(async response => {
        if (!response.ok) return null;
        const data = await response.json();
        return Array.isArray(data.orders) ? data.orders as OrderSnapshot[] : null;
      })
      .then(orders => { if (orders) setPlacedOrders(orders); })
      .catch(() => {
        // Keep cached orders visible when the API is temporarily unavailable.
      });
  }, [user?.token, user?.userId]);

  useEffect(() => {
    if (!user?.token) return;
    fetch('/api/account/wishlist', { headers: { Authorization: `Bearer ${user.token}` } })
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (data?.productIds) setWishlistIds(data.productIds); })
      .catch(() => undefined);
  }, [user?.token]);

  const addToCart = (item: Omit<CartItem, 'cartId' | 'quantity'>) => {
    const cartId = `${item.productId}_${item.size}`;
    const nextItem = { ...item, cartId, quantity: 1 };
    setCartItems(prev => {
      const existing = prev.find(i => i.cartId === cartId);
      if (existing) {
        return prev.map(i => i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, nextItem];
    });
    void ensureGuest().then(session => fetch('/api/account/cart', {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
      body: JSON.stringify({ ...nextItem, quantity: (cartItems.find(i => i.cartId === cartId)?.quantity || 0) + 1 }),
    })).catch(() => undefined);
  };

  const removeFromCart = (cartId: string) => {
    setCartItems(prev => prev.filter(i => i.cartId !== cartId));
    if (user?.token) void fetch('/api/account/cart', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` }, body: JSON.stringify({ cartId }) });
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCartItems(prev => prev.map(i => i.cartId === cartId ? { ...i, quantity } : i));
    const item = cartItems.find(i => i.cartId === cartId);
    if (user?.token && item) void fetch('/api/account/cart', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` }, body: JSON.stringify({ ...item, quantity }) });
  };

  const clearCart = () => {
    setCartItems([]);
    if (user?.token) void fetch('/api/account/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      body: JSON.stringify({}),
    });
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const toggleWishlist = (id: number) => {
    const removing = wishlistIds.includes(id);
    setWishlistIds(prev => removing ? prev.filter(i => i !== id) : [...prev, id]);
    void ensureGuest().then(session => {
      const product = products.find(item => item.id === id);
      fetch('/api/account/wishlist', {
        method: removing ? 'DELETE' : 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ productId: id, productName: product?.name, image: product?.image }),
      }).then(async response => {
        if (!response.ok) throw new Error('Wishlist request failed');
        return response.json();
      }).then(data => { if (data.productIds) setWishlistIds(data.productIds); })
        .catch(() => setWishlistIds(prev => removing ? [...prev, id] : prev.filter(i => i !== id)));
      }).catch(() => setWishlistIds(prev => removing ? [...prev, id] : prev.filter(i => i !== id)));
  };

  const setLastOrder = (order: OrderSnapshot) => setLastOrderState(order);

  const addPlacedOrder = (order: OrderSnapshot) => {
    setPlacedOrders(prev => [order, ...prev]);
  };

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount, cartTotal, wishlistIds, toggleWishlist,
      lastOrder, setLastOrder, placedOrders, addPlacedOrder,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
