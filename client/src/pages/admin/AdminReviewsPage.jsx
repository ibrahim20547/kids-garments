import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import {
  FiStar, FiCheck, FiX, FiTrash2, FiMessageSquare,
  FiFilter, FiAlertCircle, FiRefreshCw
} from 'react-icons/fi';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState(null);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getReviews({ status: statusFilter || undefined });
      setReviews(res.data?.reviews || []);
    } catch (err) {
      showNotification('Failed to fetch reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const handleUpdateStatus = async (reviewId, newStatus) => {
    try {
      await adminApi.updateReviewStatus(reviewId, newStatus);
      showNotification(`Review marked as ${newStatus}`);
      fetchReviews();
    } catch (err) {
      showNotification('Failed to update review status', 'error');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to permanently delete this review?')) {
      try {
        await adminApi.deleteReview(reviewId);
        showNotification('Review deleted');
        fetchReviews();
      } catch (err) {
        showNotification('Failed to delete review', 'error');
      }
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
          <h1 className="text-2xl font-bold text-slate-800">Reviews & Ratings Moderation</h1>
          <p className="text-sm text-slate-500 mt-1">Approve, reject, or manage customer product feedback</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">All Moderation States</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            onClick={fetchReviews}
            title="Refresh"
            className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FiMessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-slate-600">No reviews found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Customer & Date</th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Rating & Review</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{r.user_name || 'Customer'}</div>
                      <div className="text-xs text-slate-400">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB') : 'Recent'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                      {r.product_name || `Product #${r.product_id}`}
                    </td>
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="flex items-center space-x-1 text-amber-400 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-current' : 'text-slate-200'}`}
                          />
                        ))}
                        <span className="text-xs font-bold text-slate-700 ml-1.5">{r.rating}.0</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        "{r.comment || 'No textual comment provided.'}"
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        r.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {r.status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'approved')}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition"
                            title="Approve Review"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'rejected')}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition"
                            title="Reject Review"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReview(r.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                          title="Delete Review"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviewsPage;
