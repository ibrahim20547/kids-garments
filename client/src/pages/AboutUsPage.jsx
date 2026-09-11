import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, ShieldCheck, Smile, Award, Truck, ArrowRight, Leaf, Users } from 'lucide-react';
import { handleImageError } from '../utils/imageUtils';

export default function AboutUsPage() {
  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, #FFF1F2 0%, #FEF3C7 50%, #F0FDF4 100%)', padding: '80px 20px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span className="badge badge-sale" style={{ marginBottom: '16px' }}>Our Story</span>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '20px', color: 'var(--text-dark)' }}>
            Gentle on Skin, <br />
            <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-fun)' }}>Built for Big Adventures.</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-body)', lineHeight: '1.7' }}>
            Kids Garments was born from a simple parent wish: clothes that are cloud-soft, safe for delicate skin, and tough enough for outdoor playground thrills.
          </p>
        </div>
      </div>

      {/* Main Narrative */}
      <div className="container" style={{ padding: '80px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', alignItems: 'center', marginBottom: '80px' }}>
          <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
            <img
              src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop&q=80"
              alt="Kids smiling"
              onError={(e) => handleImageError(e, 'Kids')}
              style={{ width: '100%', height: '420px', objectFit: 'cover' }}
            />
          </div>

          <div>
            <span className="badge badge-new" style={{ marginBottom: '12px' }}>Since 2018</span>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '16px' }}>Created with a Mother's Tender Care</h2>
            <p style={{ color: 'var(--text-body)', lineHeight: '1.8', fontSize: '1rem', marginBottom: '16px' }}>
              We started in a small home studio when founder Sarah struggled to find tagless, irritation-free rompers for her newborn with eczema. What began as handmade organic cotton onesies blossomed into a complete kidswear brand loved by over 50,000 families worldwide.
            </p>
            <p style={{ color: 'var(--text-body)', lineHeight: '1.8', fontSize: '1rem' }}>
              Every stitch, popper, and zipper is rigorously safety-tested. We use 100% GOTS certified organic combed cotton, non-toxic water-based dyes, and nickel-free snaps that never irritate baby skin.
            </p>
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.2rem' }}>Our 4 Quality Promises</h2>
          <p style={{ color: 'var(--text-muted)' }}>Why discerning parents trust Kids Garments</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '80px' }}>
          <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--accent-mint-light)', color: 'var(--accent-mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Leaf size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>100% Pure Organic</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-body)' }}>Certified GOTS organic cotton free from harmful pesticides and synthetic fertilizers.</p>
          </div>

          <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <ShieldCheck size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Dermatologist Approved</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-body)' }}>OEKO-TEX Class 1 certification ensuring total safety for newborn and sensitive skin.</p>
          </div>

          <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--secondary-light)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Award size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Reinforced Durability</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-body)' }}>Double-stitched seams and stretch flex weaves made to withstand countless sandbox journeys.</p>
          </div>

          <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--accent-yellow-light)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Heart size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Joyful Designs</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-body)' }}>Playful whimsical hand-drawn dinosaur, floral, and celestial motifs that spark imaginations.</p>
          </div>
        </div>

        {/* CTA Banner */}
        <div style={{ background: 'var(--primary)', borderRadius: '24px', padding: '48px 36px', color: '#fff', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '12px' }}>Dress Your Little One in Pure Comfort</h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', maxWidth: '480px', margin: '0 auto 24px' }}>
            Experience the difference of premium organic cotton apparel today.
          </p>
          <Link to="/shop" className="btn btn-secondary btn-lg" style={{ background: '#fff', color: 'var(--primary)' }}>
            Explore Full Catalogue <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
