import React, { useEffect, useRef } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ProProductCard from './components/ProProductCard';
import SEOHead from '../components/SEOHead';
import { publicApi } from '../api/axios';

export default function ProHomePage() {
  const { storeData, slug } = useOutletContext();
  const shopName = storeData?.shop?.name || 'AESTHETE';

  // Find 4 categories to show in category section
  const categories = storeData?.categories || [];
  const featuredProducts = storeData?.featured_products || [];

  // Fetch the about blocks to power the brand-story teaser on the home page
  const { data: aboutBlocks = [] } = useQuery({
    queryKey: ['pro-about-blocks', slug],
    queryFn: () => publicApi.get(`pro/${slug}/about/`).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });
  // Use the first block (lowest order) as the teaser
  const firstBlock = aboutBlocks.length > 0 ? aboutBlocks[0] : null;

  // Setup fade-in animations on load
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('pro-visible');
          observerRef.current.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const targets = document.querySelectorAll('.pro-fade-in');
    targets.forEach((el) => observerRef.current.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [featuredProducts]);

  // Hero settings from storeData (included in ProStoreHomeView response)
  const hero = storeData?.hero || {};
  const heroBg = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920&auto=format&fit=crop";
  const heroImage = hero.hero_image_url || heroBg;
  const heroHeadline = hero.hero_headline || '';
  const heroSubheading = hero.hero_subheading || '';

  const fallbackAboutImage = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop";

  const reviews = [
    { name: "Anjali M.", role: "Verified Buyer", text: "The fabric quality exceeded all expectations. Extremely premium minimalist cuts, perfect drape." },
    { name: "Rahul K.", role: "Architect", text: "Brilliant customer support on WhatsApp. The team sent custom measurements and delivery was fast." },
    { name: "Meera Nair", role: "Designer", text: "Pure luxury. It's rare to find boutique curation done so perfectly. Love the attention to details." }
  ];

  return (
    <div className="bg-[var(--pro-background)]">
      <SEOHead
        title={`${shopName}${heroHeadline ? ' — ' + heroHeadline : ''}`}
        description={`Explore premium boutique collections at ${shopName} storefront. Chat on WhatsApp for custom orders.`}
        url={window.location.href}
      />

      {/* Hero Section */}
      <section className="relative z-0 w-full h-[85vh] flex flex-col justify-end pb-24 px-5 md:px-16 overflow-hidden">
        {/* Background Image Container */}
        <div
          className="absolute inset-0 w-full h-full z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          {/* Automatic darkening overlay for readability */}
          <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 via-black/40 to-black/30"></div>
        </div>

        <div className="relative z-10 max-w-4xl text-white pro-fade-in">
          {heroHeadline ? (
            <>
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight uppercase leading-none mb-4" style={{ fontFamily: "'Bodoni Moda', serif" }}>
                {heroHeadline}
              </h1>
              {heroSubheading && (
                <p className="text-white/75 text-base md:text-lg font-sans mb-8 max-w-xl">{heroSubheading}</p>
              )}
            </>
          ) : (
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight uppercase leading-none mb-8" style={{ fontFamily: "'Bodoni Moda', serif" }}>
              {shopName}
            </h1>
          )}
          <Link
            to={`/${slug}/shop`}
            className="inline-block bg-white text-black font-semibold text-xs uppercase tracking-widest px-8 py-4 hover:bg-black hover:text-white transition-colors duration-300"
          >
            Shop Collection
          </Link>
        </div>
      </section>

      {/* Section 1: About Brand Teaser — driven by real About blocks data */}
      <section className="py-24 px-5 md:px-16 max-w-7xl mx-auto pro-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="aspect-[3/4] bg-[var(--pro-surface-container-low)] overflow-hidden">
            {firstBlock?.image_url ? (
              <img
                src={firstBlock.image_url}
                alt={firstBlock.heading}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            ) : (
              <img
                src={fallbackAboutImage}
                alt="Brand aesthetic"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            )}
          </div>
          <div className="flex flex-col justify-center">
            <span className="pro-label-caps text-xs text-neutral-400 mb-2">Our Story</span>
            <h2 className="pro-headline-lg mb-6">
              {firstBlock?.heading || 'Form & Function'}
            </h2>
            <p className="pro-body-md text-neutral-600 mb-8 max-w-md">
              {firstBlock?.body
                ? (
                  // Trim to ~220 chars for teaser, add ellipsis
                  firstBlock.body.length > 220
                    ? firstBlock.body.slice(0, 220).trimEnd() + '…'
                    : firstBlock.body
                )
                : 'We create thoughtful, beautifully crafted pieces with a strong aesthetic direction that prioritises quality and lasting design.'
              }
            </p>
            <Link
              to={`/${slug}/about`}
              className="text-sm font-semibold tracking-wider uppercase inline-flex items-center gap-2 text-black hover:opacity-70 transition-opacity"
            >
              Read our story <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2: Shop by Category */}
      {categories.length > 0 && (
        <section className="py-20 bg-white border-y border-neutral-100 pro-fade-in">
          <div className="max-w-7xl mx-auto px-5 md:px-16">
            <h2 className="pro-headline-lg text-center mb-12">Shop by Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {categories.slice(0, 3).map((cat, idx) => {
                const catImages = [
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuDpLf2XEkTTsNCx6MMG3enyXQOuhhrHa50TBYyPlyBVQ5BwYNrLQhrIJV8hEFJtockTOyGKj8di67Nq6fy8Tg1VfyYaQ93F0qL2LXlokXEmjsjuZgpe1Yib_F2nUpxYIBbv9NgRanEIuSL0wmyjaTt269kOPOmweOIiLDIfFYO3eR4HNWxmmfFDfvSVNxWMZCLdnaVAuxG7zAGtgLha8QnUrTjqht6vIMuD4oPVlB4tfHCavpRyk7U",
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuABs1wXE2H7sujqCtq0U-woMM9vcfukOdP1vGw2Y8Zf1aQPzRrfE7ukwg8i3pmjqTORyl0omTdE-5RJ03DTO_F7SqHOEFaX1n9zTczxaCbq47I9teEXyfthjFEFymZl3ar-xWV05Hk6svCggtLhtesn9pZlf_4E6sZDgu8iGA6SUxAi9uWdgI23SJvVXj0kiQZhNoFauPAwU3WPlgZY1Bz72ti2vJh31PFhE2nmX_9VuS4mVRXOZsk",
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuAC_poJohx0WZduqw4Wy6ijVUpzgx5x1vdpxrotw2N9xy0dnsKmQ2H7XK4YVcgn-larhtvZ461uWoD2F_LuUQSrKTQgAL6DdKfoH_WxvwyQDldWe2vLRbqWHO9_QXFdXevg7sjHRJS7pYbi8QH-3rCPKRt1XJWqM0lZPlU_i0CCrrHqSWMcCy79xMXCxP8y25IUSs3dE9eDI9iPwqS6-E_z1t3vVu47eVjTZEkdkPfkVis4OwOHtvY"
                ];
                return (
                  <Link
                    key={cat.id}
                    to={`/${slug}/shop?category=${cat.id}`}
                    className="group relative block aspect-square overflow-hidden bg-neutral-100"
                  >
                    <img 
                      src={cat.image_url || catImages[idx % catImages.length]} 
                      alt={cat.name} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="pro-label-caps bg-white text-black px-6 py-3">
                        {cat.name}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Section 3: Featured Collections */}
      {featuredProducts.length > 0 && (
        <section className="py-24 max-w-7xl mx-auto px-5 md:px-16 pro-fade-in">
          <div className="flex justify-between items-end mb-12 border-b border-neutral-200/50 pb-6">
            <h2 className="pro-headline-lg">Featured Curation</h2>
            <Link 
              to={`/${slug}/shop`}
              className="pro-label-caps text-neutral-400 hover:text-black transition-colors flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((prod) => (
              <ProProductCard key={prod.display_id} product={prod} slug={slug} />
            ))}
          </div>
        </section>
      )}

      {/* Section 4: Customer Reviews */}
      <section className="py-20 bg-neutral-50 pro-fade-in border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-5 md:px-16">
          <h2 className="pro-headline-lg text-center mb-12">Client Testimonials</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((rev, idx) => (
              <div key={idx} className="bg-white p-8 border border-neutral-200/50 flex flex-col justify-between">
                <p className="text-sm font-sans text-neutral-600 italic mb-6">
                  "{rev.text}"
                </p>
                <div>
                  <h4 className="pro-label-caps text-xs">{rev.name}</h4>
                  <span className="text-[11px] text-neutral-400 font-sans">{rev.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
