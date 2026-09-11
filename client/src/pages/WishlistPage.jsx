import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveAllToCart = () => {
    wishlistItems.forEach((p) => {
      const size = p.sizes && p.sizes.length > 0 ? p.sizes[0].size_name : 'Standard';
      const color = p.colors && p.colors.length > 0 ? p.colors[0].color_name : 'Standard';
      addToCart(p, size, color, 1);
    });
  };

  if (wishlistCount === 0) {
    return (
      <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', background: '#FFFFFF', padding: '48px 32px', borderRadius: '24px', border: '1px solid var(--border-light)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={40} />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Your Wishlist is Empty</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>
            Save your favorite kids garments by clicking the heart icon on any product card!
          </p>
          <Link to="/shop" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            Explore Kids Fashion <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
              Saved Garments
            </span>
            <h1 style={{ fontSize: '2.4rem', marginTop: '4px' }}>My Wishlist ({wishlistCount})</h1>
          </div>

          <button onClick={handleMoveAllToCart} className="btn btn-primary">
            <ShoppingBag size={18} /> Move All to Bag
          </button>
        </div>

        <div className="product-grid">
          {wishlistItems.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>
    </div>
  );
}
