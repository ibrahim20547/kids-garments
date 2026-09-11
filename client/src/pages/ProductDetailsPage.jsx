import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RefreshCw,
  Ruler,
  Check,
  Send,
  Sparkles,
  ArrowRight,
  Zap
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPKR } from '../utils/currency';
import { handleImageError } from '../utils/imageUtils';
import ProductCard from '../components/ProductCard';
import SizeGuideModal from '../components/SizeGuideModal';
import StockNotificationModal from '../components/StockNotificationModal';
import RecentlyViewedProducts, { trackRecentlyViewed } from '../components/RecentlyViewedProducts';

export default function ProductDetailsPage() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showStockNotify, setShowStockNotify] = useState(false);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await api.getProduct(idOrSlug);
        const p = data.product;
        setProduct(p);
        setSelectedImage(p.main_image);
        if (p.sizes && p.sizes.length > 0) setSelectedSize(p.sizes[0].size_name);
        if (p.colors && p.colors.length > 0) setSelectedColor(p.colors[0].color_name);
        if (user) {
          setReviewerName(user.full_name);
          setReviewerEmail(user.email);
        }
        trackRecentlyViewed(p);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
    window.scrollTo(0, 0);
  }, [idOrSlug, user]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <h2>Loading garment details...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h2>Garment not found</h2>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Return to Shop
        </Link>
      </div>
    );
  }

  const currentPrice = product.on_sale && product.sale_price ? product.sale_price : product.price;
  const inWishlist = isInWishlist(product.id);
  const images = product.images && product.images.length > 0 ? product.images : [product.main_image];

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) {
      error('Please provide your name and review feedback.');
      return;
    }

    try {
      setIsSubmittingReview(true);
      const res = await api.submitReview(product.id, {
        rating: reviewRating,
        reviewer_name: reviewerName,
        reviewer_email: reviewerEmail,
        title: reviewTitle,
        comment: reviewComment
      });
      success('Thank you! Your verified review has been published.');
      // Refresh reviews
      const updated = await api.getProduct(product.id);
      setProduct(updated.product);
      setReviewComment('');
      setReviewTitle('');
    } catch (err) {
      error(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '28px' }}>
          <Link to="/" style={{ color: 'var(--text-body)' }}>Home</Link>
          <span>/</span>
          <Link to={`/${product.gender.toLowerCase()}`} style={{ color: 'var(--text-body)' }}>{product.gender}</Link>
          <span>/</span>
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{product.name}</span>
        </div>

        {/* Top 2-Column Product Detail Showcase */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '48px', alignItems: 'flex-start' }}>
          {/* Column 1: Multi-Image Gallery */}
          <div>
            <div
              style={{
                width: '100%',
                borderRadius: '24px',
                overflow: 'hidden',
                background: '#FFFFFF',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '16px'
              }}
            >
              <img
                src={selectedImage}
                alt={product.name}
                onError={(e) => handleImageError(e, product.gender)}
                style={{ width: '100%', height: '520px', objectFit: 'cover' }}
              />
            </div>

            {/* Gallery Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '12px' }}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: selectedImage === img ? '2.5px solid var(--primary)' : '1px solid var(--border-light)',
                      boxShadow: selectedImage === img ? 'var(--shadow-sm)' : 'none',
                      cursor: 'pointer',
                      padding: 0,
                      background: 'none'
                    }}
                  >
                    <img
                      src={img}
                      alt={`view-${i}`}
                      onError={(e) => handleImageError(e, product.gender)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Product Information & Purchase Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-pill">{product.gender}</span>
                <span className="badge badge-pill">{product.category_name}</span>
                {product.on_sale === 1 && <span className="badge badge-sale">SALE -{product.discount_percent}%</span>}
                {product.is_new === 1 && <span className="badge badge-new">NEW</span>}
              </div>

              <h1 style={{ fontSize: '2.2rem', lineHeight: '1.25', marginBottom: '10px' }}>{product.name}</h1>

              {/* Star Rating & SKU */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F39C12' }}>
                  <Star size={16} fill="#F39C12" />
                  <strong style={{ color: 'var(--text-dark)' }}>{product.rating ? product.rating.toFixed(1) : '5.0'}</strong>
                  <span>({product.reviews_count || 0} reviews)</span>
                </div>
                <span>•</span>
                <span>SKU: {product.sku}</span>
              </div>
            </div>

            {/* Price Section */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', padding: '16px 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: product.on_sale ? 'var(--primary)' : 'var(--text-dark)' }}>
                {formatPKR(currentPrice)}
              </span>
              {product.on_sale === 1 && product.sale_price && (
                <span style={{ fontSize: '1.25rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                  {formatPKR(product.price)}
                </span>
              )}
              {product.discount_percent > 0 && (
                <span className="badge badge-sale">Save {formatPKR(product.price - product.sale_price)}</span>
              )}
              <span style={{
                marginLeft: 'auto',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: product.stock_quantity <= 0 ? '#EF4444' : product.stock_quantity <= (product.low_stock_threshold || 5) ? '#EA580C' : 'var(--accent-mint)'
              }}>
                {product.stock_quantity <= 0 ? (
                  '✕ Out of Stock'
                ) : product.stock_quantity <= (product.low_stock_threshold || 5) ? (
                  `⚠️ Only ${product.stock_quantity} left in stock!`
                ) : (
                  `✓ In Stock (${product.stock_quantity} available)`
                )}
              </span>
            </div>

            {/* Description */}
            <p style={{ color: 'var(--text-body)', lineHeight: '1.7', fontSize: '0.98rem' }}>
              {product.description}
            </p>

            {/* Color Swatch Selector */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  Select Color: <span style={{ fontWeight: 500, color: 'var(--text-body)' }}>{selectedColor}</span>
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {product.colors.map((c) => (
                    <button
                      key={c.color_name}
                      onClick={() => setSelectedColor(c.color_name)}
                      title={c.color_name}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: c.color_hex,
                        border: selectedColor === c.color_name ? '3.5px solid var(--primary)' : '2px solid #FFFFFF',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector + Size Guide Modal Trigger */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                    Select Size: <span style={{ fontWeight: 500, color: 'var(--text-body)' }}>{selectedSize}</span>
                  </label>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}
                  >
                    <Ruler size={14} /> Size Chart Guide
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product.sizes.map((s) => (
                    <button
                      key={s.size_name}
                      onClick={() => setSelectedSize(s.size_name)}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '10px',
                        border: selectedSize === s.size_name ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                        background: selectedSize === s.size_name ? 'var(--primary-light)' : '#FFFFFF',
                        color: selectedSize === s.size_name ? 'var(--primary)' : 'var(--text-dark)',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    >
                      {s.size_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Buttons */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border-light)', borderRadius: '12px', background: '#FFFFFF', overflow: 'hidden' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: '42px', height: '48px', fontSize: '1.1rem', background: 'var(--bg-alt)' }}
                >
                  -
                </button>
                <span style={{ width: '46px', textAlign: 'center', fontWeight: 800, fontSize: '1rem' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ width: '42px', height: '48px', fontSize: '1.1rem', background: 'var(--bg-alt)' }}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  height: '48px',
                  background: product.stock_quantity <= 0 ? '#94A3B8' : undefined,
                  cursor: product.stock_quantity <= 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <ShoppingBag size={18} /> {product.stock_quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock_quantity <= 0}
                className="btn btn-secondary"
                style={{
                  flex: 1,
                  height: '48px',
                  opacity: product.stock_quantity <= 0 ? 0.6 : 1,
                  cursor: product.stock_quantity <= 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <Zap size={18} /> Buy Now
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`btn btn-outline ${inWishlist ? 'active' : ''}`}
                style={{ width: '48px', height: '48px', padding: 0, borderRadius: '12px', color: inWishlist ? 'var(--primary)' : 'inherit' }}
                title="Wishlist"
              >
                <Heart size={20} fill={inWishlist ? 'var(--primary)' : 'none'} />
              </button>
              {product.stock_quantity <= 0 && (
                <button
                  type="button"
                  onClick={() => setShowStockNotify(true)}
                  className="btn btn-soft"
                  style={{ width: '100%', marginTop: '6px', color: 'var(--primary)', borderColor: 'var(--primary-light)' }}
                >
                  <Sparkles size={16} /> Notify Me When In Stock
                </button>
              )}
            </div>

            {/* Value Props Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px', padding: '16px', background: 'var(--bg-alt)', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                <Truck size={16} color="var(--primary)" /> Free Ship ₨ 3,000+
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                <ShieldCheck size={16} color="var(--accent-mint)" /> 100% Organic
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                <RefreshCw size={16} color="var(--secondary)" /> 14-Day Exchange
              </div>
            </div>

            {/* Fabric & Care Specs */}
            {product.fabric_care && (
              <div style={{ marginTop: '10px', padding: '16px', border: '1px solid var(--border-light)', borderRadius: '14px' }}>
                <h4 style={{ fontSize: '0.92rem', marginBottom: '6px' }}>Fabric & Garment Care:</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{product.fabric_care}</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1.5px solid var(--border-light)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px' }}>
            {/* Left: Reviews List */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem' }}>Customer Reviews</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Verified parent ratings and experiences</p>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                    {product.rating ? product.rating.toFixed(1) : '5.0'}
                  </div>
                  <div style={{ display: 'flex', color: '#F39C12' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={15} fill={i < Math.floor(product.rating || 5) ? '#F39C12' : 'none'} />
                    ))}
                  </div>
                </div>
              </div>

              {product.reviews && product.reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {product.reviews.map((rev) => (
                    <div key={rev.id} className="card" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', color: '#F39C12', marginBottom: '4px' }}>
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} size={14} fill="#F39C12" />
                            ))}
                          </div>
                          <h4 style={{ fontSize: '0.95rem' }}>{rev.title || 'Verified Purchase'}</h4>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{rev.created_at?.substring(0, 10)}</span>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: '1.6' }}>{rev.comment}</p>
                      <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        — {rev.reviewer_name || rev.user_name || 'Verified Customer'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No customer reviews yet. Be the first parent to share your feedback!
                </div>
              )}
            </div>

            {/* Right: Write a Review Form */}
            <div className="card" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>Write a Review</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Share your thoughts with other parents
              </p>

              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="form-label">Your Rating</label>
                  <div style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        style={{ color: star <= reviewRating ? '#F39C12' : '#CBD5E1' }}
                      >
                        <Star size={24} fill={star <= reviewRating ? '#F39C12' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Review Headline</label>
                  <input
                    type="text"
                    placeholder="e.g. Incredibly soft fabric & great fit!"
                    className="form-control"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Your Experience *</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about the fit, quality, washing durability..."
                    className="form-control"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Your Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ayesha M."
                      className="form-control"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Your Email</label>
                    <input
                      type="email"
                      placeholder="ayesha@example.com"
                      className="form-control"
                      value={reviewerEmail}
                      onChange={(e) => setReviewerEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="btn btn-primary"
                  style={{ marginTop: '10px' }}
                >
                  <Send size={16} /> Submit Review
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Related Products Section */}
        {product.related_products && product.related_products.length > 0 && (
          <section style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1.5px solid var(--border-light)' }}>
            <div style={{ marginBottom: '32px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                Complete the Look
              </span>
              <h2 style={{ fontSize: '2rem', marginTop: '4px' }}>You Might Also Love</h2>
            </div>
            <div className="product-grid">
              {product.related_products.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed Products Carousel */}
        <RecentlyViewedProducts currentProductId={product.id} />
      </div>

      {/* Size Guide Chart & Recommender Modal */}
      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        availableSizes={product.sizes || []}
        onSelectSize={(sz) => setSelectedSize(sz)}
      />

      {/* Stock Notification Modal */}
      <StockNotificationModal
        isOpen={showStockNotify}
        onClose={() => setShowStockNotify(false)}
        product={product}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
      />
    </div>
  );
}
