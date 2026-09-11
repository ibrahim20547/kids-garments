import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { formatPKR } from '../../utils/currency';
import {
  FiPercent, FiPlus, FiTrash2, FiTag, FiCalendar, FiCheck,
  FiAlertCircle, FiX, FiToggleLeft, FiToggleRight
} from 'react-icons/fi';

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const initialForm = {
    code: '',
    discount_type: 'percentage', // percentage or fixed
    discount_value: '',
    min_spend: 0,
    max_discount: '',
    usage_limit: 100,
    valid_until: '',
    is_active: true
  };

  const [formData, setFormData] = useState(initialForm);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCoupons();
      setCoupons(res.data?.coupons || []);
    } catch (err) {
      showNotification('Failed to fetch coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAddModal = () => {
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discount_value) {
      showNotification('Code and discount value are required', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        discount_value: parseFloat(formData.discount_value),
        min_spend: parseFloat(formData.min_spend) || 0,
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        usage_limit: parseInt(formData.usage_limit, 10) || 100,
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null
      };

      await adminApi.createCoupon(payload);
      showNotification(`Coupon ${payload.code} created successfully`);
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to create coupon', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCoupon = async (id, code) => {
    if (window.confirm(`Delete discount coupon "${code}"?`)) {
      try {
        await adminApi.deleteCoupon(id);
        showNotification('Coupon deleted');
        fetchCoupons();
      } catch (err) {
        showNotification('Failed to delete coupon', 'error');
      }
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await adminApi.updateCoupon(coupon.id, {
        is_active: !coupon.is_active
      });
      showNotification(`Coupon status updated`);
      fetchCoupons();
    } catch (err) {
      showNotification('Failed to toggle coupon status', 'error');
    }
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
          <h1 className="text-2xl font-bold text-slate-800">Coupons & Promo Codes</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create promotional discount codes (PKR fixed or %) for marketing campaigns
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-indigo-100 transition duration-200"
        >
          <FiPlus className="w-5 h-5" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Coupons List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium">Loading discount coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FiTag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-slate-600">No discount coupons found</p>
            <p className="text-sm text-slate-400 mt-1">Create your first promo code to boost sales.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount Value</th>
                  <th className="py-3.5 px-4">Min. Spend</th>
                  <th className="py-3.5 px-4">Usage</th>
                  <th className="py-3.5 px-4">Valid Until</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg text-xs border border-slate-200">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-indigo-600 text-xs">
                      {c.discount_type === 'percentage'
                        ? `${c.discount_value}% OFF`
                        : `${formatPKR(c.discount_value)} FLAT`}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {c.min_spend > 0 ? formatPKR(c.min_spend) : 'No Minimum'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">{c.used_count || 0}</span>
                      <span className="text-slate-400"> / {c.usage_limit || '∞'} used</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {c.valid_until ? new Date(c.valid_until).toLocaleDateString('en-GB') : 'No Expiry'}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer ${
                          c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {c.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(c.id, c.code)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Coupon"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Create New Coupon</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EID20 or AZADI14"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (PKR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Discount Value {formData.discount_type === 'percentage' ? '(%)' : '(PKR)'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder={formData.discount_type === 'percentage' ? '15' : '500'}
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min. Order Spend (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.min_spend}
                    onChange={(e) => setFormData({ ...formData, min_spend: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="100"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Valid Until (Expiry Date)</label>
                <input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-100 transition disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCouponsPage;
