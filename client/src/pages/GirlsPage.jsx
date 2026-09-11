import React from 'react';
import ShopPage from './ShopPage';

export default function GirlsPage() {
  return (
    <div>
      {/* Girls Custom Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4A2E2B 0%, #6E443B 100%)',
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
              Girls Department (1 - 14 Years)
            </span>
            <h1 style={{ color: '#FFFFFF', fontSize: '2.5rem', marginTop: '12px', fontFamily: 'var(--font-serif)' }}>
              Girls' Dresses, Frocks & Playwear
            </h1>
            <p style={{ color: '#EAD7D4', maxWidth: '560px', marginTop: '8px', fontSize: '0.95rem' }}>
              Floral tiered lawn frocks, peplum tops, twirl skirts, party dresses, and festive eastern gharara sets.
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
              Soft Lawn & Organic Cotton
            </span>
          </div>
        </div>
      </div>

      <ShopPage
        defaultGender="Girls"
        pageTitle="Girls Clothing Collection"
        pageSubtitle="Discover graceful dresses, cute tops, and delightful everyday sets for girls."
      />
    </div>
  );
}
