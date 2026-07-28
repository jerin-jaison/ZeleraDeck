import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { publicApi } from '../api/axios';
import SEOHead from '../components/SEOHead';

/**
 * ProAboutPage
 * Fetches real about blocks from GET /api/pro/<slug>/about/
 * and renders them in an editorial alternating layout.
 *
 * Layout per block (alternating):
 *  - Even index (0, 2, 4…): Text LEFT · Image RIGHT  (aspect-[4/5])
 *  - Odd index  (1, 3, 5…): Image LEFT · Text RIGHT  (aspect-[3/4])
 *
 * If zero blocks exist → clean empty state.
 * Hardcoded demo content is GONE entirely.
 */
export default function ProAboutPage() {
  const { slug } = useParams();
  const { storeData } = useOutletContext();
  const shopName = storeData?.shop?.name || 'Our Brand';

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ['pro-about-blocks', slug],
    queryFn: () => publicApi.get(`pro/${slug}/about/`).then(r => r.data),
    staleTime: 60 * 1000,
  });

  return (
    <div className="bg-[var(--pro-background)]">
      <SEOHead
        title={`Our Story — ${shopName}`}
        description={`Read the design philosophy, brand values, and story behind ${shopName}.`}
        url={window.location.href}
      />

      {/* ── Page header ──────────────────────────────────────── */}
      <section className="pt-16 pb-12 px-5 md:px-16 max-w-7xl mx-auto border-b border-neutral-100">
        <span className="pro-label-caps text-xs text-neutral-400 mb-3 block">Our Story</span>
        <h1
          className="font-serif text-4xl md:text-6xl tracking-tight uppercase leading-tight text-black"
          style={{ fontFamily: "'Bodoni Moda', serif" }}
        >
          {shopName}
        </h1>
      </section>

      {/* ── Loading state ────────────────────────────────────── */}
      {isLoading && (
        <div className="flex items-center justify-center py-40">
          <div className="w-10 h-10 border-2 border-neutral-200 border-t-black rounded-full animate-spin" />
        </div>
      )}

      {/* ── Empty state (0 blocks) ───────────────────────────── */}
      {!isLoading && blocks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-40 px-5 text-center">
          <span className="material-symbols-outlined text-[56px] text-neutral-200 mb-4">article</span>
          <h2 className="font-serif text-2xl text-black mb-3">Coming Soon</h2>
          <p className="text-neutral-400 text-sm max-w-sm font-sans">
            The story behind {shopName} is being crafted. Check back soon.
          </p>
          <Link
            to={`/${slug}/shop`}
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold tracking-wider uppercase text-black hover:opacity-70 transition-opacity"
          >
            Browse Collection <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* ── Real blocks ──────────────────────────────────────── */}
      {!isLoading && blocks.length > 0 && (
        <div className="divide-y divide-neutral-100">
          {blocks.map((block, idx) => {
            const isEven = idx % 2 === 0;
            const aspectClass = isEven ? 'aspect-[4/5]' : 'aspect-[3/4]';

            return (
              <section
                key={block.id}
                className="py-20 md:py-28 px-5 md:px-16 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center"
              >
                {/* Text panel */}
                <div
                  className={`flex flex-col gap-6 ${
                    isEven
                      ? 'md:col-span-5 order-2 md:order-1'
                      : 'md:col-span-5 md:col-start-8 order-2'
                  }`}
                >
                  <span className="pro-label-caps text-xs text-neutral-400">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <h2
                    className="pro-headline-xl text-3xl md:text-4xl text-black"
                    style={{ fontFamily: "'Bodoni Moda', serif" }}
                  >
                    {block.heading}
                  </h2>
                  <p className="pro-body-lg text-neutral-600 font-sans leading-relaxed whitespace-pre-line">
                    {block.body}
                  </p>
                  <div className="h-px w-16 bg-neutral-200" />
                </div>

                {/* Image panel */}
                <div
                  className={`${
                    isEven
                      ? 'md:col-start-7 md:col-span-6 order-1 md:order-2'
                      : 'md:col-span-6 order-1'
                  }`}
                >
                  {block.image_url ? (
                    <div className={`${aspectClass} bg-neutral-100 overflow-hidden`}>
                      <img
                        src={block.image_url}
                        alt={block.heading}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className={`${aspectClass} bg-neutral-50 border border-neutral-100 flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-neutral-200 text-[48px]">image</span>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* ── Shop CTA at bottom ───────────────────────────────── */}
      {!isLoading && blocks.length > 0 && (
        <section className="py-20 bg-white border-t border-neutral-100">
          <div className="max-w-7xl mx-auto px-5 md:px-16 text-center">
            <h2 className="font-serif text-3xl md:text-4xl text-black mb-4"
              style={{ fontFamily: "'Bodoni Moda', serif" }}>
              Explore the Collection
            </h2>
            <p className="text-neutral-400 text-sm font-sans mb-8">
              Every piece reflects the values and craft described above.
            </p>
            <Link
              to={`/${slug}/shop`}
              className="inline-block bg-black text-white font-semibold text-xs uppercase tracking-widest px-10 py-4 hover:bg-neutral-800 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
