import React from 'react';
import { X, Printer, Download, CheckCircle, Package } from 'lucide-react';
import { formatPKR } from '../utils/currency';

export default function OrderInvoiceModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = order.order_number || `KG-PK-${order.id}`;
  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1050,
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
          borderRadius: '20px',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'var(--bg-alt)', borderBottom: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-dark)' }}>
            Official Sales Invoice: #{invoiceNumber}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={15} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" style={{ flex: 1, overflowY: 'auto', padding: '36px', background: '#FFFFFF' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-light)', paddingBottom: '24px', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)' }}>
                <span>✨ Kids<span style={{ color: 'var(--secondary)' }}>Garments</span></span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Premium Children's Apparel & Fashion Pakistan 🇵🇰
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                support@kidsgarments.pk • +92 300 1234567
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)', textTransform: 'uppercase' }}>INVOICE</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace', margin: '4px 0' }}>
                #{invoiceNumber}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date: {orderDate}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Payment: <strong style={{ textTransform: 'uppercase' }}>{order.payment_method || 'Cash on Delivery (COD)'}</strong>
              </div>
            </div>
          </div>

          {/* Bill To & Ship To */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px', background: '#F8FAFC', padding: '16px', borderRadius: '12px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Customer Information:
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                {order.customer_name || order.shipping_name || 'Customer'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>{order.customer_email || 'No email provided'}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-body)', fontFamily: 'monospace' }}>
                {order.customer_phone || order.shipping_phone || ''}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Shipping Destination (Pakistan):
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-body)', fontWeight: 600 }}>
                {order.shipping_address || order.shipping_street || 'Pakistan Delivery Address'}
              </div>
              {order.shipping_area && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sector/Area: {order.shipping_area}</div>
              )}
              <div style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>
                {order.shipping_city || 'City'}, {order.shipping_province || 'Province'} {order.shipping_postal || order.shipping_postal_code || ''}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)', background: '#F1F5F9', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Item Description</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Variant</th>
                <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Price (PKR)</th>
                <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Total (PKR)</th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-dark)' }}>
                      {item.product_name || `Garment Item #${item.product_id}`}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {item.size && <span style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', marginRight: '4px' }}>{item.size}</span>}
                      {item.color && <span>{item.color}</span>}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-body)' }}>
                      {formatPKR(item.unit_price || item.price || 0)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: 'var(--text-dark)' }}>
                      {formatPKR((item.unit_price || item.price || 0) * item.quantity)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Order package summary
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
            <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                  {formatPKR(order.subtotal || order.total_amount || order.total || 0)}
                </span>
              </div>
              {(order.discount_amount > 0 || order.discount > 0) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--secondary)' }}>
                  <span>Coupon Discount:</span>
                  <span>-{formatPKR(order.discount_amount || order.discount || 0)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Delivery Charges:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                  {(order.shipping_fee === 0 || order.shipping_fee === '0') ? 'FREE (₨ 0)' : formatPKR(order.shipping_fee || 0)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 900, color: 'var(--primary)', borderTop: '2px solid var(--border-light)', paddingTop: '10px' }}>
                <span>Total Amount:</span>
                <span>{formatPKR(order.total_amount || order.total || 0)}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Thank you for shopping at Kids Garments! For any exchange or return requests within 7 days, please visit <strong>kidsgarments.pk/account</strong> or WhatsApp support at <strong>+92 300 1234567</strong>.
          </div>
        </div>
      </div>
    </div>
  );
}
