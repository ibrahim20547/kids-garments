import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, MapPin, Send, HelpCircle, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ContactUsPage() {
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      error('Please complete all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.submitContact(formData);
      success(res.message || 'Your message was sent successfully!');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      error(err.message || 'Failed to submit your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How do I know which size to pick for my baby/child?',
      a: 'We recommend checking our interactive Size Chart Guide on any product details page. If your child is between sizes, we recommend ordering one size up to allow room for growth.'
    },
    {
      q: 'What is your return & exchange policy?',
      a: 'We provide a 14-day hassle-free return and size exchange window across Pakistan. Our courier collects the package right at your doorstep in Karachi, Lahore, Islamabad, and nationwide!'
    },
    {
      q: 'Are all your dyes safe for sensitive eczema-prone skin?',
      a: 'Yes! All Kids Garments fabrics are crafted with pure breathable cotton and non-toxic skin-safe dyes gentle on delicate children skin.'
    },
    {
      q: 'How long will delivery take across Pakistan?',
      a: 'Standard Courier delivery takes 2-3 business days via TCS / Leopards / Trax (Free over ₨ 3,000). Priority 24-Hour Express delivery is also available on checkout.'
    }
  ];

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 48px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
            We're Here to Help
          </span>
          <h1 style={{ fontSize: '2.6rem', marginTop: '6px', marginBottom: '10px' }}>Contact Customer Care</h1>
          <p style={{ color: 'var(--text-body)', fontSize: '1rem' }}>
            Have a question about sizing, order tracking, or fabric care? Our friendly parenting support team is ready to help!
          </p>
        </div>

        {/* Contact Channels Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '60px' }}>
          {/* Card 1: Phone */}
          <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Phone size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Phone Support</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Mon-Sat: 8am - 8pm EST</p>
            <a href="tel:18004565437" style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
              +1 (800) 456-KIDS
            </a>
          </div>

          {/* Card 2: Email */}
          <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--secondary-light)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Mail size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Email Assistance</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Replies within 24 hours</p>
            <a href="mailto:support@kidsgarments.com" style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: '0.95rem' }}>
              support@kidsgarments.com
            </a>
          </div>

          {/* Card 3: WhatsApp */}
          <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-mint-light)', color: 'var(--accent-mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <MessageSquare size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>WhatsApp Live Chat</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Instant response for orders</p>
            <a
              href="https://wa.me/15552345678?text=Hello%20Kids%20Garments%20Support,%20I%20have%20an%20inquiry"
              target="_blank"
              rel="noreferrer"
              className="btn btn-soft btn-sm"
              style={{ color: '#27AE60', background: 'var(--accent-mint-light)', fontWeight: 700 }}
            >
              Start WhatsApp Chat &rarr;
            </a>
          </div>

          {/* Card 4: Location */}
          <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-yellow-light)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <MapPin size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Store & HQ</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              742 Evergreen Blossom Way, Suite 100<br />Springfield, CA 90210
            </p>
          </div>
        </div>

        {/* 2-Column Form & FAQs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '48px', alignItems: 'flex-start' }}>
          {/* Left: Contact Form */}
          <div className="card" style={{ padding: '36px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>Send Us a Message</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Fill out the form below and our team will get back to you promptly.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Sarah Jenkins"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="parent@example.com"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Phone (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+1 (555) 234-5678"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    placeholder="e.g. Size question / Order update"
                    className="form-control"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Message *</label>
                <textarea
                  rows={5}
                  name="message"
                  placeholder="How can we assist you today?"
                  className="form-control"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary btn-lg"
                style={{ marginTop: '8px' }}
              >
                <Send size={18} /> {isSubmitting ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Right: FAQ Accordions */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <HelpCircle size={22} color="var(--primary)" />
              <h2 style={{ fontSize: '1.5rem' }}>Frequently Asked Questions</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="card"
                    style={{
                      border: isOpen ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                      overflow: 'hidden'
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      style={{
                        width: '100%',
                        padding: '18px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        textAlign: 'left',
                        fontWeight: 700,
                        fontSize: '0.98rem',
                        color: 'var(--text-dark)',
                        background: isOpen ? 'var(--primary-light)' : 'transparent'
                      }}
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp size={18} color="var(--primary)" /> : <ChevronDown size={18} />}
                    </button>
                    {isOpen && (
                      <div style={{ padding: '16px 20px', fontSize: '0.92rem', color: 'var(--text-body)', lineHeight: '1.7', borderTop: '1px solid var(--border-light)' }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
