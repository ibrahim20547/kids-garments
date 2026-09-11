import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard, DollarSign, Wallet, ArrowLeft, CheckCircle, AlertCircle, Sparkles, Building2, PhoneCall } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { formatPKR } from '../utils/currency';
import { handleImageError } from '../utils/imageUtils';
import { PAKISTAN_PROVINCES, MAJOR_PAKISTANI_CITIES } from '../utils/pakistanData';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, discountAmount, coupon, clearCart, calculateShipping } = useCart();
  const { currentUser, addresses } = useAuth();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_province: 'Punjab',
    shipping_city: 'Lahore',
    custom_city: '',
    shipping_area: '',
    shipping_address: '',
    shipping_apartment: '',
    shipping_postal: '',
    shipping_method: 'Standard Delivery',
    payment_method: 'Cash on Delivery',
    // Card fields if card chosen
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    card_name: '',
    // Wallet / Bank fields
    wallet_mobile: '',
    transaction_ref: '',
    notes: ''
  });

  const [selectedAddressId, setSelectedAddressId] = useState('custom');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Autofill user profile and default Pakistani address
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        customer_name: prev.customer_name || currentUser.full_name || '',
        customer_email: prev.customer_email || currentUser.email || '',
        customer_phone: prev.customer_phone || currentUser.phone || ''
      }));
    }

    if (addresses && addresses.length > 0) {
      const def = addresses.find((a) => a.is_default) || addresses[0];
      if (def) {
        setSelectedAddressId(def.id.toString());
        setFormData((prev) => ({
          ...prev,
          customer_name: def.full_name || prev.customer_name,
          customer_phone: def.phone || prev.customer_phone,
          shipping_province: def.province || 'Punjab',
          shipping_city: def.city || 'Lahore',
          shipping_area: def.area || '',
          shipping_address: def.street,
          shipping_apartment: def.apartment || '',
          shipping_postal: def.postal_code || ''
        }));
      }
    }
  }, [currentUser, addresses]);

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Your shopping bag is empty</h2>
        <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>Please add items to your cart before proceeding to checkout.</p>
        <Link to="/shop" className="btn btn-primary">Browse Garments</Link>
      </div>
    );
  }

  const shippingFee = calculateShipping(formData.shipping_method);
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleSavedAddressChange = (addrId) => {
    setSelectedAddressId(addrId);
    if (addrId === 'custom') {
      setFormData((prev) => ({
        ...prev,
        shipping_province: 'Punjab',
        shipping_city: 'Lahore',
        shipping_area: '',
        shipping_address: '',
        shipping_apartment: '',
        shipping_postal: ''
      }));
    } else {
      const chosen = addresses.find((a) => a.id.toString() === addrId);
      if (chosen) {
        setFormData((prev) => ({
          ...prev,
          customer_name: chosen.full_name,
          customer_phone: chosen.phone,
          shipping_province: chosen.province || 'Punjab',
          shipping_city: chosen.city || 'Lahore',
          shipping_area: chosen.area || '',
          shipping_address: chosen.street,
          shipping_apartment: chosen.apartment || '',
          shipping_postal: chosen.postal_code || ''
        }));
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setFormData((prev) => ({ ...prev, card_number: val }));
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    setFormData((prev) => ({ ...prev, card_expiry: val }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.customer_name.trim() || !formData.customer_email.trim() || !formData.customer_phone.trim()) {
      error('Please provide your full name, email, and contact phone number.');
      return;
    }

    const effectiveCity = formData.shipping_city === 'Other' ? formData.custom_city.trim() : formData.shipping_city;
    if (!effectiveCity) {
      error('Please select or specify your Pakistani city.');
      return;
    }

    if (!formData.shipping_address.trim()) {
      error('Please provide your complete delivery street address.');
      return;
    }

    if (formData.payment_method === 'Credit/Debit Card') {
      if (!formData.card_number || formData.card_number.replace(/\s/g, '').length < 16) {
        error('Please provide a valid 16-digit card number.');
        return;
      }
      if (!formData.card_expiry || !formData.card_cvv) {
        error('Please provide valid card expiration and CVV.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const orderPayload = {
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim(),
        customer_phone: formData.customer_phone.trim(),
        shipping_province: formData.shipping_province,
        shipping_city: effectiveCity,
        shipping_area: formData.shipping_area.trim(),
        shipping_address: formData.shipping_address.trim(),
        shipping_apartment: formData.shipping_apartment.trim(),
        shipping_postal: formData.shipping_postal.trim() || '00000',
        shipping_method: formData.shipping_method,
        payment_method: formData.payment_method,
        coupon_code: coupon ? coupon.code : undefined,
        notes: formData.notes.trim(),
        items: items.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
          size: it.size,
          color: it.color
        }))
      };

      const res = await api.createOrder(orderPayload);
      clearCart();
      success(`Order #${res.order_number} confirmed successfully!`);
      navigate(`/order-confirmed/${encodeURIComponent(res.order_number)}`, { state: { order: res } });
    } catch (err) {
      error(err.message || 'Failed to place order. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '40px 0 80px', backgroundColor: '#F8FAFC' }}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to Bag
          </Link>
        </div>

        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', color: '#0F172A' }}>
          Secure Checkout 🇵🇰
        </h1>
        <p style={{ color: '#64748B', marginBottom: '36px' }}>
          Fast delivery via TCS, Leopards & Trax Logistics across Pakistan.
        </p>

        <form onSubmit={handleSubmitOrder}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '36px', alignItems: 'flex-start' }} className="checkout-layout">
            {/* Left Column: Customer & Delivery Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* 1. Contact Information */}
              <div className="card" style={{ padding: '28px', background: '#FFFFFF', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>1</span>
                  Customer Information
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-grid-2">
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      required
                      placeholder="e.g. Ayesha Khan"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="customer_email"
                      required
                      placeholder="e.g. ayesha@example.com"
                      value={formData.customer_email}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                      Mobile Phone (for delivery rider) *
                    </label>
                    <input
                      type="tel"
                      name="customer_phone"
                      required
                      placeholder="e.g. 0300-1234567"
                      value={formData.customer_phone}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Pakistani Delivery Address */}
              <div className="card" style={{ padding: '28px', background: '#FFFFFF', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>2</span>
                  Delivery Address in Pakistan
                </h3>

                {/* Saved addresses selector if logged in */}
                {addresses && addresses.length > 0 && (
                  <div style={{ marginBottom: '20px', padding: '14px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: '#475569' }}>
                      Choose Saved Address:
                    </label>
                    <select
                      value={selectedAddressId}
                      onChange={(e) => handleSavedAddressChange(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
                    >
                      {addresses.map((addr) => (
                        <option key={addr.id} value={addr.id.toString()}>
                          {addr.street}, {addr.city} ({addr.province}) {addr.is_default ? '• [Default]' : ''}
                        </option>
                      ))}
                      <option value="custom">+ Use a different Pakistani address</option>
                    </select>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                      Province / Region *
                    </label>
                    <select
                      name="shipping_province"
                      value={formData.shipping_province}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
                    >
                      {PAKISTAN_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                      City *
                    </label>
                    <select
                      name="shipping_city"
                      value={formData.shipping_city}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
                    >
                      {MAJOR_PAKISTANI_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="Other">Other City (Type below)</option>
                    </select>
                  </div>

                  {formData.shipping_city === 'Other' && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                        Type Your City Name *
                      </label>
                      <input
                        type="text"
                        name="custom_city"
                        required
                        placeholder="e.g. Kasur, Okara, Nawabshah..."
                        value={formData.custom_city}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                      />
                    </div>
                  )}

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                      Area / Sector / Society *
                    </label>
                    <input
                      type="text"
                      name="shipping_area"
                      placeholder="e.g. Gulberg III, DHA Phase 5, Bahria Town, Clifton, F-7/2..."
                      value={formData.shipping_area}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                      Complete Street Address (House / Plot / Street) *
                    </label>
                    <input
                      type="text"
                      name="shipping_address"
                      required
                      placeholder="e.g. House # 42-B, Street 14, Block L"
                      value={formData.shipping_address}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                      Apartment / Flat / Floor (Optional)
                    </label>
                    <input
                      type="text"
                      name="shipping_apartment"
                      placeholder="e.g. Flat 3A, 2nd Floor"
                      value={formData.shipping_apartment}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                      Postal Code (Optional)
                    </label>
                    <input
                      type="text"
                      name="shipping_postal"
                      placeholder="e.g. 54000"
                      value={formData.shipping_postal}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Delivery Method */}
              <div className="card" style={{ padding: '28px', background: '#FFFFFF', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>3</span>
                  Courier Delivery Option
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: formData.shipping_method === 'Standard Delivery' ? '2px solid var(--primary)' : '1px solid #E2E8F0',
                      background: formData.shipping_method === 'Standard Delivery' ? '#FFF5F7' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="radio"
                        name="shipping_method"
                        value="Standard Delivery"
                        checked={formData.shipping_method === 'Standard Delivery'}
                        onChange={handleInputChange}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>Standard Courier Delivery (2-3 Days)</div>
                        <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Nationwide via TCS / Leopards / Trax Express</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: subtotal >= 3000 ? 'var(--accent-mint)' : '#0F172A' }}>
                      {subtotal >= 3000 ? 'FREE' : '₨ 250'}
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: formData.shipping_method === 'Express Delivery' ? '2px solid var(--primary)' : '1px solid #E2E8F0',
                      background: formData.shipping_method === 'Express Delivery' ? '#FFF5F7' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="radio"
                        name="shipping_method"
                        value="Express Delivery"
                        checked={formData.shipping_method === 'Express Delivery'}
                        onChange={handleInputChange}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>Priority 24-Hour Express Courier</div>
                        <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Fast-track priority packing & urgent dispatch</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: '#0F172A' }}>
                      ₨ 450
                    </div>
                  </label>
                </div>
              </div>

              {/* 4. Payment Method */}
              <div className="card" style={{ padding: '28px', background: '#FFFFFF', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>4</span>
                  Payment Method
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {/* Cash on Delivery (COD) */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: formData.payment_method === 'Cash on Delivery' ? '2px solid var(--primary)' : '1px solid #E2E8F0',
                      background: formData.payment_method === 'Cash on Delivery' ? '#FFF5F7' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="Cash on Delivery"
                      checked={formData.payment_method === 'Cash on Delivery'}
                      onChange={handleInputChange}
                      style={{ marginTop: '3px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#0F172A', fontSize: '0.98rem' }}>Cash on Delivery (COD) 💵</strong>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#DCFCE7', color: '#16A34A', padding: '2px 8px', borderRadius: '4px' }}>POPULAR</span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748B', lineHeight: 1.4 }}>
                        Pay in cash directly to the courier rider when your parcel arrives at your doorstep anywhere in Pakistan.
                      </p>
                    </div>
                  </label>

                  {/* EasyPaisa / JazzCash */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: formData.payment_method === 'EasyPaisa' ? '2px solid var(--primary)' : '1px solid #E2E8F0',
                      background: formData.payment_method === 'EasyPaisa' ? '#FFF5F7' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="EasyPaisa"
                      checked={formData.payment_method === 'EasyPaisa'}
                      onChange={handleInputChange}
                      style={{ marginTop: '3px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: '#0F172A', fontSize: '0.98rem' }}>EasyPaisa / JazzCash Mobile Wallet 📱</strong>
                      <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748B', lineHeight: 1.4 }}>
                        Transfer directly to our verified merchant wallet <strong>0300-1234567</strong> (Kids Garments Official).
                      </p>
                    </div>
                  </label>

                  {/* Direct Bank Transfer */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: formData.payment_method === 'Bank Transfer' ? '2px solid var(--primary)' : '1px solid #E2E8F0',
                      background: formData.payment_method === 'Bank Transfer' ? '#FFF5F7' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="Bank Transfer"
                      checked={formData.payment_method === 'Bank Transfer'}
                      onChange={handleInputChange}
                      style={{ marginTop: '3px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: '#0F172A', fontSize: '0.98rem' }}>Direct Bank Transfer (Online Banking / Raast) 🏦</strong>
                      <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748B', lineHeight: 1.4 }}>
                        Bank Alfalah • Account Title: <strong>Kids Garments Pvt Ltd</strong> • IBAN: <strong>PK36ALFH0001001234567890</strong>
                      </p>
                    </div>
                  </label>

                  {/* Debit / Credit Card */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: formData.payment_method === 'Credit/Debit Card' ? '2px solid var(--primary)' : '1px solid #E2E8F0',
                      background: formData.payment_method === 'Credit/Debit Card' ? '#FFF5F7' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="Credit/Debit Card"
                      checked={formData.payment_method === 'Credit/Debit Card'}
                      onChange={handleInputChange}
                      style={{ marginTop: '3px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: '#0F172A', fontSize: '0.98rem' }}>Credit / Debit Card (Visa • Mastercard • PayPak) 💳</strong>
                      <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748B', lineHeight: 1.4 }}>
                        Encrypted 256-bit secure checkout for all Pakistani and International cards.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Card input details if selected */}
                {formData.payment_method === 'Credit/Debit Card' && (
                  <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        name="card_name"
                        placeholder="Name on card"
                        value={formData.card_name}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="XXXX XXXX XXXX XXXX"
                        value={formData.card_number}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                          Expiry (MM/YY)
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={formData.card_expiry}
                          onChange={handleExpiryChange}
                          maxLength={5}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                          CVV / CVC
                        </label>
                        <input
                          type="password"
                          name="card_cvv"
                          placeholder="3 digits"
                          value={formData.card_cvv}
                          onChange={handleInputChange}
                          maxLength={4}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Delivery Notes */}
                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                    Special Delivery Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="e.g. Please call before arriving or leave with security gate..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontFamily: 'inherit', fontSize: '0.88rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary Card */}
            <div>
              <div className="card" style={{ padding: '28px', background: '#FFFFFF', borderRadius: '16px', position: 'sticky', top: '100px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '18px', color: '#0F172A' }}>
                  Order Review ({items.reduce((s, it) => s + it.quantity, 0)} Items)
                </h3>

                {/* Item List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '280px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
                  {items.map((it) => (
                    <div key={it.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <img
                        src={it.image}
                        alt={it.name}
                        onError={(e) => handleImageError(e, it.gender || 'Kids')}
                        style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', background: '#F1F5F9' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {it.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                          {it.size} • {it.color} • Qty: {it.quantity}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A' }}>
                        {formatPKR(it.price * it.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Subtotal</span>
                    <span style={{ fontWeight: 600 }}>{formatPKR(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', fontWeight: 700 }}>
                      <span>Coupon Discount ({coupon?.code})</span>
                      <span>-{formatPKR(discountAmount)}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Delivery Charges ({formData.shipping_method})</span>
                    <span>{shippingFee === 0 ? <strong style={{ color: 'var(--accent-mint)' }}>FREE</strong> : formatPKR(shippingFee)}</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      paddingTop: '16px',
                      borderTop: '2px solid #E2E8F0',
                      marginTop: '6px'
                    }}
                  >
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>Total Payable</span>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {formatPKR(totalAmount)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ width: '100%', height: '52px', fontSize: '1.05rem', marginTop: '24px', fontWeight: 700 }}
                >
                  {isSubmitting ? 'Confirming Your Order...' : `Place Order • ${formatPKR(totalAmount)}`}
                </button>

                <div style={{ marginTop: '20px', padding: '12px', background: '#F8FAFC', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#475569' }}>
                    <ShieldCheck size={16} color="#16A34A" /> 14-Day Free Doorstep Size Exchange
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#475569' }}>
                    <Truck size={16} color="#0284C7" /> Nationwide Delivery via TCS & Leopards
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .checkout-layout { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .form-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
