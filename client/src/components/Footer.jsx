import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#18181A',
      color: '#A09E96',
      borderTop: '1px solid #28282C',
      padding: '60px 0 36px',
      marginTop: 'auto',
      fontSize: '0.88rem',
      fontFamily: 'var(--font-sans)'
    }}>
      <div className="container">
        {/* Main 4-Column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          paddingBottom: '48px',
          borderBottom: '1px solid #28282C'
        }}>
          {/* Brand Info Column */}
          <div style={{ minWidth: '220px' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '14px' }}>
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.45rem',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.02em'
              }}>
                Kids Garments
              </span>
            </Link>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.7', color: '#908E88', marginBottom: '18px' }}>
              Thoughtfully designed children's clothing crafted from 100% breathable organic cotton. Gentle on delicate skin, made for big adventures.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: '#B5B2AA' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="#D4C9B8" /> +92 (042) 3578-9000
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} color="#D4C9B8" /> support@kidsgarments.pk
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} color="#D4C9B8" /> DHA Phase 5, Lahore, Pakistan
              </div>
            </div>
          </div>

          {/* 1. Shop Column */}
          <div>
            <h4 style={{
              color: '#FFFFFF',
              fontSize: '0.92rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '16px',
              fontFamily: 'var(--font-sans)'
            }}>
              Shop
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/shop" style={footerLinkStyle}>All Products</Link>
              <Link to="/shop?sort=newest" style={footerLinkStyle}>New Arrivals</Link>
              <Link to="/shop?sort=popular" style={footerLinkStyle}>Best Sellers</Link>
              <Link to="/shop?sale=true" style={{ ...footerLinkStyle, color: '#E8A388' }}>Sale & Offers</Link>
            </div>
          </div>

          {/* 2. Categories Column */}
          <div>
            <h4 style={{
              color: '#FFFFFF',
              fontSize: '0.92rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '16px',
              fontFamily: 'var(--font-sans)'
            }}>
              Categories
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/boys" style={footerLinkStyle}>Boys' Fashion</Link>
              <Link to="/girls" style={footerLinkStyle}>Girls' Fashion</Link>
              <Link to="/baby" style={footerLinkStyle}>Baby & Newborn</Link>
              <Link to="/shop?search=Kurta" style={footerLinkStyle}>Eastern & Festive Wear</Link>
              <Link to="/shop?search=Pajama" style={footerLinkStyle}>Sleepwear & Loungewear</Link>
            </div>
          </div>

          {/* 3. Company & Customer Column */}
          <div>
            <h4 style={{
              color: '#FFFFFF',
              fontSize: '0.92rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '16px',
              fontFamily: 'var(--font-sans)'
            }}>
              Help & Customer
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/about" style={footerLinkStyle}>About Us</Link>
              <Link to="/contact" style={footerLinkStyle}>Contact Customer Care</Link>
              <Link to="/track-order" style={footerLinkStyle}>Track Order</Link>
              <Link to="/account" style={footerLinkStyle}>My Account</Link>
              <Link to="/wishlist" style={footerLinkStyle}>Saved Wishlist</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.8rem',
          color: '#76746E'
        }}>
          <div>
            © {new Date().getFullYear()} Kids Garments Pakistan. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>Cash on Delivery (COD)</span>
            <span>•</span>
            <span>JazzCash / EasyPaisa</span>
            <span>•</span>
            <span>Debit / Credit Cards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

const footerLinkStyle = {
  color: '#A09E96',
  textDecoration: 'none',
  transition: 'color 0.2s ease',
  display: 'inline-block'
};
