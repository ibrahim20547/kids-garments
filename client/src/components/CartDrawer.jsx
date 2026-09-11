import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPKR } from '../utils/currency';
import { handleImageError } from '../utils/imageUtils';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    items,
    itemCount,
    subtotal,
    discountAmount,
    shippingFee,
    totalAmount,
    coupon,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const freeShippingThreshold = 3000.0;
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setIsApplyingCoupon(true);
    await applyCoupon(couponCodeInput.trim().toUpperCase());
    setIsApplyingCoupon(false);
    setCouponCodeInput('');
  };

  const handleProceedToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div
      className="cart-drawer-overlay"
      onClick={closeCart}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
        transition: 'opacity 0.3s ease'
      }}
    >
      <div
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Your Bag ({itemCount})</h3>
          </div>
          <button onClick={closeCart} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Close cart drawer">
            <X size={22} />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div style={{ padding: '12px 24px', background: 'var(--primary-light)', borderBottom: '1px solid #FFE0E6' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px' }}>
            {subtotal >= freeShippingThreshold || (coupon && coupon.code === 'FREESHIP') ? (
              <span style={{ color: 'var(--accent-mint)', fontWeight: 700 }}>
                🎉 You qualified for FREE Nationwide Delivery!
              </span>
            ) : (
              <span>
                Add <strong>{formatPKR(amountNeeded)}</strong> more for <strong>FREE Delivery</strong>
              </span>
            )}
          </div>
          <div style={{ width: '100%', height: '6px', background: '#FFFFFF', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent-mint) 100%)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>

        {/* Line Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-alt)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={32} />
              </div>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: '6px' }}>Your Bag is Empty</h4>
              <p style={{ fontSize: '0.88rem', marginBottom: '20px' }}>Explore our joyful collection for boys, girls, and babies!</p>
              <button
                onClick={() => { closeCart(); navigate('/shop'); }}
                className="btn btn-primary btn-sm"
              >
                Start Shopping &rarr;
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '14px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid var(--border-light)'
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  onError={(e) => handleImageError(e, item.gender || 'Kids')}
                  style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '12px', flexShrink: 0 }}
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '2px' }}>
                        {item.name}
                      </h4>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Size: <strong>{item.size}</strong> • Color: <strong>{item.color}</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{ color: '#94A3B8', padding: '2px', background: 'none', border: 'none', cursor: 'pointer' }}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden' }}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{ width: '26px', height: '26px', fontSize: '0.9rem', background: 'var(--bg-alt)', border: 'none', cursor: 'pointer' }}
                      >
                        -
                      </button>
                      <span style={{ width: '28px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{ width: '26px', height: '26px', fontSize: '0.9rem', background: 'var(--bg-alt)', border: 'none', cursor: 'pointer' }}
                      >
                        +
                      </button>
                    </div>

                    <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                      {formatPKR(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Coupon & Checkout */}
        {items.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-light)', background: 'var(--bg-alt)' }}>
            {/* Coupon Code Input */}
            {coupon ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: '#EBF9EE',
                  border: '1px dashed #6BCB77',
                  borderRadius: '10px',
                  marginBottom: '14px',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#27AE60', fontWeight: 600 }}>
                  <Tag size={16} /> Coupon <strong>{coupon.code}</strong> applied (-{formatPKR(discountAmount)})
                </div>
                <button onClick={removeCoupon} style={{ color: '#E74C3C', fontSize: '0.8rem', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <input
                  type="text"
                  placeholder="Promo code (e.g. KIDS10)"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: '#FFFFFF',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase'
                  }}
                />
                <button
                  type="submit"
                  disabled={isApplyingCoupon}
                  className="btn btn-outline btn-sm"
                  style={{ borderRadius: '8px' }}
                >
                  Apply
                </button>
              </form>
            )}

            {/* Calculations Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-body)' }}>
                <span>Subtotal</span>
                <span>{formatPKR(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', fontWeight: 600 }}>
                  <span>Discount</span>
                  <span>-{formatPKR(discountAmount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-body)' }}>
                <span>Delivery Charges</span>
                <span>{shippingFee === 0 ? <strong style={{ color: 'var(--accent-mint)' }}>FREE</strong> : formatPKR(shippingFee)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  fontSize: '1.15rem',
                  color: 'var(--text-dark)',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--border-light)'
                }}
              >
                <span>Estimated Total</span>
                <span>{formatPKR(totalAmount)}</span>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleProceedToCheckout}
                className="btn btn-primary"
                style={{ width: '100%', height: '48px', fontSize: '1rem' }}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>
              <Link
                to="/cart"
                onClick={closeCart}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', textAlign: 'center', background: '#FFFFFF' }}
              >
                View Full Cart Details
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
