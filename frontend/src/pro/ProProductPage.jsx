import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Check } from 'lucide-react';
import { useProProduct } from './hooks/useProProduct';
import { useProWishlist } from './context/ProWishlistContext';
import ProGallery from './components/ProGallery';
import ProProductCard from './components/ProProductCard';
import SEOHead from '../components/SEOHead';

const WA_SVG = (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
);

export default function ProProductPage() {
  const { slug, displayId } = useParams();
  const { toggleWishlist, isWishlisted } = useProWishlist();
  const { data, isLoading, error } = useProProduct(slug, displayId);

  // ── All hooks MUST be before any early returns ─────────────────────────────
  // Derive sizes/colors from data (safe defaults when data is not yet available)
  const product = data?.product ?? null;
  const shop = data?.shop ?? null;
  const similar_products = data?.similar_products ?? [];

  const availableSizes =
    Array.isArray(product?.available_sizes) && product.available_sizes.length > 0
      ? product.available_sizes
      : [];

  const availableColors = (product?.available_colors ?? []).filter(
    (c) => c && c !== 'None'
  );

  // Hooks always called, no conditional placement
  const [activeSize, setActiveSize] = useState('');
  const [activeColor, setActiveColor] = useState('');

  React.useEffect(() => {
    if (availableSizes.length > 0 && (!activeSize || !availableSizes.includes(activeSize))) {
      setActiveSize(availableSizes[0]);
    }
    if (availableColors.length > 0 && (!activeColor || !availableColors.includes(activeColor))) {
      setActiveColor(availableColors[0]);
    }
  }, [availableSizes, availableColors]);

  // ── Early returns AFTER all hooks ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-neutral-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data || !product) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center justify-center px-4">
        <h1 className="pro-display-lg text-4xl mb-4">Product Not Found</h1>
        <p className="pro-body-md text-neutral-500 mb-6">The product you are trying to view does not exist or has been removed.</p>
        <Link to={`/${slug}/shop`} className="pro-btn-outline">Back to Shop</Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.display_id);
  const sizes = availableSizes;
  const colors = availableColors;

  const hasDiscount = product.discount_percent > 0;
  const discountedPrice = hasDiscount
    ? Math.round(Number(product.price) * (1 - product.discount_percent / 100))
    : Number(product.price);

  const orderOnWhatsApp = () => {
    const message =
      `Hi! I'm interested in ordering:\n\n` +
      `🛍️ Product: ${product.name}\n` +
      `🆔 ID: ${product.display_id}\n` +
      `💰 Price: ₹${discountedPrice.toLocaleString('en-IN')}${hasDiscount ? ` (Original: ₹${Number(product.price).toLocaleString('en-IN')})` : ''}\n` +
      `📏 Size: ${activeSize || sizes[0]}\n` +
      `🔗 Link: https://zeleradeck.onrender.com/og/store/${slug}/product/${product.display_id}\n\n` +
      `Please confirm availability. Thank you!`;
    window.open(`https://wa.me/${shop?.whatsapp_number}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="bg-[var(--pro-background)] py-12">
      <SEOHead
        title={`${product.name} — ${shop?.name}`}
        description={product.description || `${product.name} available at ${shop?.name}. Price: ₹${discountedPrice}`}
        url={window.location.href}
        image={product.image_url}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-16">

        {/* Breadcrumb nav */}
        <div className="mb-10 text-xs pro-label-caps text-neutral-400">
          <Link to={`/${slug}`} className="hover:text-black">Home</Link>
          <span className="mx-2">/</span>
          <Link to={`/${slug}/shop`} className="hover:text-black">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-black">{product.name}</span>
        </div>

        {/* Core Detail Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">

          {/* Gallery - 7 cols */}
          <div className="lg:col-span-7">
            <ProGallery
              image_url={product.image_url}
              image_url_2={product.image_url_2}
              image_url_3={product.image_url_3}
              image_url_4={product.image_url_4}
              video_url={product.video_url}
            />
          </div>

          {/* Details / Action panel - 5 cols */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <span className="pro-label-caps text-neutral-400 block mb-2">
                {product.category_name || 'Collection'}
              </span>
              <h1 className="pro-headline-xl text-3xl md:text-4xl mb-4">{product.name}</h1>
              <p className="pro-label-sm text-neutral-400 mb-6 font-mono">ID: {product.display_id}</p>

              {/* Price & Discount Display */}
              {hasDiscount ? (
                <div className="flex items-baseline gap-3 mb-8">
                  <span className="text-3xl font-serif text-black" style={{ fontFamily: "'Bodoni Moda', serif" }}>
                    ₹{discountedPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-lg text-neutral-400 line-through font-sans">
                    ₹{Number(product.price).toLocaleString('en-IN')}
                  </span>
                  <span className="pro-label-caps bg-black text-white text-[10px] px-2.5 py-1 font-bold tracking-widest">
                    -{product.discount_percent}% OFF
                  </span>
                </div>
              ) : (
                <p className="text-3xl font-serif text-black mb-8" style={{ fontFamily: "'Bodoni Moda', serif" }}>
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </p>
              )}

              {/* Sizes Selection */}
              {product.is_in_stock && sizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="pro-label-caps text-xs text-neutral-400 mb-3">Select Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setActiveSize(size)}
                        className={`min-w-[48px] h-12 px-3 flex items-center justify-center text-xs font-sans border transition-all duration-200 ${
                          activeSize === size
                            ? 'border-black bg-black text-white'
                            : 'border-neutral-200 hover:border-black text-neutral-700 bg-transparent'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}


              {/* Description Details */}
              <div className="border-t border-b border-neutral-200 my-8 py-6">
                <h3 className="pro-label-caps text-xs text-neutral-400 mb-3">Description &amp; Details</h3>
                <p className="pro-body-md text-sm text-neutral-600 whitespace-pre-line font-sans leading-relaxed">
                  {product.description || "Designed with clean lines, premium cuts, and an emphasis on functional elegance. A perfect addition to a curated capsule wardrobe."}
                </p>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="mt-8 flex gap-4">
              {product.is_in_stock ? (
                <button
                  onClick={orderOnWhatsApp}
                  className="pro-btn-whatsapp flex-grow flex items-center justify-center gap-2"
                >
                  {WA_SVG} Enquire on WhatsApp
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-neutral-300 text-neutral-500 pro-label-caps py-4 cursor-not-allowed text-center"
                >
                  Sold Out
                </button>
              )}

              <button
                onClick={() => toggleWishlist(product)}
                className={`w-14 border flex items-center justify-center transition-colors ${
                  wishlisted ? 'bg-black border-black text-white' : 'border-neutral-200 hover:border-black bg-transparent text-black'
                }`}
                aria-label={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-white text-white' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Section: Similar Products */}
        {similar_products.length > 0 && (
          <section className="border-t border-neutral-200 pt-16">
            <h2 className="pro-headline-lg mb-10">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {similar_products.slice(0, 4).map(prod => (
                <ProProductCard key={prod.display_id} product={prod} slug={slug} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
