import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, RefreshCw, AlertCircle, FileText } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatPKR } from '../utils/currency';
import { handleImageError } from '../utils/imageUtils';
import ReturnExchangeModal from '../components/ReturnExchangeModal';
import OrderInvoiceModal from '../components/OrderInvoiceModal';

export default function OrderTrackingPage() {
  const [searchParams] = useSearchParams();
  const { error: toastError } = useToast();

  const [orderQuery, setOrderQuery] = useState(searchParams.get('order') || '');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  useEffect(() => {
    const q = searchParams.get('order');
    if (q) {
      setOrderQuery(q);
      performTracking(q);
    }
  }, [searchParams]);

  const performTracking = async (orderNum) => {
    if (!orderNum.trim()) return;
    setLoading(true);
    setOrder(null);
    try {
      const res = await api.trackOrder(orderNum.trim());
      setOrder(res.order);
    } catch (err) {
      toastError(err.message || 'Could not find order. Please verify order number or tracking ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performTracking(orderQuery);
  };

  const stages = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const currentStageIndex = order ? stages.indexOf(order.order_status) : -1;

  return (
    <div style={{ padding: '48px 0 80px', backgroundColor: '#F8FAFC', minHeight: '80vh' }}>
      <div className="container">
        {/* Header Hero */}
        <div style={{ maxWidth: '640px', margin: '0 auto 40px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Truck size={32} />
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', color: '#0F172A' }}>
            Track Your Order 🇵🇰
          </h1>
          <p style={{ color: '#64748B', lineHeight: '1.6', fontSize: '0.95rem' }}>
            Enter your Kids Garments order number (e.g. <strong>KG-PK-2609-84210</strong>) or tracking code to monitor real-time courier status across Pakistan.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
            <input
              type="text"
              placeholder="Enter order number (e.g. KG-PK-...)"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              style={{ flex: 1, padding: '14px 18px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '1rem', textTransform: 'uppercase', background: 'white' }}
            />
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0 28px', borderRadius: '12px', fontWeight: 700 }}>
              <Search size={18} /> {loading ? 'Checking...' : 'Track'}
            </button>
          </form>
        </div>

        {/* Tracking Details View */}
        {order && (
          <div className="card" style={{ padding: '36px', maxWidth: '880px', margin: '0 auto', background: 'white', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
            {/* Order Header Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '20px', marginBottom: '32px' }}>
              <div>
                <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', background: '#F1F5F9', color: '#475569', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
                  Courier: {order.tracking_carrier || 'TCS Courier'}
                </span>
                <h2 style={{ fontSize: '1.6rem', color: '#0F172A', margin: '0 0 6px 0' }}>Order #{order.order_number}</h2>
                <div style={{ fontSize: '0.88rem', color: '#64748B' }}>
                  Tracking Code: <strong style={{ color: '#0F172A' }}>{order.tracking_number}</strong> • Placed on {order.created_at?.substring(0, 10)}
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <span
                  style={{
                    background: order.order_status === 'Delivered' ? '#16A34A' : order.order_status === 'Cancelled' ? '#DC2626' : 'var(--primary)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    padding: '6px 16px',
                    borderRadius: '20px'
                  }}
                >
                  {order.order_status}
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setInvoiceModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      background: 'white',
                      color: 'var(--primary)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <FileText size={14} /> Print Invoice
                  </button>

                  <button
                    onClick={() => setReturnModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      background: 'white',
                      color: '#475569',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <RefreshCw size={14} /> Return / Exchange
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div style={{ marginBottom: '40px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  position: 'relative',
                  textAlign: 'center',
                  gap: '8px'
                }}
                className="tracking-stages-grid"
              >
                {stages.map((stage, idx) => {
                  const isCompleted = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: isCompleted ? (isCurrent ? 'var(--primary)' : '#16A34A') : '#E2E8F0',
                          color: isCompleted ? '#ffffff' : '#94A3B8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          marginBottom: '8px',
                          zIndex: 2,
                          boxShadow: isCurrent ? '0 0 0 4px #FFE4E6' : 'none'
                        }}
                      >
                        {isCompleted && !isCurrent ? <CheckCircle2 size={20} /> : idx + 1}
                      </div>
                      <span
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: isCurrent ? 700 : 500,
                          color: isCurrent ? 'var(--primary)' : isCompleted ? '#0F172A' : '#94A3B8'
                        }}
                      >
                        {stage}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2-Column Info: Order Items & Tracking Events Timeline */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }} className="tracking-details-cols">
              {/* Column 1: Items List & Delivery Destination */}
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#0F172A' }}>
                  Ordered Garments ({order.items?.length || 0})
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {order.items?.map((item) => (
                    <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px', background: '#F8FAFC', borderRadius: '12px' }}>
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        onError={(e) => handleImageError(e, 'Kids')}
                        style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0F172A' }}>{item.product_name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                          Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>
                        {formatPKR(item.total_price)}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <h5 style={{ fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: '#0F172A' }}>
                    <MapPin size={16} color="var(--primary)" /> Delivery Destination
                  </h5>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                    <strong>{order.customer_name}</strong> ({order.customer_phone})<br />
                    {order.shipping_address}{order.shipping_apartment ? `, ${order.shipping_apartment}` : ''}<br />
                    {order.shipping_area ? `${order.shipping_area}, ` : ''}{order.shipping_city}, {order.shipping_province} {order.shipping_postal}
                  </p>
                </div>
              </div>

              {/* Column 2: Event Timeline */}
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#0F172A' }}>
                  Logistics Activity History
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '24px', borderLeft: '2px solid #E2E8F0' }}>
                  {order.events && order.events.length > 0 ? (
                    order.events.map((ev, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <div
                          style={{
                            position: 'absolute',
                            left: '-31px',
                            top: '2px',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: i === order.events.length - 1 ? 'var(--primary)' : '#94A3B8',
                            border: '2px solid white'
                          }}
                        />
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>{ev.title}</div>
                        <p style={{ margin: '2px 0 4px', fontSize: '0.82rem', color: '#475569' }}>{ev.description}</p>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'flex', gap: '8px' }}>
                          <span>{ev.location}</span>
                          <span>•</span>
                          <span>{ev.timestamp}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Tracking history updating shortly...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Return & Exchange Modal */}
      {order && (
        <ReturnExchangeModal
          order={order}
          isOpen={returnModalOpen}
          onClose={() => setReturnModalOpen(false)}
        />
      )}

      {/* Invoice Modal */}
      {order && (
        <OrderInvoiceModal
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          order={order}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .tracking-details-cols { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
