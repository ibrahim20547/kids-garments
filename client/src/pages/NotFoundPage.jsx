import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', background: '#FFFFFF', padding: '48px 32px', borderRadius: '24px', border: '1px solid var(--border-light)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🧸</div>
        <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>404 - Page Not Found</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>
          Oops! The garment or page you were looking for seems to have wandered off to the playground.
        </p>
        <Link to="/" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
          <ArrowLeft size={18} /> Return to Home
        </Link>
      </div>
    </div>
  );
}
