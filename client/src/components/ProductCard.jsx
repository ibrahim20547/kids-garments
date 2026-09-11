import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star, Check } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatPKR } from '../utils/currency';
import { handleImageError } from '../utils/imageUtils';

export default function ProductCard({ product, onQuickView }) {
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [addedTemp, setAddedTemp] = useState(false);

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const currentPrice = product.on_sale && product.sale_price ? product.sale_price : product.price;
  const secondaryImage = product.images && product.images.length > 1 ? product.images[1] : product.main_image;
  const isOutOfStock = product.stock_quantity <= 0;
  const rating = product.rating || 4.9;
  const reviewsCount = product.reviews_count || 12;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    const defaultSize = product.sizes && product.sizes.length > 0 ? (product.sizes[0].size_name || product.sizes[0].size) : 'Standard';
    const defaultColor = product.colors && product.colors.length > 0 ? (product.colors[0].color_name || product.colors[0].name) : 'Standard';
    addToCart(product, defaultSize, defaultColor, 1);
    setAddedTemp(true);
    setTimeout(() => setAddedTemp(false), 1800);
  };

  const handleViewDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product.slug || product.id}`);
  };

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        boxShadow: isHovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        position: 'relative'
      }}
    >
      {/* 1. Image Container */}
      <div
        className="product-card-image-wrap"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4/5',
          backgroundColor: '#F7F5F0',
          overflow: 'hidden'
        }}
      >
        <Link to={`/product/${product.slug || product.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
          <img
            src={isHovered && secondaryImage ? secondaryImage : product.main_image}
            alt={product.name}
            loading="lazy"
            onError={(e) => handleImageError(e, product.gender || 'Boys')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)'
            }}
          />
        </Link>

        {/* Badges */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '5px', zIndex: 2 }}>
          {isOutOfStock ? (
            <span className="badge badge-stock" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>Sold Out</span>
          ) : product.on_sale === 1 ? (
            <span className="badge badge-sale" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
              {product.price && product.sale_price 
                ? `-${Math.round(((product.price - product.sale_price) / product.price) * 100)}%` 
                : 'Sale'}
            </span>
          ) : product.is_new === 1 ? (
            <span className="badge badge-new" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>New</span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-label="Wishlist"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: inWishlist ? 'var(--accent-terracotta)' : 'var(--text-main)',
            border: 'none',
            zIndex: 2,
            transition: 'var(--transition-fast)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
          }}
        >
          <Heart size={15} fill={inWishlist ? 'currentColor' : 'none'} strokeWidth={1.8} />
        </button>

        {/* Quick View Hover Button */}
        {onQuickView && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              right: '10px',
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateY(0)' : 'translateY(8px)',
              transition: 'all 0.2s ease',
              zIndex: 2
            }}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(6px)',
                color: 'var(--text-main)',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
              }}
            >
              <Eye size={13} /> Quick View
            </button>
          </div>
        )}
      </div>

      {/* 2. Product Info Body */}
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Category & Rating Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
            fontWeight: 600
          }}>
            {product.gender || 'Kids'} • {product.category_name || (product.gender === 'Girls' ? 'Girls Wear' : product.gender === 'Baby' ? 'Baby Care' : 'Boys Wear')}
          </span>

          {/* Star Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: '#F59E0B' }}>
            <Star size={12} fill="#F59E0B" strokeWidth={0} />
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{rating}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>({reviewsCount})</span>
          </div>
        </div>

        {/* Product Title */}
        <Link to={`/product/${product.slug || product.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.94rem',
            fontWeight: 600,
            color: 'var(--text-main)',
            lineHeight: 1.35,
            marginBottom: '6px',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }} title={product.name}>
            {product.name}
          </h3>
        </Link>

        {/* Short Description */}
        <p style={{
          fontSize: '0.78rem',
          color: 'var(--text-body)',
          lineHeight: 1.45,
          marginBottom: '10px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {product.description || 'Crafted from 100% breathable organic cotton, gentle on sensitive skin for all-day comfort.'}
        </p>

        {/* Price Row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px', marginTop: 'auto' }}>
          <span style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: product.on_sale ? 'var(--accent-terracotta)' : 'var(--text-main)'
          }}>
            {formatPKR(currentPrice)}
          </span>
          {product.on_sale === 1 && product.sale_price && product.price > product.sale_price && (
            <span style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              textDecoration: 'line-through'
            }}>
              {formatPKR(product.price)}
            </span>
          )}
        </div>

        {/* Dual Action Buttons: Add to Cart & View Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
          {/* Add to Cart Button */}
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            style={{
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: addedTemp ? 'var(--accent-sage)' : isOutOfStock ? '#F3F4F6' : 'var(--primary)',
              color: isOutOfStock ? '#9CA3AF' : '#FFFFFF',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'all 0.2s ease',
              cursor: isOutOfStock ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isOutOfStock && !addedTemp) e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
            }}
            onMouseLeave={(e) => {
              if (!isOutOfStock && !addedTemp) e.currentTarget.style.backgroundColor = 'var(--primary)';
            }}
          >
            {addedTemp ? (
              <>
                <Check size={13} strokeWidth={2.5} /> Added
              </>
            ) : (
              <>
                <ShoppingBag size={13} /> Add to Cart
              </>
            )}
          </button>

          {/* View Details Button */}
          <button
            onClick={handleViewDetails}
            style={{
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-alt)';
              e.currentTarget.style.borderColor = 'var(--text-main)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
