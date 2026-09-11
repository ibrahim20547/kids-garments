import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, Filter, Check } from 'lucide-react';

export default function FilterSidebar({
  categories = [],
  selectedCategory,
  onSelectCategory,
  selectedGender,
  onSelectGender,
  selectedAge,
  onSelectAge,
  selectedSize,
  onSelectSize,
  selectedColor,
  onSelectColor,
  minPrice,
  maxPrice,
  onPriceChange,
  onSaleOnly,
  onToggleSale,
  onResetFilters
}) {
  const [openSections, setOpenSections] = useState({
    categories: true,
    gender: true,
    age: true,
    size: true,
    color: true,
    price: true
  });

  const toggleSection = (sec) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const genders = ['Boys', 'Girls', 'Baby', 'Unisex'];
  const ageGroups = ['0-6M', '6-12M', '1-2Y', '2-4Y', '5-7Y', '8-12Y', '13-16Y'];
  const sizes = ['0-3M', '3-6M', '6-12M', '1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '7-8Y', '9-10Y', '11-12Y', '13-14Y'];
  const colors = [
    { name: 'Sage Green', hex: '#7A9A78' },
    { name: 'Sunny Yellow', hex: '#FDCB6E' },
    { name: 'Navy', hex: '#2C3E50' },
    { name: 'Khaki', hex: '#C3B091' },
    { name: 'Blush Pink', hex: '#FFB8B8' },
    { name: 'Lavender', hex: '#D6A2E8' },
    { name: 'Terracotta', hex: '#E17055' },
    { name: 'Mint', hex: '#55EFC4' },
    { name: 'Vanilla Cream', hex: '#FFF9E6' },
    { name: 'Red', hex: '#EE5253' }
  ];

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Sidebar Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1.5px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.1rem' }}>
          <Filter size={18} color="var(--primary)" /> Filters
        </div>
        <button
          onClick={onResetFilters}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}
          title="Reset all filters"
        >
          <RotateCcw size={14} /> Clear All
        </button>
      </div>

      {/* On Sale Quick Switch */}
      <div
        onClick={onToggleSale}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: onSaleOnly ? 'var(--primary-light)' : 'var(--bg-alt)',
          border: onSaleOnly ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'var(--transition)'
        }}
      >
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: onSaleOnly ? 'var(--primary)' : 'var(--text-dark)' }}>
          🔥 On Sale Only
        </span>
        <input
          type="checkbox"
          checked={onSaleOnly}
          onChange={onToggleSale}
          style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
        />
      </div>

      {/* 1. Department / Gender Filter */}
      <div>
        <div
          onClick={() => toggleSection('gender')}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: '10px' }}
        >
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Department</h4>
          {openSections.gender ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        {openSections.gender && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {genders.map((g) => {
              const active = selectedGender?.toLowerCase() === g.toLowerCase();
              return (
                <button
                  key={g}
                  onClick={() => onSelectGender(active ? '' : g)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: active ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                    background: active ? 'var(--primary)' : '#FFFFFF',
                    color: active ? '#FFFFFF' : 'var(--text-body)'
                  }}
                >
                  {g}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Categories Filter */}
      {categories.length > 0 && (
        <div>
          <div
            onClick={() => toggleSection('categories')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: '10px' }}
          >
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Categories</h4>
            {openSections.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
          {openSections.categories && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {categories.map((c) => {
                const active = selectedCategory === c.slug;
                return (
                  <button
                    key={c.id}
                    onClick={() => onSelectCategory(active ? '' : c.slug)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      fontWeight: active ? 700 : 500,
                      background: active ? 'var(--primary-light)' : 'transparent',
                      color: active ? 'var(--primary)' : 'var(--text-body)',
                      textAlign: 'left'
                    }}
                  >
                    <span>{c.name}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>({c.product_count || 0})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. Age Group Filter */}
      <div>
        <div
          onClick={() => toggleSection('age')}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: '10px' }}
        >
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Age Group</h4>
          {openSections.age ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        {openSections.age && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {ageGroups.map((ag) => {
              const active = selectedAge === ag;
              return (
                <button
                  key={ag}
                  onClick={() => onSelectAge(active ? '' : ag)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    border: active ? '1.5px solid var(--secondary)' : '1px solid var(--border-light)',
                    background: active ? 'var(--secondary-light)' : '#FFFFFF',
                    color: active ? 'var(--secondary)' : 'var(--text-body)'
                  }}
                >
                  {ag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Sizes Filter */}
      <div>
        <div
          onClick={() => toggleSection('size')}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: '10px' }}
        >
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Size</h4>
          {openSections.size ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        {openSections.size && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {sizes.map((sz) => {
              const active = selectedSize === sz;
              return (
                <button
                  key={sz}
                  onClick={() => onSelectSize(active ? '' : sz)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: active ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                    background: active ? 'var(--primary)' : '#FFFFFF',
                    color: active ? '#FFFFFF' : 'var(--text-body)'
                  }}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Color Swatches */}
      <div>
        <div
          onClick={() => toggleSection('color')}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: '10px' }}
        >
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Color</h4>
          {openSections.color ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        {openSections.color && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {colors.map((c) => {
              const active = selectedColor === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => onSelectColor(active ? '' : c.name)}
                  title={c.name}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: c.hex,
                    border: active ? '3px solid var(--primary)' : '1px solid #CBD5E1',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}
                >
                  {active && <Check size={14} color="#FFFFFF" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Price Range Filter */}
      <div>
        <div
          onClick={() => toggleSection('price')}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: '10px' }}
        >
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Price Range</h4>
          {openSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        {openSections.price && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Min (₨)</span>
                <input
                  type="number"
                  min="0"
                  max="20000"
                  placeholder="0"
                  value={minPrice || ''}
                  onChange={(e) => onPriceChange(e.target.value, maxPrice)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                />
              </div>
              <span style={{ marginTop: '16px', color: 'var(--text-muted)' }}>–</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max (₨)</span>
                <input
                  type="number"
                  min="0"
                  max="20000"
                  placeholder="10000"
                  value={maxPrice || ''}
                  onChange={(e) => onPriceChange(minPrice, e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
