import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductQuickViewModal from '../components/ProductQuickViewModal';

export default function NewArrivalsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    async function loadNew() {
      try {
        setLoading(true);
        const res = await api.getProducts({ is_new: 'true' });
        setProducts(res.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadNew();
  }, []);

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #1C1D1F 0%, #35363B 100%)',
        color: '#FFFFFF',
        padding: '50px 0'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.15)',
            padding: '5px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '12px'
          }}>
            <Sparkles size={14} /> Just Arrived
          </span>
          <h1 style={{ color: '#FFFFFF', fontSize: '2.6rem', marginBottom: '8px', fontFamily: 'var(--font-serif)' }}>
            Latest Kids New Arrivals
          </h1>
          <p style={{ color: '#D5D1C6', maxWidth: '520px', margin: '0 auto', fontSize: '0.95rem' }}>
            Fresh designs, breathable lawn sets, and stylish outerwear tailored for Pakistani children.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '60px 24px 80px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.35rem' }}>New In Collection ({products.length} Items)</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading fresh collection...</div>
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
