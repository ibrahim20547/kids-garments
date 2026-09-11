import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { formatPKR } from '../../utils/currency';
import {
  FiUsers, FiSearch, FiEye, FiShoppingBag, FiMail, FiPhone,
  FiCalendar, FiDollarSign, FiX, FiCheck, FiAlertCircle
} from 'react-icons/fi';

const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCustomers({ search: search || undefined });
      setCustomers(res.data?.customers || []);
    } catch (err) {
      showNotification('Failed to fetch customers list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const openCustomerDetails = async (cust) => {
    setSelectedCustomer(cust);
    setShowModal(true);
    setOrdersLoading(true);
    try {
      const res = await adminApi.getCustomerOrders(cust.id);
      setCustomerOrders(res.data?.orders || []);
    } catch (err) {
      setCustomerOrders([]);
    } finally {
      setOrdersLoading(false);
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
          <h1 className="text-2xl font-bold text-slate-800">Customers & Shoppers</h1>
          <p className="text-sm text-slate-500 mt-1">View registered customer profiles, lifetime value, and order history</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search customer by name, email, or Pakistani phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition"
          />
        </form>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium">Loading customer directory...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FiUsers className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-slate-600">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4">Orders Placed</th>
                  <th className="py-3.5 px-4">Lifetime Spend (PKR)</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-sm flex-shrink-0">
                          {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">{c.name || 'Anonymous User'}</div>
                          <div className="text-xs text-slate-400">ID #{c.id} • {c.role === 'admin' ? 'Administrator' : 'Customer'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="text-slate-700">{c.email}</div>
                      <div className="text-slate-400 font-mono mt-0.5">{c.phone || 'No phone recorded'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString('en-GB') : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700">{c.order_count || 0}</span>
                      <span className="text-xs text-slate-400 ml-1">orders</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {formatPKR(c.total_spent || 0)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openCustomerDetails(c)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                        <span>History</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Orders History Modal */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  {selectedCustomer.name}'s Order History
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">{selectedCustomer.email}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {ordersLoading ? (
                <div className="py-12 text-center text-slate-400 text-sm">Loading customer orders...</div>
              ) : customerOrders.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  This customer has not placed any orders yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {customerOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-indigo-600">Order #{ord.id}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">
                            {new Date(ord.created_at).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                        <div className="text-slate-600 mt-1 capitalize">
                          Status: <span className="font-semibold text-slate-800">{ord.status}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 text-sm">{formatPKR(ord.total)}</div>
                        <div className="text-slate-400 uppercase text-[11px]">{ord.payment_method || 'COD'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomersPage;
