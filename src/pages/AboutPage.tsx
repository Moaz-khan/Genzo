export default function AboutPage() {
  return (
    <main className="bg-ivory">
      {/* Hero */}
      <section className="relative h-72 sm:h-96 overflow-hidden bg-charcoal">
        <img
          src="https://images.unsplash.com/photo-1685489807405-fdffb06aef2c?w=1440&h=500&fit=crop&auto=format"
          alt="Genzo Silver craftsmanship"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="text-[10px] tracking-[0.4em] font-sans text-gold font-medium uppercase mb-3">Since 2018</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-white">Our Story</h1>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-[10px] tracking-[0.4em] font-sans text-gold font-medium uppercase mb-4">Our Beginning</p>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal mb-6 leading-tight">
                Born in a Pakistan<br />workshop, worn across<br />the world.
              </h2>
              <div className="space-y-4 font-sans text-text-muted leading-relaxed text-sm">
                <p>
                  Genzo Silver began in 2018 in a small workshop in Pakistan's Anarkali Bazaar — the same streets where Pakistan's finest jewellers have worked for centuries. Our founder, Usman Genzo, grew up watching his grandfather set stones by hand, and that patience and precision became the soul of every piece we make.
                </p>
                <p>
                  We started with a single ring design and a belief that Pakistani women deserved world-class jewellery at honest prices. Today, we ship across Pakistan and to the Pakistani diaspora worldwide, but the workshop hasn't moved and every piece is still finished by hand.
                </p>
                <p>
                  We work exclusively in 92.5 sterling silver — stamped, certified, and built to last lifetimes. No gold plating. No shortcuts. Just authentic silver and real craftsmanship.
                </p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-beige">
              <img
                src="https://images.unsplash.com/photo-1633934542430-0905ccb5f050?w=800&h=600&fit=crop&auto=format"
                alt="Artisan crafting jewellery"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-20 bg-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[10px] tracking-[0.4em] font-sans text-gold font-medium uppercase mb-3">What Drives Us</p>
            <h2 className="font-serif text-4xl text-charcoal">Mission & Vision</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Our Mission",
                text: "To make handcrafted silver jewellery that is honest in its materials, fair in its pricing, and thoughtful in its design. We believe every woman deserves to wear something beautiful that was made with real skill and real care.",
                icon: "🎯",
              },
              {
                title: "Our Vision",
                text: "To become Pakistan's most trusted jewellery brand — one where the quality is so consistent that a piece bought in 2026 will be treasured in 2056. We want Genzo Silver to be a name passed down with the jewellery itself.",
                icon: "✨",
              },
            ].map(card => (
              <div key={card.title} className="bg-white rounded-2xl border border-warm-border p-8">
                <span className="text-3xl mb-4 block">{card.icon}</span>
                <h3 className="font-serif text-2xl text-charcoal mb-4">{card.title}</h3>
                <p className="font-sans text-text-muted leading-relaxed text-sm">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship */}
      <section className="py-20 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[10px] tracking-[0.4em] font-sans text-gold font-medium uppercase mb-3">How We Work</p>
            <h2 className="font-serif text-4xl text-charcoal">From Silver to Jewellery</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Design',
                description: 'Every piece begins with hand sketches from our design team, inspired by Mughal motifs, celestial patterns, and contemporary forms.',
                image: "https://images.unsplash.com/photo-1511253819057-5408d4d70465?w=400&h=300&fit=crop&auto=format",
              },
              {
                step: '02',
                title: 'Cast',
                description: 'Pure 92.5 silver is melted and cast into forms using traditional lost-wax casting — a technique unchanged for thousands of years.',
                image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=300&fit=crop&auto=format",
              },
              {
                step: '03',
                title: 'Finish',
                description: 'Each piece is hand-filed, buffed to a mirror polish, and inspected individually. No two pieces are exactly alike.',
                image: "https://images.unsplash.com/photo-1631050165122-626a1377fbce?w=400&h=300&fit=crop&auto=format",
              },
              {
                step: '04',
                title: 'Pack & Ship',
                description: 'Your jewellery arrives in our signature ivory box with a care card. We ship same-day from Pakistan across all of Pakistan.',
                image: "https://images.unsplash.com/photo-1673131158656-84601f4d00ea?w=400&h=300&fit=crop&auto=format",
              },
            ].map(step => (
              <div key={step.step} className="group">
                <div className="rounded-xl overflow-hidden aspect-[4/3] bg-beige mb-4">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="text-[10px] font-sans font-bold tracking-widest text-gold mb-1">{step.step}</div>
                <h3 className="font-serif text-lg text-charcoal mb-2">{step.title}</h3>
                <p className="font-sans text-xs text-text-muted leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '8+', label: 'Years in Business' },
              { value: '45,000+', label: 'Happy Customers' },
              { value: '200+', label: 'Designs Available' },
              { value: '4.8★', label: 'Average Rating' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="font-serif text-3xl sm:text-4xl text-gold mb-2">{stat.value}</div>
                <div className="font-sans text-xs text-ivory/50 tracking-widest uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
