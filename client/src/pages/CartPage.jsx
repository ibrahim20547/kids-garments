import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, Tag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPKR } from '../utils/currency';
import { handleImageError } from '../utils/imageUtils';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    itemCount,
    subtotal,
    discountAmount,
    shippingFee,
    totalAmount,
    coupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const freeShippingThreshold = 3000.0;
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApply = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    await applyCoupon(couponInput.trim().toUpperCase());
    setIsApplying(false);
    setCouponInput('');
  };

  if (items.length === 0) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{ maxWidth: '480px', margin: '0 auto', background: '#FFFFFF', padding: '48px 32px', borderRadius: '24px', border: '1px solid var(--border-light)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <ShoppingBag size={40} />
            </div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Your Cart is Empty</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '28px', lineHeight: '1.6' }}>
              Looks like you haven't added any soft cotton garments yet. Check out our latest seasonal collections for boys, girls, and babies!
            </p>
            <Link to="/shop" className="btn btn-primary" style={{ display: 'inline-flex', padding: '14px 28px' }}>
              Explore Collection &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.4rem', marginBottom: '8px' }}>Shopping Cart ({itemCount} items)</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Review your selected garments before proceeding to secure checkout</p>

        {/* Free Shipping Alert */}
        <div style={{ padding: '16px 20px', background: 'var(--primary-light)', borderRadius: '16px', marginBottom: '32px', border: '1px solid #FFD0D9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-dark)' }}>
              {subtotal >= freeShippingThreshold || (coupon && coupon.code === 'FREESHIP') ? (
                <span style={{ color: 'var(--accent-mint)' }}>🎉 You have qualified for FREE Nationwide Delivery!</span>
              ) : (
                <span>Add <strong>{formatPKR(amountNeeded)}</strong> more to get <strong>FREE Nationwide Delivery</strong></span>
              )}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>{progressPercent}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#FFFFFF', borderRadius: '4px', overflow: 'hidden' }}>
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

        {/* 2-Column Cart Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'flex-start' }} className="cart-layout">
          {/* Column 1: Items Table / List */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1.5px solid var(--border-light)', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Selected Garments</h3>
              <button onClick={clearCart} style={{ fontSize: '0.85rem', color: '#EE5253', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                Clear Entire Bag
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: '20px',
                    paddingBottom: '20px',
                    borderBottom: '1px solid var(--border-light)',
                    alignItems: 'center'
                  }}
                  className="cart-item-row"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(e) => handleImageError(e, item.gender || 'Kids')}
                    style={{ width: '90px', height: '108px', objectFit: 'cover', borderRadius: '12px', background: 'var(--bg-alt)' }}
                  />

                  <div style={{ flex: 1 }}>
                    <Link to={`/product/${item.slug || item.product_id}`} style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-dark)', textDecoration: 'none' }}>
                      {item.name}
                    </Link>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', margin: '6px 0 12px' }}>
                      <span>Size: <strong style={{ color: 'var(--text-dark)' }}>{item.size}</strong></span>
                      <span>•</span>
                      <span>Color: <strong style={{ color: 'var(--text-dark)' }}>{item.color}</strong></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {/* Quantity Stepper */}
                      <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border-light)', borderRadius: '10px', background: '#FFFFFF', overflow: 'hidden' }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{ width: '32px', height: '32px', background: 'var(--bg-alt)', fontSize: '0.9rem', border: 'none', cursor: 'pointer' }}
                        >
                          -
                        </button>
                        <span style={{ width: '36px', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{ width: '32px', height: '32px', background: 'var(--bg-alt)', fontSize: '0.9rem', border: 'none', cursor: 'pointer' }}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <Trash2 size={15} /> Remove
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                      {formatPKR(item.price * item.quantity)}
                    </div>
                    {item.quantity > 1 && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {formatPKR(item.price)} each
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--secondary)' }}>
                <ArrowLeft size={16} /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Column 2: Order Summary & Checkout */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Coupon Box */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>Have a Promo Coupon?</h3>
              {coupon ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: '#EBF9EE',
                    border: '1.5px dashed #6BCB77',
                    borderRadius: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#27AE60', fontWeight: 700, fontSize: '0.9rem' }}>
                    <Tag size={18} /> Coupon {coupon.code} (-{formatPKR(discountAmount)})
                  </div>
                  <button onClick={removeCoupon} style={{ color: '#E74C3C', fontWeight: 700, fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApply} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="e.g. KIDS10, FIRSTBUY"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--border-light)',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase'
                    }}
                  />
                  <button type="submit" disabled={isApplying} className="btn btn-outline btn-sm">
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Order Cost Breakdown */}
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Order Summary</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-body)' }}>
                  <span>Subtotal ({itemCount} items)</span>
                  <span style={{ fontWeight: 600 }}>{formatPKR(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', fontWeight: 700 }}>
                    <span>Coupon Discount</span>
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
                    alignItems: 'baseline',
                    paddingTop: '16px',
                    borderTop: '2px solid var(--border-light)',
                    marginTop: '8px'
                  }}
                >
                  <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Total Due</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                    {formatPKR(totalAmount)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn btn-primary"
                style={{ width: '100%', height: '52px', fontSize: '1.05rem', marginTop: '24px' }}
              >
                Proceed to Checkout <ArrowRight size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={16} color="var(--accent-mint)" /> Cash on Delivery Available Across Pakistan
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .cart-layout { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 540px) {
          .cart-item-row { flex-direction: column; align-items: flex-start !important; }
        }
      `}</style>
    </div>
  );
}
