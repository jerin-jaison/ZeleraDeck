import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useProWishlist } from '../context/ProWishlistContext';

function cloudinaryOptimize(url) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto/');
}

export default function ProProductCard({ product, slug }) {
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted } = useProWishlist();
  const wishlisted = isWishlisted(product.display_id);

  const handleCardClick = () => {
    navigate(`/${slug}/product/${product.display_id}`);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="pro-card group cursor-pointer flex flex-col bg-transparent"
    >
      {/* Image Wrapper */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-[var(--pro-surface-container-low)] mb-4">
        <img 
          src={cloudinaryOptimize(product.image_url)} 
          alt={product.name} 
          className="pro-card-img w-full h-full object-cover"
          loading="lazy"
        />

        {/* Wishlist toggle button */}
        <button 
          onClick={handleWishlistClick}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white backdrop-blur-sm rounded-full transition-colors duration-200"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart 
            className={`w-4 h-4 pro-heart ${wishlisted ? 'fill-black text-black' : 'text-neutral-500'}`} 
          />
        </button>

        {/* Discount Badge */}
        {product.discount_percent > 0 && product.is_in_stock && (
          <div className="absolute top-4 left-4 z-10">
            <span className="pro-label-caps bg-black text-white px-2.5 py-1 text-[10px] font-bold tracking-widest">
              -{product.discount_percent}%
            </span>
          </div>
        )}

        {/* Out of Stock overlay */}
        {!product.is_in_stock && (
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
            <span className="pro-label-caps bg-white text-black px-4 py-2 font-semibold">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick View Button overlay (Desktop) */}
        {product.is_in_stock && (
          <div className="absolute bottom-4 left-4 right-4 hidden md:block">
            <button className="pro-card-quick-view w-full bg-white/90 hover:bg-white text-black pro-label-caps py-3 text-center transition-all duration-350">
              Quick View
            </button>
          </div>
        )}
      </div>

      {/* Info details */}
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-4">
          <span className="pro-label-sm text-[var(--pro-on-surface-variant)] block mb-1">
            {product.category_name || 'Collection'}
          </span>
          <h3 className="pro-headline-sm text-lg line-clamp-1 group-hover:opacity-75 transition-opacity">
            {product.name}
          </h3>
        </div>
        <div className="text-right shrink-0">
          {product.discount_percent > 0 ? (
            <div className="flex flex-col items-end">
              <span className="pro-body-md font-semibold text-black">
                ₹{Math.round(Number(product.price) * (1 - product.discount_percent / 100)).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-neutral-400 line-through font-sans">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
            </div>
          ) : (
            <p className="pro-body-md font-semibold text-neutral-900">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
