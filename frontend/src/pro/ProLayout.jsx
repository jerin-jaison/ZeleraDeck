import React, { useState, useEffect } from 'react';
import { useParams, Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Heart } from 'lucide-react';
import { useProStore } from './hooks/useProStore';
import { ProWishlistProvider, useProWishlist } from './context/ProWishlistContext';
import './pro.css';

function ProLayoutContent() {
  const { slug } = useParams();
  const location = useLocation();
  const { data: storeData, isLoading, error } = useProStore(slug);
  const { wishlist } = useProWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on page change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-neutral-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !storeData) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="pro-display-lg text-4xl mb-4">Store Not Found</h1>
        <p className="pro-body-md text-neutral-500 max-w-md">
          The premium store you are trying to visit does not exist, is inactive, or doesn't have Pro mode enabled.
        </p>
      </div>
    );
  }

  const shopName = storeData.shop?.name || 'AESTHETE';

  return (
    <div className="pro-root min-h-screen flex flex-col bg-[var(--pro-background)] text-[var(--pro-on-surface)] selection:bg-black selection:text-white">
      
      {/* TopNavBar */}
      <header
        className={`fixed top-0 w-full transition-all duration-300 ease-in-out z-50 py-4 px-5 md:px-16 border-b border-neutral-200/40 ${
          scrolled
            ? 'bg-white shadow-[0_4px_32px_rgba(0,0,0,0.03)]'
            : 'bg-[var(--pro-surface)]/80 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center relative">
          {/* Navigation Links (Left) */}
          <nav className="hidden md:flex gap-8 items-center">
            <Link
              className="pro-label-caps hover:opacity-70 transition-opacity"
              to={`/${slug}/shop`}
            >
              Shop
            </Link>
            <Link
              className="pro-label-caps hover:opacity-70 transition-opacity"
              to={`/${slug}/about`}
            >
              About
            </Link>
            <Link
              className="pro-label-caps hover:opacity-70 transition-opacity"
              to={`/${slug}/contact`}
            >
              Contact
            </Link>
          </nav>

          {/* Hamburger (Mobile Left) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-black hover:opacity-70 transition-opacity"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Logo (Center) */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link
              to={`/${slug}`}
              className="font-serif font-semibold tracking-widest hover:opacity-70 transition-opacity uppercase text-2xl md:text-3xl"
              style={{ fontFamily: "'Bodoni Moda', serif" }}
            >
              {shopName}
            </Link>
          </div>

          {/* Trailing Actions (Right) */}
          <div className="flex gap-4 items-center">
            <Link
              to={`/${slug}/wishlist`}
              className="hover:opacity-70 transition-opacity flex items-center relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 text-black" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-mono">
                  {wishlist.length}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-neutral-200 py-6 px-6 flex flex-col gap-4 shadow-lg animate-fade-in">
            <Link
              className="pro-label-caps py-2 border-b border-neutral-100"
              to={`/${slug}/shop`}
            >
              Shop
            </Link>
            <Link
              className="pro-label-caps py-2 border-b border-neutral-100"
              to={`/${slug}/about`}
            >
              About
            </Link>
            <Link
              className="pro-label-caps py-2 border-b border-neutral-100"
              to={`/${slug}/contact`}
            >
              Contact
            </Link>
            <Link
              className="pro-label-caps py-2"
              to={`/${slug}/wishlist`}
            >
              Wishlist ({wishlist.length})
            </Link>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow pt-20">
        <Outlet context={{ storeData, slug }} />
      </main>

      {/* Footer */}
      <footer className="py-16 mt-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            {/* Brand & Tagline */}
            <div className="md:col-span-5 flex flex-col justify-between">
              <div>
                <Link
                  to={`/${slug}`}
                  className="font-serif font-semibold tracking-widest uppercase text-2xl text-white mb-4 block"
                  style={{ fontFamily: "'Bodoni Moda', serif" }}
                >
                  {shopName}
                </Link>
                <p className="pro-body-md text-neutral-300 max-w-sm mb-6 leading-relaxed font-sans text-sm">
                  {shopName} presents custom curated collections, dedicated to timeless design, fine quality, and effortless personal service.
                </p>
              </div>
            </div>

            {/* Customer Care Links */}
            <div className="md:col-span-3 flex flex-col gap-3">
              <h4 className="pro-label-caps text-xs text-neutral-200 font-bold mb-2 tracking-widest">Customer Care</h4>
              <Link to={`/${slug}/shop`} className="text-sm text-neutral-300 hover:text-white transition-colors font-sans">
                Shop Collections
              </Link>
              <Link to={`/${slug}/about`} className="text-sm text-neutral-300 hover:text-white transition-colors font-sans">
                Our Story
              </Link>
              <Link to={`/${slug}/contact`} className="text-sm text-neutral-300 hover:text-white transition-colors font-sans">
                Contact Concierge
              </Link>
            </div>

            {/* Direct WhatsApp Orders */}
            <div className="md:col-span-4 flex flex-col gap-3">
              <h4 className="pro-label-caps text-xs text-neutral-200 font-bold mb-2 tracking-widest">Concierge Orders</h4>
              <p className="text-sm text-neutral-300 font-sans leading-relaxed">
                Browse our collections online, connect directly on WhatsApp for tailored sizing and inquiries, and complete your order with personalized care.
              </p>
              {storeData.shop?.logo_url && (
                <img
                  src={storeData.shop.logo_url}
                  alt={`${shopName} Logo`}
                  className="h-10 w-auto object-contain self-start mt-2 filter brightness-110 opacity-80"
                />
              )}
            </div>
          </div>

          {/* Bottom Bar: Copyright + Powered by credit */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans">
            <p className="text-neutral-400 font-medium">
              © {new Date().getFullYear()} {shopName}. All rights reserved.
            </p>
            <a
              href="https://zeleradeck.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-neutral-400 hover:text-white transition-colors tracking-wide"
            >
              Powered by ZeleraDeck
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ProLayout() {
  const { slug } = useParams();
  return (
    <ProWishlistProvider slug={slug}>
      <ProLayoutContent />
    </ProWishlistProvider>
  );
}
