import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../../services/api';
import {
  FiSettings, FiSave, FiPhone, FiVolume2, FiTruck,
  FiFileText, FiImage, FiCheck, FiAlertCircle, FiUpload
} from 'react-icons/fi';

const AdminContentPage = () => {
  const [settings, setSettings] = useState({
    site_name: 'Kids Garments Pakistan',
    whatsapp_number: '+923001234567',
    whatsapp_message: 'Assalam-o-Alaikum! I have a question about an order on Kids Garments.',
    announcement_text: '🚚 FREE Nationwide Delivery across Pakistan on all orders above ₨ 3,000!',
    announcement_active: 'true',
    hero_title: 'Premium Kids Clothing for Every Special Moment',
    hero_subtitle: 'Discover eastern festive wear, western casuals, and cozy daily essentials crafted for Pakistani kids.',
    hero_image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=1200',
    free_shipping_threshold: '3000',
    standard_shipping_fee: '250',
    express_shipping_fee: '450',
    return_policy_days: '7',
    support_email: 'support@kidsgarments.pk'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [toast, setToast] = useState(null);

  const heroInputRef = useRef(null);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getSettings();
      if (res.data?.settings) {
        setSettings(prev => ({ ...prev, ...res.data.settings }));
      }
    } catch (err) {
      showNotification('Failed to load store settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleHeroFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingHero(true);
      const res = await adminApi.uploadImage(file);
      const uploadedUrl = res.data?.url;
      if (uploadedUrl) {
        handleChange('hero_image', uploadedUrl);
        showNotification('Hero banner image uploaded successfully!');
      }
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to upload hero image', 'error');
    } finally {
      setUploadingHero(false);
      if (heroInputRef.current) heroInputRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminApi.updateSettings(settings);
      showNotification('Store configuration and content saved successfully!');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #334155', borderTopColor: '#38BDF8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p>Loading store settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '12px',
            backgroundColor: toast.type === 'error' ? '#EF4444' : '#10B981',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          {toast.type === 'error' ? <FiAlertCircle size={20} /> : <FiCheck size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          backgroundColor: '#1E293B',
          borderRadius: '18px',
          padding: '24px',
          border: '1px solid #334155',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 4px 0', color: '#F8FAFC' }}>
            Store Content & Settings Management
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#94A3B8' }}>
            Configure WhatsApp live support, announcement banner, hero section, and Pakistan delivery fees.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 15px rgba(236, 72, 153, 0.35)'
          }}
        >
          <FiSave size={18} />
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Hero Section */}
        <div style={{ backgroundColor: '#1E293B', padding: '24px', borderRadius: '18px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #334155', paddingBottom: '12px', color: '#EC4899' }}>
            <FiImage size={20} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
              Homepage Hero Banner Section
            </h2>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
              Hero Main Headline
            </label>
            <input
              type="text"
              value={settings.hero_title || ''}
              onChange={(e) => handleChange('hero_title', e.target.value)}
              placeholder="Premium Kids Clothing for Every Special Moment"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #334155',
                backgroundColor: '#0F172A',
                color: '#F8FAFC',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
              Hero Subtitle / Description
            </label>
            <textarea
              rows="2"
              value={settings.hero_subtitle || ''}
              onChange={(e) => handleChange('hero_subtitle', e.target.value)}
              placeholder="Discover eastern festive wear, western casuals, and daily essentials crafted for Pakistani kids..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #334155',
                backgroundColor: '#0F172A',
                color: '#F8FAFC',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
              Hero Image Banner
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={settings.hero_image || ''}
                onChange={(e) => handleChange('hero_image', e.target.value)}
                placeholder="https://images.unsplash.com/... or upload local file"
                style={{
                  flex: 1,
                  minWidth: '240px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  backgroundColor: '#0F172A',
                  color: '#F8FAFC',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />

              <input
                type="file"
                ref={heroInputRef}
                accept="image/*"
                onChange={handleHeroFileUpload}
                style={{ display: 'none' }}
              />

              <button
                type="button"
                disabled={uploadingHero}
                onClick={() => heroInputRef.current?.click()}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#38BDF8',
                  color: '#0F172A',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  border: 'none',
                  cursor: uploadingHero ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FiUpload size={16} />
                <span>{uploadingHero ? 'Uploading...' : 'Upload Image'}</span>
              </button>

              {settings.hero_image && (
                <img
                  src={settings.hero_image}
                  alt="hero preview"
                  style={{ width: '60px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #38BDF8' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </div>
          </div>
        </div>

        {/* WhatsApp Customer Support */}
        <div style={{ backgroundColor: '#1E293B', padding: '24px', borderRadius: '18px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #334155', paddingBottom: '12px', color: '#22C55E' }}>
            <FiPhone size={20} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
              WhatsApp Live Support Integration 🇵🇰
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                WhatsApp Phone Number (with +92 or 03xx)
              </label>
              <input
                type="text"
                value={settings.whatsapp_number || ''}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                placeholder="+923001234567"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  backgroundColor: '#0F172A',
                  color: '#F8FAFC',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                Pre-Filled Chat Message
              </label>
              <input
                type="text"
                value={settings.whatsapp_message || ''}
                onChange={(e) => handleChange('whatsapp_message', e.target.value)}
                placeholder="Assalam-o-Alaikum! I have a question about an order on Kids Garments."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  backgroundColor: '#0F172A',
                  color: '#F8FAFC',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Top Announcement Bar */}
        <div style={{ backgroundColor: '#1E293B', padding: '24px', borderRadius: '18px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #334155', paddingBottom: '12px', color: '#38BDF8' }}>
            <FiVolume2 size={20} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
              Top Announcement Bar
            </h2>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
              Announcement Banner Text
            </label>
            <input
              type="text"
              value={settings.announcement_text || ''}
              onChange={(e) => handleChange('announcement_text', e.target.value)}
              placeholder="🚚 FREE Nationwide Delivery across Pakistan on all orders above ₨ 3,000!"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #334155',
                backgroundColor: '#0F172A',
                color: '#F8FAFC',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#F8FAFC' }}>
            <input
              type="checkbox"
              checked={settings.announcement_active === 'true' || settings.announcement_active === true}
              onChange={(e) => handleChange('announcement_active', e.target.checked ? 'true' : 'false')}
              style={{ width: '16px', height: '16px', accentColor: '#38BDF8' }}
            />
            <span>Show Announcement Bar across website header</span>
          </label>
        </div>

        {/* Pakistani Delivery & Shipping Rules */}
        <div style={{ backgroundColor: '#1E293B', padding: '24px', borderRadius: '18px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #334155', paddingBottom: '12px', color: '#F59E0B' }}>
            <FiTruck size={20} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
              Pakistani Shipping & Fulfillment Rules (PKR ₨)
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                Free Shipping Threshold (PKR ₨)
              </label>
              <input
                type="number"
                min="0"
                value={settings.free_shipping_threshold || '3000'}
                onChange={(e) => handleChange('free_shipping_threshold', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  backgroundColor: '#0F172A',
                  color: '#F8FAFC',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                Standard Courier Delivery Fee (PKR ₨)
              </label>
              <input
                type="number"
                min="0"
                value={settings.standard_shipping_fee || '250'}
                onChange={(e) => handleChange('standard_shipping_fee', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  backgroundColor: '#0F172A',
                  color: '#F8FAFC',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                Return Policy Window (Days)
              </label>
              <input
                type="number"
                min="1"
                value={settings.return_policy_days || '7'}
                onChange={(e) => handleChange('return_policy_days', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  backgroundColor: '#0F172A',
                  color: '#F8FAFC',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 32px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(236, 72, 153, 0.35)'
            }}
          >
            <FiSave size={18} />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminContentPage;
