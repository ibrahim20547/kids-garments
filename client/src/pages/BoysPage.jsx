import React from 'react';
import ShopPage from './ShopPage';

export default function BoysPage() {
  return (
    <div>
      {/* Boys Custom Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1C2331 0%, #2C3E50 100%)',
        color: '#FFFFFF',
        padding: '48px 0'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: 'rgba(255,255,255,0.15)',
              padding: '5px 14px',
              borderRadius: 'var(--radius-full)'
            }}>
              Boys Department (1 - 14 Years)
            </span>
            <h1 style={{ color: '#FFFFFF', fontSize: '2.5rem', marginTop: '12px', fontFamily: 'var(--font-serif)' }}>
              Boys' Active & Casual Wardrobe
            </h1>
            <p style={{ color: '#D5DDE6', maxWidth: '560px', marginTop: '8px', fontSize: '0.95rem' }}>
              Comfortable tees, button-down shirts, durable chinos, denim jeans, jackets, and traditional Eid kurtas.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 600
            }}>
              100% Breathable Cotton
            </span>
          </div>
        </div>
      </div>

      <ShopPage
        defaultGender="Boys"
        pageTitle="Boys Clothing & Outfits"
        pageSubtitle="Explore smart, durable, and comfortable children's garments."
      />
    </div>
  );
}
