import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Grid, List, Search, X } from 'lucide-react';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductQuickViewModal from '../components/ProductQuickViewModal';
import FilterSidebar from '../components/FilterSidebar';

export default function ShopPage({ defaultGender = null, pageTitle = 'Shop All Kids Garments', pageSubtitle = 'Browse our complete collection of comfortable, organic, and fashionable apparel.' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Filters state from URL query parameters
  const categoryParam = searchParams.get('category') || '';
  const genderParam = searchParams.get('gender') || defaultGender || '';
  const ageParam = searchParams.get('age_group') || '';
  const sizeParam = searchParams.get('size') || '';
  const colorParam = searchParams.get('color') || '';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const onSaleParam = searchParams.get('on_sale') === 'true';
  const minPriceParam = searchParams.get('min_price') || '';
  const maxPriceParam = searchParams.get('max_price') || '';

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [catsRes, prodsRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({
            category: categoryParam,
            gender: genderParam,
            age_group: ageParam,
            size: sizeParam,
            color: colorParam,
            search: searchParam,
            sort: sortParam,
            on_sale: onSaleParam ? 'true' : undefined,
            min_price: minPriceParam,
            max_price: maxPriceParam
          })
        ]);
        setCategories(catsRes.categories || []);
        setProducts(prodsRes.products || []);
      } catch (err) {
        console.error('Error fetching shop products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [categoryParam, genderParam, ageParam, sizeParam, colorParam, searchParam, sortParam, onSaleParam, minPriceParam, maxPriceParam]);

  const updateParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === undefined || value === null || value === '' || value === false) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    const nextParams = new URLSearchParams();
    if (defaultGender) nextParams.set('gender', defaultGender);
    setSearchParams(nextParams);
  };

  const activeFilterCount = [
    categoryParam,
    genderParam !== defaultGender ? genderParam : null,
    ageParam,
    sizeParam,
    colorParam,
    searchParam,
    onSaleParam ? 'sale' : null,
    minPriceParam || maxPriceParam ? 'price' : null
  ].filter(Boolean).length;

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header Title Bar */}
        <div style={{ marginBottom: '32px', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
            Catalogue
          </span>
          <h1 style={{ fontSize: '2.4rem', marginTop: '4px', marginBottom: '8px' }}>{pageTitle}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem' }}>{pageSubtitle}</p>
        </div>

        {/* Action Controls Bar (Mobile Filter trigger, Search result tag, Sorting Dropdown) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '28px',
            padding: '14px 20px',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid var(--border-light)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Mobile Filter Toggle */}
            <button
              className="btn btn-outline btn-sm mobile-filter-btn"
              onClick={() => setMobileFilterOpen(true)}
              style={{ display: 'none' }}
            >
              <Filter size={16} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>

            <span style={{ fontSize: '0.92rem', color: 'var(--text-body)', fontWeight: 600 }}>
              Showing <strong style={{ color: 'var(--text-dark)' }}>{products.length}</strong> products
            </span>

            {searchParam && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                Search: "{searchParam}"
                <X size={14} style={{ cursor: 'pointer' }} onClick={() => updateParam('search', '')} />
              </span>
            )}
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sort by:</span>
            <select
              value={sortParam}
              onChange={(e) => updateParam('sort', e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-alt)',
                fontWeight: 600,
                fontSize: '0.88rem',
                color: 'var(--text-dark)',
                cursor: 'pointer'
              }}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Main 2-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '36px', alignItems: 'flex-start' }} className="shop-layout">
          {/* Desktop Filter Sidebar */}
          <div className="desktop-sidebar card" style={{ padding: '24px', position: 'sticky', top: '100px' }}>
            <FilterSidebar
              categories={categories}
              selectedCategory={categoryParam}
              onSelectCategory={(val) => updateParam('category', val)}
              selectedGender={genderParam}
              onSelectGender={(val) => updateParam('gender', val)}
              selectedAge={ageParam}
              onSelectAge={(val) => updateParam('age_group', val)}
              selectedSize={sizeParam}
              onSelectSize={(val) => updateParam('size', val)}
              selectedColor={colorParam}
              onSelectColor={(val) => updateParam('color', val)}
              minPrice={minPriceParam}
              maxPrice={maxPriceParam}
              onPriceChange={(min, max) => {
                updateParam('min_price', min);
                updateParam('max_price', max);
              }}
              onSaleOnly={onSaleParam}
              onToggleSale={() => updateParam('on_sale', !onSaleParam)}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Product Listing Grid */}
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading products...</div>
              </div>
            ) : products.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🧸</div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>No garments matched your filters</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                  Try relaxing your search or clear selected size and category filters to explore more options.
                </p>
                <button onClick={handleResetFilters} className="btn btn-primary">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="product-grid">
                {products.map((prod) => (
                  <ProductCard key={prod.id} product={prod} onQuickView={(p) => setQuickViewProduct(p)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {mobileFilterOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'flex-start'
          }}
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            style={{
              width: '85%',
              maxWidth: '320px',
              height: '100%',
              background: '#FFFFFF',
              padding: '24px',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Filter Products</h3>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X size={22} />
              </button>
            </div>
            <FilterSidebar
              categories={categories}
              selectedCategory={categoryParam}
              onSelectCategory={(val) => { updateParam('category', val); setMobileFilterOpen(false); }}
              selectedGender={genderParam}
              onSelectGender={(val) => { updateParam('gender', val); setMobileFilterOpen(false); }}
              selectedAge={ageParam}
              onSelectAge={(val) => { updateParam('age_group', val); setMobileFilterOpen(false); }}
              selectedSize={sizeParam}
              onSelectSize={(val) => { updateParam('size', val); setMobileFilterOpen(false); }}
              selectedColor={colorParam}
              onSelectColor={(val) => { updateParam('color', val); setMobileFilterOpen(false); }}
              minPrice={minPriceParam}
              maxPrice={maxPriceParam}
              onPriceChange={(min, max) => {
                updateParam('min_price', min);
                updateParam('max_price', max);
              }}
              onSaleOnly={onSaleParam}
              onToggleSale={() => updateParam('on_sale', !onSaleParam)}
              onResetFilters={() => { handleResetFilters(); setMobileFilterOpen(false); }}
            />
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {/* Responsive Breakpoints CSS */}
      <style>{`
        @media (max-width: 960px) {
          .shop-layout { grid-template-columns: 1fr !important; }
          .desktop-sidebar { display: none !important; }
          .mobile-filter-btn { display: inline-flex !important; }
        }
      `}</style>
    </div>
  );
}
