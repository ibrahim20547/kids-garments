import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Star, Heart, ShoppingBag, Check, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPKR } from '../utils/currency';
import { handleImageError } from '../utils/imageUtils';

export default function ProductQuickViewModal({ product, onClose }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState(product.main_image);
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? (product.sizes[0].size_name || product.sizes[0].size) : 'Standard'
  );
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? (product.colors[0].color_name || product.colors[0].name) : 'Standard'
  );
  const [quantity, setQuantity] = useState(1);

  const inWishlist = isInWishlist(product.id);
  const currentPrice = product.on_sale && product.sale_price ? product.sale_price : product.price;
  const images = product.images && product.images.length > 0 ? product.images : [product.main_image];
  const isOutOfStock = product.stock_quantity <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', padding: 0 }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--bg-alt)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            color: 'var(--text-dark)'
          }}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          {/* Left: Gallery */}
          <div style={{ padding: '24px', background: 'var(--bg-alt)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '100%', height: '360px', borderRadius: '16px', overflow: 'hidden', background: '#fff' }}>
              <img
                src={selectedImage}
                alt={product.name}
                onError={(e) => handleImageError(e, product.gender)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: selectedImage === img ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      flexShrink: 0,
                      padding: 0,
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <img
                      src={img}
                      alt="thumb"
                      onError={(e) => handleImageError(e, product.gender)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & Actions */}
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                {product.gender} • {product.category_name || product.age_group}
              </span>
              <h2 style={{ fontSize: '1.4rem', marginTop: '4px', marginBottom: '8px' }}>{product.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', color: '#F39C12' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill={i < Math.floor(product.rating || 5) ? '#F39C12' : 'none'} />
                  ))}
                </div>
                <span style={{ color: 'var(--text-muted)' }}>({product.reviews_count || 0} reviews)</span>
                <span style={{
                  color: isOutOfStock ? '#EF4444' : product.stock_quantity <= 5 ? '#EA580C' : 'var(--accent-mint)',
                  fontWeight: 600
                }}>
                  • {isOutOfStock ? 'Out of Stock' : product.stock_quantity <= 5 ? `Only ${product.stock_quantity} left` : `In Stock (${product.stock_quantity})`}
                </span>
              </div>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: product.on_sale ? 'var(--primary)' : 'var(--text-dark)' }}>
                {formatPKR(currentPrice)}
              </span>
              {product.on_sale === 1 && product.sale_price && (
                <span style={{ fontSize: '1.1rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                  {formatPKR(product.price)}
                </span>
              )}
              {product.discount_percent > 0 && (
                <span className="badge badge-sale">Save {product.discount_percent}%</span>
              )}
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: '1.6' }}>
              {product.description?.substring(0, 160)}...
            </p>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  Color: <span style={{ fontWeight: 500, color: 'var(--text-body)' }}>{selectedColor}</span>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {product.colors.map((c, idx) => {
                    const cName = c.color_name || c.name || c;
                    const cHex = c.color_hex || c.hex || '#3B82F6';
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(cName)}
                        title={cName}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: cHex,
                          border: selectedColor === cName ? '3px solid var(--primary)' : '2px solid #FFFFFF',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          cursor: 'pointer'
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  Age / Size: <span style={{ fontWeight: 500, color: 'var(--text-body)' }}>{selectedSize}</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product.sizes.map((s, idx) => {
                    const sName = s.size_name || s.size || s;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(sName)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: selectedSize === sName ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                          background: selectedSize === sName ? 'var(--primary-light)' : '#fff',
                          color: selectedSize === sName ? 'var(--primary)' : 'var(--text-dark)',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        {sName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Add to Cart */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border-light)', borderRadius: '10px', overflow: 'hidden' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: '36px', height: '42px', fontSize: '1rem', background: 'var(--bg-alt)' }}
                >
                  -
                </button>
                <span style={{ width: '36px', textAlign: 'center', fontWeight: 700 }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ width: '36px', height: '42px', fontSize: '1rem', background: 'var(--bg-alt)' }}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  height: '42px',
                  background: isOutOfStock ? '#94A3B8' : undefined,
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                }}
              >
                <ShoppingBag size={18} /> {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`btn btn-outline ${inWishlist ? 'active' : ''}`}
                style={{ width: '42px', height: '42px', padding: 0, borderRadius: '10px', color: inWishlist ? 'var(--primary)' : 'inherit' }}
                title="Wishlist"
              >
                <Heart size={18} fill={inWishlist ? 'var(--primary)' : 'none'} />
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <Link
                to={`/product/${product.slug || product.id}`}
                onClick={onClose}
                style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}
              >
                View Full Product Details & Sizing Guide &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
