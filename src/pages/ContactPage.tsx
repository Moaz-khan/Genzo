import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="bg-ivory">
      {/* Hero */}
      <section className="bg-beige border-b border-warm-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] tracking-[0.4em] font-sans text-gold font-medium uppercase mb-3">Get in Touch</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal mb-4">Contact Us</h1>
          <p className="font-sans text-text-muted text-base max-w-md mx-auto">
            We're here to help. Reach out with any questions, order inquiries, or just to say hello.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Contact cards */}
            <div className="space-y-5">
              {[
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  ),
                  title: 'WhatsApp',
                  detail: '+92 300 1234567',
                  sub: 'Mon–Sat, 10am–8pm',
                  action: 'Chat Now',
                  href: '#',
                },
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  ),
                  title: 'Email',
                  detail: 'hello@genzosilver.pk',
                  sub: 'We reply within 24 hours',
                  action: 'Email Us',
                  href: 'mailto:hello@genzosilver.pk',
                },
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  ),
                  title: 'Workshop',
                  detail: 'Anarkali Bazaar, Pakistan',
                  sub: 'Visit by appointment only',
                  action: 'Get Directions',
                  href: '#',
                },
              ].map(card => (
                <div
                  key={card.title}
                  className="bg-white rounded-xl border border-warm-border p-5 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold shrink-0">
                    {card.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-sans font-semibold text-sm text-charcoal mb-1">{card.title}</h3>
                    <p className="font-sans text-sm text-charcoal font-medium">{card.detail}</p>
                    <p className="font-sans text-xs text-text-muted mb-3">{card.sub}</p>
                    <a
                      href={card.href}
                      className="text-xs font-sans font-medium text-gold border-b border-gold pb-0.5 hover:text-gold-dark hover:border-gold-dark transition-colors"
                    >
                      {card.action} →
                    </a>
                  </div>
                </div>
              ))}

              {/* Map placeholder */}
              <div className="rounded-xl overflow-hidden border border-warm-border aspect-4/3 bg-beige flex items-center justify-center">
                <div className="text-center p-6">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C9A44C" strokeWidth="1.5" className="mx-auto mb-3">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <p className="font-serif text-charcoal text-base">Anarkali Bazaar</p>
                  <p className="font-sans text-text-muted text-xs">Pakistan, Punjab 54000</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-warm-border p-8">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-5">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A44C" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h2 className="font-serif text-2xl text-charcoal mb-2">Message Sent!</h2>
                    <p className="font-sans text-text-muted text-sm">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-6 text-sm font-sans text-gold border-b border-gold pb-0.5"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="font-serif text-2xl text-charcoal mb-6">Send Us a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-sans font-medium text-text-muted mb-1.5 uppercase tracking-wide">
                            Your Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Farah Ahmed"
                            className="w-full px-4 py-2.5 border border-warm-border rounded-lg text-sm font-sans bg-ivory text-text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-sans font-medium text-text-muted mb-1.5 uppercase tracking-wide">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={form.email}
                            onChange={handleChange}
                            placeholder="farah@email.com"
                            className="w-full px-4 py-2.5 border border-warm-border rounded-lg text-sm font-sans bg-ivory text-text-base"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-sans font-medium text-text-muted mb-1.5 uppercase tracking-wide">
                          Subject
                        </label>
                        <select
                          name="subject"
                          value={form.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-warm-border rounded-lg text-sm font-sans bg-ivory text-text-base"
                        >
                          <option value="">Select a subject</option>
                          <option>Order Inquiry</option>
                          <option>Return / Exchange</option>
                          <option>Product Question</option>
                          <option>Custom / Bulk Order</option>
                          <option>Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-sans font-medium text-text-muted mb-1.5 uppercase tracking-wide">
                          Message
                        </label>
                        <textarea
                          name="message"
                          required
                          value={form.message}
                          onChange={handleChange}
                          rows={6}
                          placeholder="How can we help you?"
                          className="w-full px-4 py-2.5 border border-warm-border rounded-lg text-sm font-sans bg-ivory text-text-base resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-gold text-charcoal font-sans font-semibold text-sm tracking-wide rounded-lg hover:bg-gold-dark transition-colors"
                      >
                        Send Message
                      </button>

                      <p className="text-xs font-sans text-text-muted text-center">
                        Or reach us directly on WhatsApp for a faster response.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
