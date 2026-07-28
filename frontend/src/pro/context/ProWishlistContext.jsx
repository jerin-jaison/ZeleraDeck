import React, { createContext, useContext, useState, useEffect } from 'react';

const ProWishlistContext = createContext(null);

export function ProWishlistProvider({ children, slug }) {
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist from sessionStorage
  useEffect(() => {
    if (!slug) return;
    const key = `pro_wishlist_${slug}`;
    const saved = sessionStorage.getItem(key);
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing wishlist from sessionStorage', e);
      }
    } else {
      setWishlist([]);
    }
  }, [slug]);

  // Save wishlist to sessionStorage
  const saveWishlist = (newWishlist) => {
    setWishlist(newWishlist);
    if (slug) {
      sessionStorage.setItem(`pro_wishlist_${slug}`, JSON.stringify(newWishlist));
    }
  };

  const toggleWishlist = (product) => {
    const exists = wishlist.some((item) => item.display_id === product.display_id);
    if (exists) {
      const updated = wishlist.filter((item) => item.display_id !== product.display_id);
      saveWishlist(updated);
    } else {
      const updated = [...wishlist, product];
      saveWishlist(updated);
    }
  };

  const isWishlisted = (displayId) => {
    return wishlist.some((item) => item.display_id === displayId);
  };

  return (
    <ProWishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted }}>
      {children}
    </ProWishlistContext.Provider>
  );
}

export function useProWishlist() {
  const context = useContext(ProWishlistContext);
  if (!context) {
    throw new Error('useProWishlist must be used within a ProWishlistProvider');
  }
  return context;
}
