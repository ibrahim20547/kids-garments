import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Truck,
  RefreshCw,
  Sparkles,
  Leaf,
  Award,
  Check,
  Star,
  Sun,
  Snowflake
} from 'lucide-react';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductQuickViewModal from '../components/ProductQuickViewModal';
import { handleImageError } from '../utils/imageUtils';

export default function HomePage() {
  const [allProducts, setAllProducts] = useState([]);
  const [boysProducts, setBoysProducts] = useState([]);
  const [girlsProducts, setGirlsProducts] = useState([]);
  const [babyProducts, setBabyProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [seasonalSeason, setSeasonalSeason] = useState('summer'); // 'summer' or 'winter'
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Hero Slider State
  const [heroSlide, setHeroSlide] = useState(0);

  const heroSlides = [
    {
      badge: "Pure Organic Children's Fashion",
      title: "Style Made for Little Ones",
      subtitle: "Discover comfortable, stylish and adorable clothing for boys and girls.",
      image: "/images/boys-stylish-fashion.jpg",
      primaryCta: { text: "Shop Boys", link: "/boys" },
      secondaryCta: { text: "Shop Girls", link: "/girls" },
      tertiaryCta: { text: "Explore Collection", link: "/shop" },
      genderTag: "Boys"
    },
    {
      badge: "Festive & Summer Lawn Collection",
      title: "Charming & Gentle Girls Wear",
      subtitle: "Soft breathable lawn frocks, floral tiered sundresses, and festive celebration suits.",
      image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=1000&auto=format&fit=crop&q=80",
      primaryCta: { text: "Shop Girls", link: "/girls" },
      secondaryCta: { text: "Shop Boys", link: "/boys" },
      tertiaryCta: { text: "Explore Collection", link: "/shop" },
      genderTag: "Girls"
    },
    {
      badge: "Hypoallergenic Newborn Essentials",
      title: "Tender Care for Babies & Toddlers",
      subtitle: "100% GOTS certified organic cotton rompers, 2-way zip sleepsuits, and cute dungarees.",
      image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=1000&auto=format&fit=crop&q=80",
      primaryCta: { text: "Shop Baby", link: "/baby" },
      secondaryCta: { text: "Explore Collection", link: "/shop" },
      tertiaryCta: null,
      genderTag: "Baby"
    }
  ];

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [allRes, boysRes, girlsRes, babyRes, newRes] = await Promise.all([
          api.getProducts({ limit: 30 }),
          api.getProducts({ gender: 'Boys', limit: 8 }),
          api.getProducts({ gender: 'Girls', limit: 8 }),
          api.getProducts({ gender: 'Baby', limit: 8 }),
          api.getProducts({ is_new: 'true', limit: 8 })
        ]);

        const prods = allRes.products || [];
        setAllProducts(prods);
        setBoysProducts(boysRes.products || prods.filter(p => p.gender === 'Boys').slice(0, 4));
        setGirlsProducts(girlsRes.products || prods.filter(p => p.gender === 'Girls').slice(0, 4));
        setBabyProducts(babyRes.products || prods.filter(p => p.gender === 'Baby').slice(0, 4));
        setNewArrivals(newRes.products || prods.slice(0, 8));
        
        // Best sellers: high rating / reviews
        const topRated = [...prods].sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0)).slice(0, 8);
        setBestSellers(topRated);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  // Automatic hero slider cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setTimeout(() => setNewsletterSubscribed(false), 4000);
      setNewsletterEmail('');
    }
  };

  const currentSlide = heroSlides[heroSlide];

  // Seasonal items filtering
  const seasonalProducts = seasonalSeason === 'summer'
    ? allProducts.filter(p => p.name.toLowerCase().includes('summer') || p.name.toLowerCase().includes('cotton') || p.name.toLowerCase().includes('polo') || p.name.toLowerCase().includes('sundress')).slice(0, 4)
    : allProducts.filter(p => p.name.toLowerCase().includes('winter') || p.name.toLowerCase().includes('jacket') || p.name.toLowerCase().includes('cardigan') || p.name.toLowerCase().includes('flannel') || p.name.toLowerCase().includes('puffer')).slice(0, 4);

  return (
    <div style={{ backgroundColor: 'var(--bg-page)' }}>
      {/* ===================================================
          1. HERO BANNER / SLIDER SECTION
          =================================================== */}
      <section style={{
        position: 'relative',
        backgroundColor: '#F5F2EB',
        borderBottom: '1px solid var(--border-subtle)',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ padding: '40px 24px 60px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: '40px'
          }}>
            {/* Hero Text Left */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(28, 29, 31, 0.06)',
                color: 'var(--accent-terracotta)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                marginBottom: '16px',
                textTransform: 'uppercase'
              }}>
                <Sparkles size={14} /> {currentSlide.badge}
              </div>

              <h1 style={{
                fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
                lineHeight: 1.15,
                color: 'var(--text-main)',
                marginBottom: '18px',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700
              }}>
                {currentSlide.title}
              </h1>

              <p style={{
                fontSize: '1.08rem',
                color: 'var(--text-body)',
                lineHeight: 1.7,
                maxWidth: '520px',
                marginBottom: '32px'
              }}>
                {currentSlide.subtitle}
              </p>

              {/* Action Buttons: Shop Boys, Shop Girls, Explore Collection */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link to="/boys" className="btn btn-primary btn-lg" style={{ padding: '14px 26px' }}>
                  Shop Boys <ArrowRight size={17} />
                </Link>
                <Link to="/girls" className="btn btn-secondary btn-lg" style={{ padding: '14px 26px' }}>
                  Shop Girls
                </Link>
                <Link to="/shop" style={{
                  padding: '14px 20px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px'
                }}>
                  Explore Collection
                </Link>
              </div>

              {/* Highlights */}
              <div style={{
                display: 'flex',
                gap: '24px',
                marginTop: '40px',
                paddingTop: '24px',
                borderTop: '1px solid var(--border-color)',
                flexWrap: 'wrap'
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)' }}>100%</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Organic Cotton</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)' }}>Tagless</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ultra-Soft Fitting</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)' }}>Nationwide</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Doorstep COD</div>
                </div>
              </div>
            </div>

            {/* Hero Image Right */}
            <div style={{ position: 'relative' }}>
              <div style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                backgroundColor: '#EBE5D8',
                aspectRatio: '4/5',
                maxHeight: '520px',
                boxShadow: 'var(--shadow-lg)',
                border: '5px solid #FFFFFF',
                position: 'relative'
              }}>
                <img
                  key={currentSlide.image}
                  src={currentSlide.image}
                  alt={currentSlide.title}
                  onError={(e) => handleImageError(e, currentSlide.genderTag)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'opacity 0.5s ease-in-out'
                  }}
                />

                {/* Floating Tag */}
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(6px)',
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-terracotta)' }} />
                  <div>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Featured Look
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Pakistani Children's Wardrobe
                    </div>
                  </div>
                </div>
              </div>

              {/* Slider Controls */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '16px'
              }}>
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroSlide(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    style={{
                      width: heroSlide === idx ? '28px' : '10px',
                      height: '8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: heroSlide === idx ? 'var(--primary)' : '#D1C9B8',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          2. SHOP BY CATEGORY SECTION
          =================================================== */}
      <section style={{ padding: '70px 0 50px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
            <span className="subheading">Children's Wardrobe</span>
            <h2 style={{ fontSize: '2.3rem', marginTop: '4px', marginBottom: '10px' }}>
              Shop by Category
            </h2>
            <p style={{ color: 'var(--text-body)', fontSize: '0.96rem' }}>
              Explore dedicated collections created exclusively for boys, girls, babies, and festive occasions.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {/* 1. Boys */}
            <Link to="/boys" className="category-card" style={categoryCardStyle}>
              <div style={{ width: '100%', aspectRatio: '4/5', overflow: 'hidden', backgroundColor: '#EDE8DF' }}>
                <img
                  src="/images/boys-stylish-fashion.jpg"
                  alt="Boys clothing collection"
                  onError={(e) => handleImageError(e, 'Boys')}
                  style={categoryImgStyle}
                />
              </div>
              <div style={{ padding: '18px 20px', backgroundColor: '#FFFFFF' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                  Ages 1 - 14 Years
                </span>
                <h3 style={{ fontSize: '1.25rem', margin: '4px 0 6px', color: 'var(--text-main)' }}>
                  Boys Clothing
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 600, color: 'var(--accent-terracotta)' }}>
                  Shop Boys <ArrowRight size={14} />
                </div>
              </div>
            </Link>

            {/* 2. Girls */}
            <Link to="/girls" className="category-card" style={categoryCardStyle}>
              <div style={{ width: '100%', aspectRatio: '4/5', overflow: 'hidden', backgroundColor: '#EDE8DF' }}>
                <img
                  src="https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&auto=format&fit=crop&q=80"
                  alt="Girls dresses and outfits"
                  onError={(e) => handleImageError(e, 'Girls')}
                  style={categoryImgStyle}
                />
              </div>
              <div style={{ padding: '18px 20px', backgroundColor: '#FFFFFF' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                  Ages 1 - 14 Years
                </span>
                <h3 style={{ fontSize: '1.25rem', margin: '4px 0 6px', color: 'var(--text-main)' }}>
                  Girls Clothing
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 600, color: 'var(--accent-terracotta)' }}>
                  Shop Girls <ArrowRight size={14} />
                </div>
              </div>
            </Link>

            {/* 3. Baby & Toddler */}
            <Link to="/baby" className="category-card" style={categoryCardStyle}>
              <div style={{ width: '100%', aspectRatio: '4/5', overflow: 'hidden', backgroundColor: '#EDE8DF' }}>
                <img
                  src="https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&auto=format&fit=crop&q=80"
                  alt="Baby and toddler clothing"
                  onError={(e) => handleImageError(e, 'Baby')}
                  style={categoryImgStyle}
                />
              </div>
              <div style={{ padding: '18px 20px', backgroundColor: '#FFFFFF' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                  Ages 0 - 24 Months
                </span>
                <h3 style={{ fontSize: '1.25rem', margin: '4px 0 6px', color: 'var(--text-main)' }}>
                  Baby & Toddler
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 600, color: 'var(--accent-terracotta)' }}>
                  Shop Baby <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ===================================================
          3. BOYS COLLECTION DEDICATED SECTION
          =================================================== */}
      <section style={{ padding: '50px 0 60px', backgroundColor: '#F4F0E6', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="subheading">Active & Smart</span>
              <h2 style={{ fontSize: '2.2rem', marginTop: '4px' }}>
                Boys Collection
              </h2>
              <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', marginTop: '4px' }}>
                T-shirts, button-down shirts, jeans, chinos, jackets, and traditional Eid kurtas.
              </p>
            </div>
            <Link to="/boys" className="btn btn-secondary btn-sm" style={{ fontWeight: 600 }}>
              View All Boys ({boysProducts.length * 2}+) <ArrowRight size={15} />
            </Link>
          </div>

          <div className="product-grid">
            {boysProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================
          4. GIRLS COLLECTION DEDICATED SECTION
          =================================================== */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="subheading">Charming & Graceful</span>
              <h2 style={{ fontSize: '2.2rem', marginTop: '4px' }}>
                Girls Collection
              </h2>
              <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', marginTop: '4px' }}>
                Floral dresses, frocks, peplum tops, twirl skirts, party wear, and lawn kurtis.
              </p>
            </div>
            <Link to="/girls" className="btn btn-secondary btn-sm" style={{ fontWeight: 600 }}>
              View All Girls ({girlsProducts.length * 2}+) <ArrowRight size={15} />
            </Link>
          </div>

          <div className="product-grid">
            {girlsProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================
          5. BABY & TODDLER COLLECTION DEDICATED SECTION
          =================================================== */}
      <section style={{ padding: '50px 0 60px', backgroundColor: '#F9F7F1', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="subheading">Pure & Gentle Essentials</span>
              <h2 style={{ fontSize: '2.2rem', marginTop: '4px' }}>
                Baby & Toddler Collection
              </h2>
              <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', marginTop: '4px' }}>
                Hypoallergenic zip rompers, baby layettes, knit sets, and comfortable everyday toddler dungarees.
              </p>
            </div>
            <Link to="/baby" className="btn btn-secondary btn-sm" style={{ fontWeight: 600 }}>
              View All Baby ({babyProducts.length * 2}+) <ArrowRight size={15} />
            </Link>
          </div>

          <div className="product-grid">
            {babyProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================
          6. NEW ARRIVALS GRID
          =================================================== */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="subheading">Just In</span>
              <h2 style={{ fontSize: '2.2rem', marginTop: '4px' }}>
                New Arrivals
              </h2>
              <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', marginTop: '4px' }}>
                Fresh styles and comfortable cuts newly added to our Pakistani children's catalog.
              </p>
            </div>
            <Link to="/shop?sort=newest" className="btn btn-secondary btn-sm">
              Explore All New Arrivals <ArrowRight size={15} />
            </Link>
          </div>

          <div className="product-grid">
            {newArrivals.slice(0, 4).map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================
          7. BEST SELLERS GRID
          =================================================== */}
      <section style={{ padding: '50px 0 60px', backgroundColor: '#F5F1E8', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="subheading">Parent Favorites</span>
              <h2 style={{ fontSize: '2.2rem', marginTop: '4px' }}>
                Best Sellers
              </h2>
              <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', marginTop: '4px' }}>
                Our highest-rated, most loved garments across Pakistan.
              </p>
            </div>
            <Link to="/shop?sort=popular" className="btn btn-secondary btn-sm">
              View All Best Sellers <ArrowRight size={15} />
            </Link>
          </div>

          <div className="product-grid">
            {bestSellers.slice(0, 4).map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================
          8. SEASONAL COLLECTION (SUMMER / WINTER)
          =================================================== */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="subheading">Weather Ready</span>
              <h2 style={{ fontSize: '2.2rem', marginTop: '4px' }}>
                Seasonal Collection
              </h2>
              <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', marginTop: '4px' }}>
                Switch between breathable breezy summer cottons and warm cozy winter essentials.
              </p>
            </div>

            {/* Season Switcher */}
            <div style={{
              display: 'flex',
              gap: '6px',
              backgroundColor: '#EBE6DA',
              padding: '4px',
              borderRadius: 'var(--radius-full)'
            }}>
              <button
                onClick={() => setSeasonalSeason('summer')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: seasonalSeason === 'summer' ? 'var(--primary)' : 'transparent',
                  color: seasonalSeason === 'summer' ? '#FFFFFF' : 'var(--text-main)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Sun size={15} /> Summer Collection
              </button>
              <button
                onClick={() => setSeasonalSeason('winter')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: seasonalSeason === 'winter' ? 'var(--primary)' : 'transparent',
                  color: seasonalSeason === 'winter' ? '#FFFFFF' : 'var(--text-main)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Snowflake size={15} /> Winter Collection
              </button>
            </div>
          </div>

          <div className="product-grid">
            {seasonalProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================
          9. PROMOTIONAL / FESTIVE BANNER
          =================================================== */}
      <section style={{ padding: '30px 0 60px' }}>
        <div className="container">
          <div style={{
            backgroundColor: '#1C1D1F',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ padding: '50px 40px' }}>
              <span style={{
                color: 'var(--accent-sand)',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                display: 'block',
                marginBottom: '12px'
              }}>
                Eid & Festive Celebration Lookbook
              </span>

              <h2 style={{
                color: '#FFFFFF',
                fontSize: 'clamp(1.9rem, 3.5vw, 2.6rem)',
                lineHeight: 1.2,
                marginBottom: '16px',
                fontFamily: 'var(--font-serif)'
              }}>
                Traditional Elegance for Little Princes & Princesses.
              </h2>

              <p style={{ color: '#D1CCC0', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '28px', maxWidth: '440px' }}>
                Handcrafted embroidery kurtas, delicate mirror-work ghararas, and comfortable cotton festive wear made for joyful family memories.
              </p>

              <Link
                to="/shop?search=Festive"
                className="btn"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#1C1D1F',
                  fontWeight: 600,
                  padding: '12px 24px'
                }}
              >
                Explore Festive Wear <ArrowRight size={16} />
              </Link>
            </div>

            <div style={{ height: '100%', minHeight: '340px', backgroundColor: '#2B2D31' }}>
              <img
                src="https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=900&auto=format&fit=crop&q=80"
                alt="Kids festive kurta and shalwar"
                onError={(e) => handleImageError(e, 'Eastern')}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          10. CUSTOMER REVIEWS (PAKISTANI PARENTS)
          =================================================== */}
      <section style={{ padding: '60px 0 70px', backgroundColor: '#FAF7F0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
            <span className="subheading">Loved by Parents</span>
            <h2 style={{ fontSize: '2.3rem', marginTop: '4px', marginBottom: '10px' }}>
              What Parents Say Across Pakistan
            </h2>
            <p style={{ color: 'var(--text-body)', fontSize: '0.95rem' }}>
              Trusted by thousands of Pakistani families for quality, comfort, and hassle-free doorstep delivery.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {/* Review 1 */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              padding: '28px 24px',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', gap: '3px', color: '#F59E0B', marginBottom: '14px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#F59E0B" strokeWidth={0} />
                ))}
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
                "Outstanding Quality & Pure Soft Cotton!"
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: '16px' }}>
                "Ordered the bomber jacket set for my 4-year-old son in Lahore. The stitching is impeccable and the fabric is genuinely 100% breathable organic cotton. Washes easily without fading!"
              </p>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Fatima Tariq <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>— Gulberg, Lahore</span>
              </div>
            </div>

            {/* Review 2 */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              padding: '28px 24px',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', gap: '3px', color: '#F59E0B', marginBottom: '14px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#F59E0B" strokeWidth={0} />
                ))}
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
                "Colors are vibrant & fits perfectly"
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: '16px' }}>
                "Delivery via TCS took just 2 days to Karachi. The size fitting is exact according to their age guide. My daughter loved her floral lawn dress!"
              </p>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Zainab Malik <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>— Clifton, Karachi</span>
              </div>
            </div>

            {/* Review 3 */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              padding: '28px 24px',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', gap: '3px', color: '#F59E0B', marginBottom: '14px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} fill="#F59E0B" strokeWidth={0} />
                ))}
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
                "Gentle on newborn sensitive skin"
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: '16px' }}>
                "The 2-way zip organic rompers make midnight diaper changes so convenient. No annoying tags scratching the baby. Highly recommend to all new parents!"
              </p>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Maryam Hassan <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>— F-7, Islamabad</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          11. STORE INFORMATION & NEWSLETTER
          =================================================== */}
      <section style={{ padding: '60px 0', backgroundColor: '#F5F2EB', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          {/* 4 Pillars */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '28px',
            marginBottom: '60px'
          }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={pillarIconStyle}><Leaf size={20} /></div>
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '4px', fontWeight: 700 }}>100% Organic Cotton</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
                  Hypoallergenic, soft fabrics selected specially for tender skin.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={pillarIconStyle}><Award size={20} /></div>
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '4px', fontWeight: 700 }}>Tagless & Durable</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
                  Smooth seams and reinforced stitching made for active playtime.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={pillarIconStyle}><Truck size={20} /></div>
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '4px', fontWeight: 700 }}>Nationwide Delivery</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
                  Express courier shipping with Cash on Delivery across Pakistan.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={pillarIconStyle}><RefreshCw size={20} /></div>
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '4px', fontWeight: 700 }}>14-Day Exchange</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
                  Hassle-free doorstep size exchanges if fitting is not perfect.
                </p>
              </div>
            </div>
          </div>

          {/* Newsletter Form */}
          <div style={{ textAlign: 'center', maxWidth: '580px', margin: '0 auto' }}>
            <span className="subheading">Stay in the Loop</span>
            <h2 style={{ fontSize: '2.1rem', marginTop: '4px', marginBottom: '10px' }}>
              Join the Kids Garments Family
            </h2>
            <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '24px' }}>
              Receive seasonal lookbooks, exclusive discounts, and children styling guides.
            </p>

            <form onSubmit={handleNewsletterSubmit} style={{
              display: 'flex',
              gap: '8px',
              maxWidth: '460px',
              margin: '0 auto',
              flexWrap: 'wrap'
            }}>
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                style={{
                  flex: 1,
                  minWidth: '220px',
                  padding: '13px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '13px 26px' }}>
                Subscribe
              </button>
            </form>

            {newsletterSubscribed && (
              <div style={{
                marginTop: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--accent-sage)',
                fontSize: '0.86rem',
                fontWeight: 600
              }}>
                <Check size={16} /> Thank you! Welcome to the Kids Garments family.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}

const categoryCardStyle = {
  position: 'relative',
  borderRadius: 'var(--radius-md)',
  overflow: 'hidden',
  textDecoration: 'none',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--border-subtle)',
  backgroundColor: '#FFFFFF'
};

const categoryImgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.5s ease'
};

const pillarIconStyle = {
  width: '42px',
  height: '42px',
  borderRadius: '50%',
  backgroundColor: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--primary)',
  flexShrink: 0,
  boxShadow: 'var(--shadow-sm)'
};
