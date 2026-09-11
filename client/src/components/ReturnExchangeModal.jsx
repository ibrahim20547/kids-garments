import React, { useState } from 'react';
import { X, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { RETURN_REASONS } from '../utils/pakistanData';
import { useToast } from '../context/ToastContext';

export default function ReturnExchangeModal({ order, isOpen, onClose, onSuccess }) {
  const { success, error: toastError } = useToast();
  const [requestType, setRequestType] = useState('exchange');
  const [selectedProductId, setSelectedProductId] = useState(order?.items?.[0]?.product_id || '');
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequestNumber, setSubmittedRequestNumber] = useState(null);

  if (!isOpen || !order) return null;

  const selectedItem = order.items?.find(it => it.product_id === Number(selectedProductId)) || order.items?.[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        request_type: requestType,
        product_id: selectedItem?.product_id,
        product_name: selectedItem?.product_name,
        size: selectedItem?.size,
        color: selectedItem?.color,
        reason,
        customer_notes: notes
      };

      const res = await api.submitReturn(payload);
      setSubmittedRequestNumber(res.request_number);
      success(`Return/Exchange request ${res.request_number} submitted!`);
      if (onSuccess) onSuccess(res);
    } catch (err) {
      toastError(err.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmittedRequestNumber(null);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '16px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        maxWidth: '520px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '28px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
              Request Return or Exchange
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748B' }}>
              Order #{order.order_number} • 14-Day Doorstep Guarantee
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={18} />
          </button>
        </div>

        {submittedRequestNumber ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={36} />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
              Request Submitted Successfully!
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
              Your reference code is <strong>{submittedRequestNumber}</strong>.<br />
              Our Pakistan customer care representative will contact you via WhatsApp / Phone to coordinate courier pickup.
            </p>
            <button
              onClick={handleClose}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Request Type Toggle */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                I would like to:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setRequestType('exchange')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: requestType === 'exchange' ? '2px solid var(--primary, #FF6B8B)' : '1px solid #CBD5E1',
                    background: requestType === 'exchange' ? '#FFF1F2' : 'white',
                    color: requestType === 'exchange' ? 'var(--primary, #FF6B8B)' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <RefreshCw size={16} /> Size / Color Exchange
                </button>

                <button
                  type="button"
                  onClick={() => setRequestType('return')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: requestType === 'return' ? '2px solid var(--primary, #FF6B8B)' : '1px solid #CBD5E1',
                    background: requestType === 'return' ? '#FFF1F2' : 'white',
                    color: requestType === 'return' ? 'var(--primary, #FF6B8B)' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <X size={16} /> Full Return & Refund
                </button>
              </div>
            </div>

            {/* Select Product Item */}
            {order.items && order.items.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Select Item:
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    background: 'white'
                  }}
                >
                  {order.items.map((item, idx) => (
                    <option key={idx} value={item.product_id}>
                      {item.product_name} ({item.size} • {item.color}) - Qty: {item.quantity}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Select Reason */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Reason for {requestType === 'exchange' ? 'Exchange' : 'Return'}:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  background: 'white'
                }}
              >
                {RETURN_REASONS.map((r, idx) => (
                  <option key={idx} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Additional Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Details & Desired Replacement Size (if exchange):
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please exchange for size 4-5Y in Navy Blue..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{
              background: '#F8FAFC',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start'
            }}>
              <AlertCircle size={18} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
                Our courier will collect the unwashed item with tags intact right at your doorstep in Karachi, Lahore, Islamabad, and nationwide.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  background: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ flex: 2, padding: '12px', fontWeight: 700 }}
              >
                {isSubmitting ? 'Submitting...' : `Submit ${requestType === 'exchange' ? 'Exchange' : 'Return'} Request`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
