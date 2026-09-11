import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import { api } from '../services/api';

export default function WhatsAppButton() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('+923001234567');
  const [welcomeMsg, setWelcomeMsg] = useState('Hello Kids Garments! I would like to inquire about children clothing and orders.');

  // Do not display on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    api.getSettings()
      .then(res => {
        if (res?.settings?.whatsapp_number) {
          setWhatsappNumber(res.settings.whatsapp_number);
        }
        if (res?.settings?.whatsapp_welcome_message) {
          setWelcomeMsg(res.settings.whatsapp_welcome_message);
        }
      })
      .catch(() => {});
  }, []);

  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const chatUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(welcomeMsg)}`;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      fontFamily: 'inherit'
    }}>
      {/* Pop-up Chat Prompt */}
      {isOpen && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          padding: '16px',
          width: '280px',
          marginBottom: '12px',
          border: '1px solid #E2E8F0',
          animation: 'fadeInUp 0.25s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#22C55E'
              }} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>WhatsApp Support</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '2px' }}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: '1.4', margin: '0 0 12px 0' }}>
            Hi there! Need help choosing the right size, tracking your Pakistan courier, or placing an order?
          </p>
          <a
            href={chatUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#25D366',
              color: 'white',
              padding: '10px 14px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.85rem',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(37, 211, 102, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <MessageCircle size={18} fill="white" />
            Start WhatsApp Chat
          </a>
        </div>
      )}

      {/* Floating Trigger Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {!isOpen && (
          <div style={{
            background: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#334155',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #E2E8F0',
            cursor: 'pointer'
          }}
          onClick={() => setIsOpen(true)}
          >
            Need Help? 💬
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#25D366',
            color: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 6px 16px rgba(37, 211, 102, 0.4)',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Chat on WhatsApp"
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={28} fill="white" />}
        </button>
      </div>
    </div>
  );
}
