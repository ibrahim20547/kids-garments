import React, { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductQuickViewModal from '../components/ProductQuickViewModal';

export default function SalePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    async function loadSale() {
      try {
        setLoading(true);
        const res = await api.getProducts({ on_sale: 'true' });
        setProducts(res.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSale();
  }, []);

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #7A3528 0%, #9C4B3B 100%)',
        color: '#FFFFFF',
        padding: '50px 0'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.18)',
            padding: '5px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '12px'
          }}>
            <Tag size={14} /> Seasonal Savings
          </span>
          <h1 style={{ color: '#FFFFFF', fontSize: '2.6rem', marginBottom: '8px', fontFamily: 'var(--font-serif)' }}>
            Kids Garments Special Sale
          </h1>
          <p style={{ color: '#F7E8E5', maxWidth: '520px', margin: '0 auto 16px', fontSize: '0.95rem' }}>
            Enjoy exclusive discounts on premium cotton sets, dresses, and cozy outerwear while stock lasts.
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFFFFF',
            color: 'var(--accent-terracotta)',
            padding: '7px 18px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 700,
            fontSize: '0.86rem'
          }}>
            Extra 10% OFF with Code: <span style={{ textDecoration: 'underline' }}>KIDS10</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '60px 24px 80px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.35rem' }}>On Sale ({products.length} Items)</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading sale items...</div>
        ) : (
          <div className="product-grid">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod} onQuickView={(p) => setQuickViewProduct(p)} />
            ))}
          </div>
        )}
      </div>

      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
