import { useState } from 'react';
import { useNav } from '../context/NavContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

import { navLinks } from '../data/categories';

export default function Navbar() {
  const { page, navigate, setShopFilter } = useNav();
  const { cartCount, wishlistIds } = useCart();
  const { user, isGuest, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-ivory border-b border-warm-border">
      {/* Announcement bar */}
      <div className="bg-charcoal text-ivory text-center py-2 text-xs tracking-widest font-sans flex items-center justify-between px-4 sm:px-8">
        <span className="hidden md:inline text-[10px] text-gold font-medium">✨ AUTHENTIC 92.5 STERLING SILVER</span>
        <span className="mx-auto md:mx-0">FREE DELIVERY ACROSS PAKISTAN ON ORDERS ABOVE PKR 5,000 &nbsp;|&nbsp; COD AVAILABLE</span>
        
        {/* User bar badge */}
        {user && (
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-sans">
            {isGuest ? (
              <span className="bg-gold/20 text-gold px-2 py-0.5 rounded font-mono font-bold">
                👤 {user.userId} (Guest)
              </span>
            ) : (
              <span className="text-gold font-semibold flex items-center gap-1">
                ✦ Hi, {user.name.split(' ')[0]}
              </span>
            )}
            <button
              onClick={logout}
              className="text-ivory/60 hover:text-red-400 ml-1 underline text-[10px]"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      <nav className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => navigate('home')}
          className="shrink-0 flex flex-col items-center leading-none"
        >
          <span className="font-serif text-xl font-bold text-charcoal tracking-widest">GENZO</span>
          <span className="text-[9px] tracking-[0.4em] text-gold font-sans font-medium">SILVER</span>
        </button>

        {/* Desktop Nav Links */}
        <ul className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link, i) => (
            <li key={i} className="relative group py-5">
              <button
                onClick={() => {
                  if (link.page) {
                    if (link.page === 'shop') setShopFilter(link.label, null);
                    navigate(link.page);
                  } else if (link.items) {
                    setShopFilter(link.label, null);
                    navigate('shop');
                  }
                }}
                className={`text-sm font-sans tracking-wide transition-colors hover:text-gold flex items-center gap-1 ${page === link.page || (page === 'shop' && !link.page) ? 'text-gold font-medium' : 'text-text-base'}`}
              >
                {link.label}
                {link.items && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:rotate-180 transition-transform">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                )}
              </button>

              {/* Dropdown */}
              {link.items && (
                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white border border-warm-border rounded-lg shadow-lg py-2 min-w-[220px] flex flex-col max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5">
                    {link.items.map((subItem, j) => (
                      <button
                        key={j}
                        onClick={() => {
                          setShopFilter(link.label, subItem);
                          navigate('shop');
                        }}
                        className="text-left px-4 py-2 text-sm font-sans text-text-base hover:bg-beige hover:text-gold transition-colors whitespace-nowrap"
                      >
                        {subItem}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Icon group */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-text-base hover:text-gold transition-colors"
            aria-label="Search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* Wishlist */}
          <button
            onClick={() => navigate('account')}
            className="relative p-2 text-text-base hover:text-gold transition-colors"
            aria-label="Wishlist"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {wishlistIds.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-gold text-charcoal text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm leading-none border border-ivory">
                {wishlistIds.length}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={() => navigate('cart')}
            className="relative p-2 text-text-base hover:text-gold transition-colors"
            aria-label="Cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-gold text-charcoal text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm leading-none border border-ivory">
                {cartCount}
              </span>
            )}
          </button>

          {/* Account */}
          {user ? (
            <button
              onClick={() => navigate('account')}
              className="hidden sm:flex items-center gap-1.5 p-1.5 rounded-full border border-warm-border hover:border-gold transition-colors"
              aria-label="Account"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gold/20 text-gold font-bold text-xs flex items-center justify-center">
                  {user.name ? user.name[0].toUpperCase() : 'G'}
                </div>
              )}
            </button>
          ) : (
            <button
              onClick={() => navigate('login')}
              className="hidden sm:block px-4 py-1.5 ml-1 text-xs font-sans font-semibold border border-warm-border rounded-md hover:bg-gold hover:border-gold hover:text-charcoal transition-colors"
            >
              Log In
            </button>
          )}

          {/* Mobile menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 text-text-base hover:text-gold transition-colors"
            aria-label="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="8" x2="21" y2="8" />
                  <line x1="3" y1="16" x2="21" y2="16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-warm-border bg-ivory px-4 py-3">
          <div className="max-w-lg mx-auto relative">
            <input
              type="text"
              placeholder="Search for rings, necklaces, bracelets..."
              autoFocus
              className="w-full px-4 py-2 pr-10 border border-warm-border rounded-lg text-sm font-sans bg-white text-text-base"
            />
            <svg className="absolute right-3 top-2.5 text-text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-warm-border bg-ivory">
          <ul className="px-4 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
            {navLinks.map((link, i) => (
              <li key={i}>
                {link.items ? (
                  <details className="group">
                    <summary className="text-base font-sans tracking-wide w-full text-left transition-colors text-text-base list-none flex justify-between items-center cursor-pointer">
                      {link.label}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-open:rotate-180 transition-transform">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </summary>
                    <div className="pl-4 mt-3 flex flex-col gap-3">
                      {link.items.map((subItem, j) => (
                        <button
                          key={j}
                          onClick={() => { 
                            setShopFilter(link.label, subItem);
                            navigate('shop'); 
                            setMenuOpen(false); 
                          }}
                          className="text-left text-sm font-sans text-text-muted hover:text-gold transition-colors"
                        >
                          {subItem}
                        </button>
                      ))}
                    </div>
                  </details>
                ) : (
                  <button
                    onClick={() => { 
                      if (link.page) {
                        if (link.page === 'shop') setShopFilter(link.label, null);
                        navigate(link.page); 
                      } else if (link.items) {
                        setShopFilter(link.label, null);
                        navigate('shop');
                      }
                      setMenuOpen(false); 
                    }}
                    className={`text-base font-sans tracking-wide w-full text-left transition-colors ${page === link.page || (page === 'shop' && !link.page) ? 'text-gold font-medium' : 'text-text-base'}`}
                  >
                    {link.label}
                  </button>
                )}
              </li>
            ))}
            <li className="pt-4 border-t border-warm-border">
              {user ? (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => { navigate('account'); setMenuOpen(false); }}
                    className="text-base font-sans text-text-base"
                  >
                    My Account ({user.name})
                  </button>
                  <button onClick={logout} className="text-xs text-red-500 font-medium">Logout</button>
                </div>
              ) : (
                <button
                  onClick={() => { navigate('login'); setMenuOpen(false); }}
                  className="text-base font-sans text-text-base w-full text-left"
                >
                  Log In / Sign Up
                </button>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
