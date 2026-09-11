import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { formatPKR } from '../../utils/currency';
import {
  FiRotateCcw, FiCheck, FiX, FiEye, FiClock,
  FiAlertCircle, FiRefreshCw, FiMessageSquare
} from 'react-icons/fi';

const AdminReturnsPage = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getReturns({ status: statusFilter || undefined });
      setReturns(res.data?.returns || []);
    } catch (err) {
      showNotification('Failed to fetch return requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [statusFilter]);

  const openDetails = (ret) => {
    setSelectedReturn(ret);
    setAdminNotes(ret.admin_notes || '');
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedReturn) return;
    try {
      setActionLoading(true);
      await adminApi.updateReturnStatus(selectedReturn.id, {
        status: newStatus,
        admin_notes: adminNotes
      });
      showNotification(`Request #${selectedReturn.id} updated to ${newStatus}`);
      setSelectedReturn(null);
      fetchReturns();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to update return status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'bg-amber-100 text-amber-800',
      approved: 'bg-blue-100 text-blue-800',
      completed: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-rose-100 text-rose-800'
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
          <h1 className="text-2xl font-bold text-slate-800">Returns & Exchanges Center</h1>
          <p className="text-sm text-slate-500 mt-1">Review customer return claims, size exchanges, and quality queries</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved / In Transit</option>
            <option value="completed">Completed / Refunded</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            onClick={fetchReturns}
            title="Refresh"
            className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium">Loading return requests...</p>
          </div>
        ) : returns.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FiRotateCcw className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-slate-600">No return requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Request & Order</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Type & Reason</th>
                  <th className="py-3.5 px-4">Exchange Details</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-indigo-600">Request #{ret.id}</div>
                      <div className="text-xs text-slate-400 font-mono">Order #{ret.order_id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{ret.customer_name || 'Customer'}</div>
                      <div className="text-xs text-slate-400">{ret.customer_email || 'No email'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-semibold text-slate-800 uppercase">{ret.type}</div>
                      <div className="text-slate-500">{ret.reason}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {ret.exchange_size ? (
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-medium">
                          Size: {ret.exchange_size}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Full Return / Refund</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusBadge(ret.status)}`}>
                        {ret.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openDetails(ret)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-base font-bold text-slate-800">
                Review Request #{selectedReturn.id} (Order #{selectedReturn.order_id})
              </h2>
              <button
                onClick={() => setSelectedReturn(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block mb-0.5">Customer</span>
                  <span className="font-semibold text-slate-800">{selectedReturn.customer_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Request Type</span>
                  <span className="font-bold uppercase text-indigo-600">{selectedReturn.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Reason</span>
                  <span className="font-medium text-slate-700">{selectedReturn.reason}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Desired Replacement</span>
                  <span className="font-medium text-slate-700">{selectedReturn.exchange_size || 'N/A (Refund)'}</span>
                </div>
              </div>

              {selectedReturn.details && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Customer Notes:</label>
                  <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600 italic">
                    "{selectedReturn.details}"
                  </p>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Admin Resolution Notes:</label>
                <textarea
                  rows="3"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Approved. Customer advised to hand parcel to Trax Courier tracking #TX-9988."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-semibold transition"
                >
                  Reject Request
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('approved')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-semibold transition shadow-sm"
                >
                  Approve Request
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('completed')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-semibold transition shadow-sm"
                >
                  Mark Completed / Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReturnsPage;
