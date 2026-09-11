import React from 'react';
import ShopPage from './ShopPage';

export default function BabyPage() {
  return (
    <div>
      {/* Baby Custom Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #2E3D34 0%, #3D5245 100%)',
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
              Baby & Toddler (0 - 24 Months)
            </span>
            <h1 style={{ color: '#FFFFFF', fontSize: '2.5rem', marginTop: '12px', fontFamily: 'var(--font-serif)' }}>
              Ultra-Gentle Organic Baby Essentials
            </h1>
            <p style={{ color: '#D2DDD5', maxWidth: '560px', marginTop: '8px', fontSize: '0.95rem' }}>
              Hypoallergenic 2-way zip sleepsuits, newborn layette gift sets, soft knit cardigans, and toddler dungarees.
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
              100% GOTS Organic Certified
            </span>
          </div>
        </div>
      </div>

      <ShopPage
        defaultGender="Baby"
        pageTitle="Baby & Toddler Garments"
        pageSubtitle="Pure, gentle, and thoughtfully tailored clothing for your little bundle of joy."
      />
    </div>
  );
}
