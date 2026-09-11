import React, { useState } from 'react';
import { X, Sparkles, Ruler, CheckCircle2 } from 'lucide-react';

const SIZE_CHART = [
  { age: '0-3 Months', size: '0-3M', height: '56-62 cm', chest: '40-44 cm', waist: '40-42 cm', weight: '3.5 - 5.5 kg' },
  { age: '3-6 Months', size: '3-6M', height: '62-68 cm', chest: '44-46 cm', waist: '42-44 cm', weight: '5.5 - 7.5 kg' },
  { age: '6-12 Months', size: '6-12M', height: '68-80 cm', chest: '46-48 cm', waist: '44-46 cm', weight: '7.5 - 10 kg' },
  { age: '1-2 Years', size: '1-2Y', height: '80-92 cm', chest: '48-52 cm', waist: '46-50 cm', weight: '10 - 13 kg' },
  { age: '2-3 Years', size: '2-3Y', height: '92-98 cm', chest: '52-54 cm', waist: '50-52 cm', weight: '13 - 15 kg' },
  { age: '3-4 Years', size: '3-4Y', height: '98-104 cm', chest: '54-56 cm', waist: '52-54 cm', weight: '15 - 17 kg' },
  { age: '4-5 Years', size: '4-5Y', height: '104-110 cm', chest: '56-58 cm', waist: '54-55 cm', weight: '17 - 20 kg' },
  { age: '5-6 Years', size: '5-6Y', height: '110-116 cm', chest: '58-61 cm', waist: '55-57 cm', weight: '20 - 23 kg' },
  { age: '7-8 Years', size: '7-8Y', height: '122-128 cm', chest: '63-67 cm', waist: '58-60 cm', weight: '25 - 28 kg' },
  { age: '9-10 Years', size: '9-10Y', height: '134-140 cm', chest: '69-73 cm', waist: '62-64 cm', weight: '31 - 35 kg' },
  { age: '11-12 Years', size: '11-12Y', height: '146-152 cm', chest: '75-79 cm', waist: '66-68 cm', weight: '38 - 43 kg' },
  { age: '13-14 Years', size: '13-14Y', height: '158-164 cm', chest: '81-86 cm', waist: '70-73 cm', weight: '46 - 52 kg' },
];

export default function SizeGuideModal({ isOpen, onClose, onSelectSize, availableSizes = [] }) {
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' or 'recommender'

  // Calculator inputs
  const [childAgeYears, setChildAgeYears] = useState('3');
  const [childHeightCm, setChildHeightCm] = useState('100');
  const [childWeightKg, setChildWeightKg] = useState('15');
  const [recommendedSize, setRecommendedSize] = useState(null);

  if (!isOpen) return null;

  const calculateRecommendation = (e) => {
    e.preventDefault();
    const height = parseFloat(childHeightCm) || 100;
    const age = parseFloat(childAgeYears) || 3;

    let rec = '3-4Y';
    if (height < 62 || age < 0.3) rec = '0-3M';
    else if (height < 68 || age < 0.6) rec = '3-6M';
    else if (height < 80 || age <= 1) rec = '6-12M';
    else if (height < 92 || age <= 2) rec = '1-2Y';
    else if (height < 98 || age <= 3) rec = '2-3Y';
    else if (height < 104 || age <= 4) rec = '3-4Y';
    else if (height < 110 || age <= 5) rec = '4-5Y';
    else if (height < 116 || age <= 6) rec = '5-6Y';
    else if (height < 128 || age <= 8) rec = '7-8Y';
    else if (height < 140 || age <= 10) rec = '9-10Y';
    else if (height < 152 || age <= 12) rec = '11-12Y';
    else rec = '13-14Y';

    setRecommendedSize(rec);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Ruler size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>Kids Sizing Guide & Recommender</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Standard measurements for Pakistani children apparel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-alt)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-body)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', padding: '12px 24px', background: 'var(--bg-alt)', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('chart')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
              background: activeTab === 'chart' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'chart' ? 'var(--primary)' : 'var(--text-body)',
              boxShadow: activeTab === 'chart' ? 'var(--shadow-sm)' : 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Standard Size Chart (CM)
          </button>
          <button
            onClick={() => setActiveTab('recommender')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
              background: activeTab === 'recommender' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'recommender' ? 'var(--primary)' : 'var(--text-body)',
              boxShadow: activeTab === 'recommender' ? 'var(--shadow-sm)' : 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} /> Smart Size Recommender
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {activeTab === 'chart' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-alt)', color: 'var(--text-dark)', fontWeight: 700, borderBottom: '2px solid var(--border-light)' }}>
                    <th style={{ padding: '10px 12px' }}>Age Group</th>
                    <th style={{ padding: '10px 12px' }}>Size Tag</th>
                    <th style={{ padding: '10px 12px' }}>Child Height</th>
                    <th style={{ padding: '10px 12px' }}>Chest</th>
                    <th style={{ padding: '10px 12px' }}>Waist</th>
                    <th style={{ padding: '10px 12px' }}>Avg Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_CHART.map((row, idx) => {
                    const isAvailable = availableSizes.length === 0 || availableSizes.some(s => (s.size_name || s.size || s) === row.size);
                    return (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid var(--border-light)',
                          background: idx % 2 === 0 ? '#FFFFFF' : 'var(--bg-page)',
                          opacity: isAvailable ? 1 : 0.6
                        }}
                      >
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{row.age}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '6px', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.78rem' }}>
                            {row.size}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-body)' }}>{row.height}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-body)' }}>{row.chest}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-body)' }}>{row.waist}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-body)' }}>{row.weight}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ marginTop: '16px', padding: '12px', background: '#F8FAFC', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                💡 <em>Tip for parents:</em> If your child is between sizes or taller than average, we recommend picking the larger size to allow room for rapid growth.
              </div>
            </div>
          )}

          {activeTab === 'recommender' && (
            <div style={{ maxWidth: '480px', margin: '0 auto' }}>
              <form onSubmit={calculateRecommendation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>Find the Perfect Fit for Your Child</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enter your child's age & height to get an instant sizing suggestion.</p>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Child Age (Years or decimal e.g. 0.5 for 6M)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="16"
                    value={childAgeYears}
                    onChange={(e) => setChildAgeYears(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Child Height in CM (Approx.)</label>
                  <input
                    type="number"
                    min="40"
                    max="180"
                    value={childHeightCm}
                    onChange={(e) => setChildHeightCm(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Child Weight in KG (Optional)</label>
                  <input
                    type="number"
                    min="2"
                    max="70"
                    value={childWeightKg}
                    onChange={(e) => setChildWeightKg(e.target.value)}
                    className="form-control"
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '6px' }}>
                  <Sparkles size={16} /> Calculate Recommended Size
                </button>
              </form>

              {recommendedSize && (
                <div style={{ marginTop: '24px', padding: '20px', background: 'var(--primary-light)', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255,107,107,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase' }}>
                    <CheckCircle2 size={18} /> Recommended Size
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', margin: '8px 0' }}>
                    {recommendedSize}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-body)', margin: 0 }}>
                    Based on height {childHeightCm} cm and age {childAgeYears} years. <em>(Suggestion only; fit may vary with fabric style.)</em>
                  </p>
                  {onSelectSize && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSize(recommendedSize);
                        onClose();
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: '12px' }}
                    >
                      Apply Size "{recommendedSize}" to Product
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', background: 'var(--bg-page)' }}>
          <button onClick={onClose} className="btn btn-outline btn-sm">
            Close Sizing Guide
          </button>
        </div>
      </div>
    </div>
  );
}
