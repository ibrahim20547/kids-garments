import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const { success, info } = useToast();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Load wishlist from backend if authenticated, or localStorage if guest
  const loadWishlist = async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const data = await api.getWishlist();
        setWishlistItems(data.wishlist || []);
        setWishlistIds(new Set((data.wishlist || []).map((p) => p.id)));
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      } finally {
        setLoading(false);
      }
    } else {
      const local = localStorage.getItem('kg_guest_wishlist');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          setWishlistItems(parsed);
          setWishlistIds(new Set(parsed.map((p) => p.id)));
        } catch (e) {
          setWishlistItems([]);
          setWishlistIds(new Set());
        }
      } else {
        setWishlistItems([]);
        setWishlistIds(new Set());
      }
    }
  };

  useEffect(() => {
    loadWishlist();
  }, [isAuthenticated, user]);

  const toggleWishlist = async (product) => {
    if (!product || !product.id) return;
    const isCurrentlyIn = wishlistIds.has(product.id);

    if (isAuthenticated) {
      try {
        const res = await api.toggleWishlist(product.id);
        if (res.action === 'added') {
          setWishlistItems((prev) => [product, ...prev.filter((p) => p.id !== product.id)]);
          setWishlistIds((prev) => new Set([...prev, product.id]));
          success(`Added "${product.name}" to your wishlist!`);
        } else {
          setWishlistItems((prev) => prev.filter((p) => p.id !== product.id));
          setWishlistIds((prev) => {
            const next = new Set(prev);
            next.delete(product.id);
            return next;
          });
          info(`Removed "${product.name}" from your wishlist.`);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // Guest mode
      if (isCurrentlyIn) {
        const updated = wishlistItems.filter((p) => p.id !== product.id);
        setWishlistItems(updated);
        setWishlistIds(new Set(updated.map((p) => p.id)));
        localStorage.setItem('kg_guest_wishlist', JSON.stringify(updated));
        info(`Removed "${product.name}" from your wishlist.`);
      } else {
        const updated = [product, ...wishlistItems.filter((p) => p.id !== product.id)];
        setWishlistItems(updated);
        setWishlistIds(new Set(updated.map((p) => p.id)));
        localStorage.setItem('kg_guest_wishlist', JSON.stringify(updated));
        success(`Added "${product.name}" to your wishlist!`);
      }
    }
  };

  const isInWishlist = (productId) => {
    return wishlistIds.has(productId);
  };

  const removeFromWishlist = async (productId) => {
    const prod = wishlistItems.find((p) => p.id === productId);
    if (prod) {
      await toggleWishlist(prod);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistIds,
        wishlistCount: wishlistItems.length,
        loading,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        loadWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}
