import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { formatPKR } from '../../utils/currency';
import { PAKISTAN_CARRIERS, ORDER_STATUSES } from '../../utils/pakistanData';
import {
  FiShoppingBag, FiSearch, FiEye, FiTruck, FiCheck, FiX,
  FiFilter, FiAlertCircle, FiClock, FiMapPin, FiPhone, FiMail,
  FiFileText, FiRefreshCw, FiPrinter
} from 'react-icons/fi';
import OrderInvoiceModal from '../../components/OrderInvoiceModal';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getOrders({
        status: statusFilter || undefined,
        search: search || undefined
      });
      setOrders(res.data?.orders || []);
    } catch (err) {
      showNotification('Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setStatusUpdate(order.status);
    setCourierName(order.shipping_carrier || 'TCS');
    setTrackingNumber(order.tracking_number || '');
    setAdminNote('');
    setShowModal(true);
  };

  const handleSaveOrderStatus = async () => {
    if (!selectedOrder) return;
    try {
      setSaving(true);
      await adminApi.updateOrderStatus(selectedOrder.id, {
        status: statusUpdate,
        shipping_carrier: courierName,
        tracking_number: trackingNumber,
        note: adminNote || undefined
      });
      showNotification(`Order #${selectedOrder.id} status updated to ${statusUpdate}`);
      setShowModal(false);
      fetchOrders();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to update order', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'bg-amber-100 text-amber-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-rose-100 text-rose-800',
      returned: 'bg-slate-100 text-slate-800'
    };
    return map[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 text-sm font-medium ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {toast.type === 'error' ? <FiAlertCircle /> : <FiCheck />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Orders Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track customer orders, update delivery pipeline & assign Pakistani couriers
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition"
        >
          <FiRefreshCw className="w-4 h-4" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, or Phone (03xx)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((st) => (
            <option key={st.id} value={st.id}>{st.label}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium">Loading orders pipeline...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FiShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-slate-600">No orders found</p>
            <p className="text-sm text-slate-400 mt-1">Try changing your filters or searching a different term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Total (PKR)</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Courier / Tracking</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-indigo-600">#{o.id}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{o.customer_name || 'Guest'}</div>
                      <div className="text-xs text-slate-400">{o.customer_phone || o.customer_email || 'No contact'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(o.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {formatPKR(o.total)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-medium uppercase">
                        {o.payment_method || 'COD'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {o.tracking_number ? (
                        <div>
                          <span className="font-semibold text-slate-700">{o.shipping_carrier || 'Courier'}: </span>
                          <span className="font-mono text-slate-500">{o.tracking_number}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusBadge(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openOrderDetails(o)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details & Status Manager Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                  <span>Order #{selectedOrder.id} Details</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${getStatusBadge(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer & Address Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <h3 className="font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1">
                    <FiPhone className="text-indigo-600" />
                    <span>Customer Information</span>
                  </h3>
                  <p className="text-slate-800 font-semibold">{selectedOrder.customer_name || 'Guest'}</p>
                  <p className="text-slate-500 mt-0.5">{selectedOrder.customer_email || 'No email'}</p>
                  <p className="text-slate-700 font-mono mt-0.5">{selectedOrder.shipping_phone || selectedOrder.customer_phone || 'No phone'}</p>
                </div>

                <div>
                  <h3 className="font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1">
                    <FiMapPin className="text-indigo-600" />
                    <span>Shipping Destination (Pakistan)</span>
                  </h3>
                  <p className="text-slate-800 font-medium">
                    {selectedOrder.shipping_street || selectedOrder.shipping_address || 'Address not specified'}
                  </p>
                  {selectedOrder.shipping_area && <p className="text-slate-600">Area/Sector: {selectedOrder.shipping_area}</p>}
                  <p className="text-slate-600">
                    {selectedOrder.shipping_city}, {selectedOrder.shipping_province} {selectedOrder.shipping_postal_code}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Order Items</h3>
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                      <tr>
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3">Variant</th>
                        <th className="py-2.5 px-3">Price</th>
                        <th className="py-2.5 px-3">Qty</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            {item.product_name || `Product #${item.product_id}`}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {item.size && <span className="bg-slate-100 px-1.5 py-0.5 rounded mr-1">Size: {item.size}</span>}
                            {item.color && <span className="bg-slate-100 px-1.5 py-0.5 rounded">Color: {item.color}</span>}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">{formatPKR(item.price)}</td>
                          <td className="py-2.5 px-3 text-slate-700 font-semibold">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                            {formatPKR(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary */}
                <div className="mt-4 flex justify-end">
                  <div className="w-64 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-slate-700">{formatPKR(selectedOrder.subtotal || selectedOrder.total)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount:</span>
                        <span>-{formatPKR(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500">
                      <span>Shipping Fee:</span>
                      <span className="font-semibold text-slate-700">
                        {selectedOrder.shipping_fee === 0 ? 'FREE' : formatPKR(selectedOrder.shipping_fee || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total (PKR):</span>
                      <span className="text-indigo-600">{formatPKR(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update & Courier Tracking Panel */}
              <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 space-y-4">
                <h3 className="text-sm font-bold text-indigo-900 flex items-center space-x-2">
                  <FiTruck className="w-4 h-4 text-indigo-600" />
                  <span>Update Fulfillment & Pakistan Courier Tracking</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                    <select
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st.id} value={st.id}>{st.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pakistani Courier</label>
                    <select
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      {PAKISTAN_CARRIERS.map((c) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tracking Number</label>
                    <input
                      type="text"
                      placeholder="e.g. TCS-789012345"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Audit Note (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Handed over to courier driver at Lahore Hub"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowInvoice(true)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition"
              >
                <FiPrinter className="w-3.5 h-3.5" />
                <span>View & Print Official Invoice</span>
              </button>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveOrderStatus}
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-100 transition disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Save & Update Tracking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal for Admin */}
      {selectedOrder && (
        <OrderInvoiceModal
          isOpen={showInvoice}
          onClose={() => setShowInvoice(false)}
          order={selectedOrder}
        />
      )}
    </div>
  );
};

export default AdminOrdersPage;
