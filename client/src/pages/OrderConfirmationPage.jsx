import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Package, Truck, ArrowRight, Printer, Sparkles, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import OrderInvoiceModal from '../components/OrderInvoiceModal';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.orderData || null);
  const [loading, setLoading] = useState(!order);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.warn(e);
    }

    if (!order && orderNumber) {
      async function fetchConfirmedOrder() {
        try {
          const res = await api.trackOrder(orderNumber);
          setOrder(res.order);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
      fetchConfirmedOrder();
    }
  }, [orderNumber, order]);

  return (
    <div style={{ padding: '60px 20px 100px', background: 'var(--bg-page)' }}>
      <div className="container-sm">
        <div className="card" style={{ padding: '48px 36px', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ width: '84px', height: '84px', borderRadius: '50%', background: 'var(--accent-mint-light)', color: 'var(--accent-mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 size={48} />
          </div>

          <span className="badge badge-new" style={{ marginBottom: '12px' }}>Order Verified 🇵🇰</span>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '12px' }}>Thank You for Your Order!</h1>
          <p style={{ color: 'var(--text-body)', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto 24px' }}>
            Your order has been received and is being prepared with care at our Pakistani fulfillment hub.
          </p>

          {/* Order Details Badge Box */}
          <div
            style={{
              display: 'inline-block',
              background: 'var(--bg-alt)',
              padding: '16px 28px',
              borderRadius: '16px',
              border: '1.5px dashed var(--primary)',
              marginBottom: '36px'
            }}
          >
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Your Order Reference Number
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px' }}>
              {orderNumber || order?.order_number}
            </div>
            {order?.tracking_number && (
              <div style={{ fontSize: '0.88rem', color: 'var(--text-dark)', marginTop: '4px', fontWeight: 600 }}>
                {order.tracking_carrier || 'Courier'} Tracking: {order.tracking_number}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <Link to={`/track-order?order=${orderNumber || order?.order_number}`} className="btn btn-primary btn-lg">
              <Truck size={20} /> Track Live Delivery Status
            </Link>
            {order && (
              <button
                onClick={() => setShowInvoice(true)}
                className="btn btn-secondary btn-lg"
              >
                <FileText size={20} /> View / Print Invoice
              </button>
            )}
            <Link to="/shop" className="btn btn-outline btn-lg" style={{ background: '#fff' }}>
              Continue Shopping &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Printable Invoice Modal */}
      {order && (
        <OrderInvoiceModal
          isOpen={showInvoice}
          onClose={() => setShowInvoice(false)}
          order={order}
        />
      )}
    </div>
  );
}
