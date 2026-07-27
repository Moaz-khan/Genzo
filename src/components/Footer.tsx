import { useState } from 'react';
import { useNav } from '../context/NavContext';

export default function Footer() {
  const { navigate } = useNav();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterStatus('loading');
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not subscribe');
      setNewsletterStatus('success');
      setNewsletterMsg('You\'re subscribed! Welcome to Genzo Silver.');
      setNewsletterEmail('');
    } catch (error) {
      setNewsletterStatus('error');
      setNewsletterMsg(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  return (
    <footer className="bg-charcoal text-ivory">
      {/* Newsletter section */}
      <div className="border-b border-ivory/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-[10px] tracking-[0.4em] font-sans text-gold font-medium uppercase mb-3">Stay in the Loop</p>
            <h3 className="font-serif text-2xl sm:text-3xl text-ivory mb-3">The Silver Lining</h3>
            <p className="text-sm text-ivory/50 font-sans mb-6 max-w-md mx-auto leading-relaxed">
              Be the first to know about new drops, exclusive collections, and special offers — delivered straight to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1 relative">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={e => { setNewsletterEmail(e.target.value); if (newsletterStatus !== 'idle') { setNewsletterStatus('idle'); setNewsletterMsg(''); } }}
                  placeholder="Your email address"
                  disabled={newsletterStatus === 'loading'}
                  className="w-full px-5 py-3 bg-ivory/5 border border-ivory/20 rounded-xl text-sm font-sans text-ivory placeholder-ivory/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={newsletterStatus === 'loading'}
                className="px-6 py-3 bg-gold text-charcoal font-sans font-semibold text-sm rounded-xl hover:bg-gold-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {newsletterStatus === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Subscribing...
                  </span>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
            {newsletterStatus === 'success' && (
              <p className="mt-3 text-xs font-sans text-green-400 font-medium flex items-center justify-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {newsletterMsg}
              </p>
            )}
            {newsletterStatus === 'error' && (
              <p className="mt-3 text-xs font-sans text-red-400 font-medium">{newsletterMsg}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <div className="font-serif text-2xl font-bold tracking-widest">GENZO</div>
              <div className="text-[9px] tracking-[0.4em] text-gold font-sans font-medium">SILVER</div>
            </div>
            <p className="text-sm text-ivory/60 font-sans leading-relaxed mb-5">
              Handcrafted 92.5 sterling silver jewellery, made with love in Pakistan. Each piece carries a story — wear it well.
            </p>
            <div className="flex gap-3">
              {['instagram', 'facebook', 'tiktok'].map(social => (
                <a
                  key={social}
                  href="#"
                  className="w-8 h-8 border border-ivory/20 rounded-full flex items-center justify-center hover:border-gold hover:text-gold transition-colors text-ivory/60"
                  aria-label={social}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    {social === 'instagram' && <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />}
                    {social === 'facebook' && <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />}
                    {social === 'tiktok' && <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-sans font-semibold text-sm tracking-widest text-ivory/40 mb-4 uppercase">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', page: 'home' as const },
                { label: 'Shop All', page: 'shop' as const },
                { label: 'About Us', page: 'about' as const },
                { label: 'Contact', page: 'contact' as const },
              ].map(link => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.page)}
                    className="text-sm text-ivory/60 hover:text-gold transition-colors font-sans"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-sans font-semibold text-sm tracking-widest text-ivory/40 mb-4 uppercase">Customer Service</h4>
            <ul className="space-y-2.5 text-sm text-ivory/60 font-sans">
              <li><a href="#" className="hover:text-gold transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Return & Exchange</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Care Instructions</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Contact & Payment */}
          <div>
            <h4 className="font-sans font-semibold text-sm tracking-widest text-ivory/40 mb-4 uppercase">Contact Us</h4>
            <ul className="space-y-2.5 text-sm text-ivory/60 font-sans mb-6">
              <li className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.7 19.79 19.79 0 0 1 1.61 3.12 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                +92 300 1234567
              </li>
              <li className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                hello@genzosilver.pk
              </li>
              <li className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Pakistan
              </li>
            </ul>
            <h4 className="font-sans font-semibold text-sm tracking-widest text-ivory/40 mb-3 uppercase">We Accept</h4>
            <div className="flex flex-wrap gap-2">
              {['COD', 'JazzCash', 'EasyPaisa', 'Bank'].map(method => (
                <span
                  key={method}
                  className="px-2.5 py-1 border border-ivory/20 rounded text-xs font-sans text-ivory/60"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-ivory/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ivory/30 font-sans">
          <p>© 2026 Genzo Silver. All rights reserved.</p>
          <p>Handcrafted with care in Pakistan</p>
        </div>
      </div>
    </footer>
  );
}
