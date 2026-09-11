import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Heart } from 'lucide-react';
import { formatPKR } from '../utils/currency';
import { handleImageError } from '../utils/imageUtils';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const trackRecentlyViewed = (product) => {
  if (!product || !product.id) return;
  try {
    const raw = localStorage.getItem('kg_recently_viewed');
    let list = raw ? JSON.parse(raw) : [];
    list = list.filter((p) => p.id !== product.id);
    list.unshift({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      sale_price: product.sale_price,
      on_sale: product.on_sale,
      main_image: product.main_image || (product.images && product.images[0]) || '',
      category_name: product.category_name,
      stock_quantity: product.stock_quantity !== undefined ? product.stock_quantity : (product.stock || 20)
    });
    // Keep max 8 items
    if (list.length > 8) list = list.slice(0, 8);
    localStorage.setItem('kg_recently_viewed', JSON.stringify(list));
  } catch (e) {
    console.warn('Could not save recently viewed product:', e);
  }
};

export default function RecentlyViewedProducts({ currentProductId = null }) {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('kg_recently_viewed');
      if (raw) {
        let list = JSON.parse(raw);
        if (currentProductId) {
          list = list.filter((p) => p.id !== currentProductId);
        }
        setProducts(list);
      }
    } catch (e) {
      setProducts([]);
    }
  }, [currentProductId]);

  if (products.length === 0) return null;

  return (
    <section style={{ marginTop: '50px', marginBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
            Recently Viewed by You
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Jump back to items you explored recently
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px'
        }}
      >
        {products.slice(0, 4).map((prod) => (
          <div
            key={prod.id}
            className="card"
            style={{
              padding: '12px',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '1/1', background: '#F8FAFC', marginBottom: '10px' }}>
                <Link to={`/product/${prod.slug || prod.id}`}>
                  <img
                    src={prod.main_image}
                    alt={prod.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => handleImageError(e, prod.gender || 'Kids')}
                  />
                </Link>
                <button
                  onClick={() => toggleWishlist(prod.id)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    color: isInWishlist(prod.id) ? 'var(--primary)' : '#94A3B8'
                  }}
                >
                  <Heart size={15} fill={isInWishlist(prod.id) ? 'currentColor' : 'none'} />
                </button>
              </div>

              <Link to={`/product/${prod.slug || prod.id}`}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-dark)', margin: '0 0 4px', lineClamp: 1, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {prod.name}
                </h4>
              </Link>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                {prod.on_sale && prod.sale_price ? formatPKR(prod.sale_price) : formatPKR(prod.price)}
              </div>
            </div>

            <button
              onClick={() => addToCart(prod, null, null, 1)}
              className="btn btn-soft btn-sm"
              style={{ width: '100%', marginTop: '10px', fontSize: '0.8rem', padding: '6px 10px' }}
            >
              <ShoppingBag size={14} /> Quick Add
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
