import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { useProWishlist } from './context/ProWishlistContext';
import ProProductCard from './components/ProProductCard';
import SEOHead from '../components/SEOHead';

export default function ProWishlistPage() {
  const { storeData, slug } = useOutletContext();
  const { wishlist, toggleWishlist } = useProWishlist();
  const shopName = storeData?.shop?.name || 'AESTHETE';

  return (
    <div className="bg-[var(--pro-background)] py-16 min-h-[70vh]">
      <SEOHead 
        title={`My Wishlist — ${shopName}`} 
        description={`Your saved curated products from ${shopName}. Browse and manage your selections.`}
        url={window.location.href}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-16">
        
        {/* Header */}
        <div className="border-b border-neutral-200/50 pb-6 mb-12">
          <h1 className="pro-headline-xl mb-2">My Wishlist</h1>
          <p className="pro-body-md text-neutral-400 font-sans">
            Saved items ({wishlist.length})
          </p>
        </div>

        {/* Wishlist Items Grid */}
        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-neutral-50 border border-neutral-100 flex flex-col items-center justify-center">
            <Heart className="w-12 h-12 text-neutral-300 mb-4 stroke-1" />
            <h2 className="pro-headline-sm text-neutral-400 mb-2">Your wishlist is empty</h2>
            <p className="pro-body-md text-neutral-400 max-w-sm mb-8">
              Explore our curation and save your favorite items by tapping the heart icon.
            </p>
            <Link to={`/${slug}/shop`} className="pro-btn-primary">
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {wishlist.map((prod) => (
              <div key={prod.display_id} className="relative group">
                <ProProductCard product={prod} slug={slug} />
                
                {/* Overlay remove action button for Wishlist page */}
                <button
                  onClick={() => toggleWishlist(prod)}
                  className="absolute bottom-16 right-4 z-10 bg-white/90 hover:bg-black hover:text-white text-black p-2.5 rounded-full transition-all duration-200 shadow-sm border border-neutral-100"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
