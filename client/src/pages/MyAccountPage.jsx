import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Lock,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  Truck,
  Eye,
  X,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { formatPKR } from '../utils/currency';
import { handleImageError } from '../utils/imageUtils';
import { PAKISTAN_PROVINCES, MAJOR_PAKISTANI_CITIES } from '../utils/pakistanData';
import ReturnExchangeModal from '../components/ReturnExchangeModal';

export default function MyAccountPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, currentUser, isAuthenticated, logout, updateProfile, addresses, addAddress, deleteAddress, updateAddress } = useAuth();
  const { success, error: toastError } = useToast();

  const activeUser = currentUser || user;
  const activeTab = searchParams.get('tab') || 'profile';

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const [returns, setReturns] = useState([]);
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [activeReturnOrder, setActiveReturnOrder] = useState(null);

  // Profile form
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // New/Edit address modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    province: 'Punjab',
    city: 'Lahore',
    area: '',
    street: '',
    apartment: '',
    postal_code: '',
    is_default: false
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?redirect=/account');
      return;
    }
    if (activeUser) {
      setProfileName(activeUser.full_name || '');
      setProfilePhone(activeUser.phone || '');
    }
  }, [isAuthenticated, activeUser, navigate]);

  useEffect(() => {
    if (activeTab === 'orders' && isAuthenticated) {
      setLoadingOrders(true);
      api.getUserOrders()
        .then((res) => setOrders(res.orders || []))
        .catch((err) => toastError(err.message || 'Could not load orders'))
        .finally(() => setLoadingOrders(false));
    }
    if (activeTab === 'returns' && isAuthenticated) {
      setLoadingReturns(true);
      api.getUserReturns()
        .then((res) => setReturns(res.returns || []))
        .catch((err) => toastError(err.message || 'Could not load return requests'))
        .finally(() => setLoadingReturns(false));
    }
  }, [activeTab, isAuthenticated]);

  const setTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      await updateProfile(profileName, profilePhone);
      success('Profile updated successfully!');
    } catch (err) {
      toastError(err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toastError('New passwords do not match');
      return;
    }
    try {
      setIsChangingPass(true);
      await api.changePassword(currentPassword, newPassword);
      success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toastError(err.message || 'Failed to change password');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, addressForm);
        success('Address updated!');
      } else {
        await addAddress(addressForm);
        success('Address added!');
      }
      setShowAddressModal(false);
      setEditingAddressId(null);
    } catch (err) {
      toastError(err.message || 'Failed to save address');
    }
  };

  const openNewAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      full_name: activeUser?.full_name || '',
      phone: activeUser?.phone || '',
      province: 'Punjab',
      city: 'Lahore',
      area: '',
      street: '',
      apartment: '',
      postal_code: '',
      is_default: addresses.length === 0
    });
    setShowAddressModal(true);
  };

  const openEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      full_name: addr.full_name,
      phone: addr.phone,
      province: addr.province || 'Punjab',
      city: addr.city || 'Lahore',
      area: addr.area || '',
      street: addr.street,
      apartment: addr.apartment || '',
      postal_code: addr.postal_code,
      is_default: !!addr.is_default
    });
    setShowAddressModal(true);
  };

  if (!activeUser) return null;

  return (
    <div style={{ padding: '40px 0 80px', backgroundColor: '#F8FAFC', minHeight: '85vh' }}>
      <div className="container">
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2.4rem', color: '#0F172A', margin: '0 0 6px 0' }}>My Account</h1>
          <p style={{ color: '#64748B', margin: 0 }}>Manage your personal details, saved Pakistani addresses, and order history</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px' }} className="account-layout">
          {/* Navigation Sidebar */}
          <div className="card" style={{ padding: '20px', height: 'fit-content', background: 'white', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0', marginBottom: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeUser.full_name ? activeUser.full_name[0] : 'U'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeUser.full_name}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeUser.email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={() => setTab('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: activeTab === 'profile' ? 'var(--primary-light)' : 'transparent',
                  color: activeTab === 'profile' ? 'var(--primary)' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <User size={18} /> My Profile
              </button>

              <button
                onClick={() => setTab('orders')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: activeTab === 'orders' ? 'var(--primary-light)' : 'transparent',
                  color: activeTab === 'orders' ? 'var(--primary)' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Package size={18} /> Order History
              </button>

              <button
                onClick={() => setTab('returns')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: activeTab === 'returns' ? 'var(--primary-light)' : 'transparent',
                  color: activeTab === 'returns' ? 'var(--primary)' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <RefreshCw size={18} /> Returns & Exchanges
              </button>

              <button
                onClick={() => setTab('addresses')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: activeTab === 'addresses' ? 'var(--primary-light)' : 'transparent',
                  color: activeTab === 'addresses' ? 'var(--primary)' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <MapPin size={18} /> Saved Addresses
              </button>

              <button
                onClick={() => setTab('security')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: activeTab === 'security' ? 'var(--primary-light)' : 'transparent',
                  color: activeTab === 'security' ? 'var(--primary)' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Lock size={18} /> Account Security
              </button>

              <button
                onClick={() => { logout(); navigate('/'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'transparent',
                  color: '#EF4444',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginTop: '12px',
                  borderTop: '1px solid #E2E8F0'
                }}
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>

          {/* Main Tab Content */}
          <div style={{ minWidth: 0 }}>
            {/* TAB 1: Profile */}
            {activeTab === 'profile' && (
              <div className="card" style={{ padding: '32px', background: 'white', borderRadius: '16px' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', color: '#0F172A' }}>Personal Information</h2>
                <form onSubmit={handleProfileSubmit} style={{ maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={activeUser.email}
                      disabled
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#94A3B8' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>Mobile Phone (Pakistan)</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="e.g. +92 300 1234567"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="btn btn-primary"
                    style={{ marginTop: '8px', alignSelf: 'flex-start', padding: '12px 24px' }}
                  >
                    {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: Orders */}
            {activeTab === 'orders' && (
              <div className="card" style={{ padding: '32px', background: 'white', borderRadius: '16px' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', color: '#0F172A' }}>My Orders</h2>

                {loadingOrders ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Loading your orders...</div>
                ) : orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px', color: '#64748B' }}>
                    <Package size={48} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
                    <p style={{ margin: 0 }}>You haven't placed any orders yet.</p>
                    <Link to="/shop" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        style={{
                          border: '1px solid #E2E8F0',
                          borderRadius: '16px',
                          padding: '20px',
                          background: 'white'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px', marginBottom: '14px' }}>
                          <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                              Order #{ord.order_number}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                              Placed on {ord.created_at?.substring(0, 10)} • Payment: <strong>{ord.payment_method}</strong> ({ord.payment_status})
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span
                              style={{
                                background: ord.order_status === 'Delivered' ? '#16A34A' : ord.order_status === 'Cancelled' ? '#DC2626' : 'var(--primary)',
                                color: '#fff',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.82rem',
                                fontWeight: 700
                              }}
                            >
                              {ord.order_status}
                            </span>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                              {formatPKR(ord.total_amount)}
                            </div>
                          </div>
                        </div>

                        {/* Items Preview */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                          {ord.items?.map((it, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', padding: '6px 10px', borderRadius: '8px', fontSize: '0.85rem' }}>
                              <img
                                src={it.product_image}
                                alt={it.product_name}
                                onError={(e) => handleImageError(e, 'Kids')}
                                style={{ width: '32px', height: '38px', objectFit: 'cover', borderRadius: '4px' }}
                              />
                              <span>{it.quantity} × {it.product_name} ({it.size} • {it.color})</span>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <Link to={`/track-order?order=${ord.order_number}`} className="btn btn-outline btn-sm">
                            <Truck size={14} /> Track Delivery
                          </Link>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => setActiveReturnOrder(ord)}
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

                            <button
                              onClick={() => setSelectedOrderDetails(ord)}
                              className="btn btn-soft btn-sm"
                            >
                              <Eye size={14} /> Receipt
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Returns & Exchanges */}
            {activeTab === 'returns' && (
              <div className="card" style={{ padding: '32px', background: 'white', borderRadius: '16px' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', color: '#0F172A' }}>Return & Exchange Requests</h2>

                {loadingReturns ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Loading requests...</div>
                ) : returns.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px', color: '#64748B' }}>
                    <RefreshCw size={48} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
                    <p style={{ margin: 0 }}>No return or size exchange requests submitted.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {returns.map((r) => (
                      <div key={r.id} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', background: '#F8FAFC' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div>
                            <strong style={{ color: '#0F172A', fontSize: '0.98rem' }}>Request #{r.request_number}</strong>
                            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Order #{r.order_number} • {r.created_at?.substring(0, 10)}</div>
                          </div>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              background: r.status === 'Approved' ? '#DCFCE7' : r.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                              color: r.status === 'Approved' ? '#16A34A' : r.status === 'Rejected' ? '#DC2626' : '#D97706'
                            }}
                          >
                            {r.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.88rem', color: '#334155', marginBottom: '4px' }}>
                          Type: <strong style={{ textTransform: 'capitalize' }}>{r.request_type}</strong> • Item: <strong>{r.product_name}</strong> ({r.size})
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Reason: {r.reason}</div>
                        {r.admin_notes && (
                          <div style={{ marginTop: '8px', padding: '8px 12px', background: '#E0F2FE', borderRadius: '8px', fontSize: '0.82rem', color: '#0369A1' }}>
                            <strong>Store Note:</strong> {r.admin_notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: Saved Addresses */}
            {activeTab === 'addresses' && (
              <div className="card" style={{ padding: '32px', background: 'white', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '1.4rem', color: '#0F172A', margin: 0 }}>Saved Shipping Addresses</h2>
                  <button onClick={openNewAddress} className="btn btn-primary btn-sm">
                    <Plus size={16} /> Add New Address
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    No addresses saved yet. Add one for instant 1-click checkout!
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    {addresses.map((a) => (
                      <div
                        key={a.id}
                        style={{
                          border: a.is_default ? '2px solid var(--primary)' : '1px solid #E2E8F0',
                          borderRadius: '16px',
                          padding: '20px',
                          position: 'relative',
                          background: a.is_default ? 'var(--primary-light)' : '#FFFFFF'
                        }}
                      >
                        {a.is_default === 1 && (
                          <span style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '0.72rem', fontWeight: 700, background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>
                            Default
                          </span>
                        )}
                        <h4 style={{ fontSize: '1.05rem', marginBottom: '6px', color: '#0F172A' }}>{a.full_name}</h4>
                        <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.6' }}>
                          {a.street} {a.apartment && `, ${a.apartment}`}<br />
                          {a.area ? `${a.area}, ` : ''}{a.city}, {a.province} {a.postal_code}<br />
                          Phone: {a.phone}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px' }}>
                          <button onClick={() => openEditAddress(a)} className="btn btn-outline btn-sm">
                            <Edit2 size={14} /> Edit
                          </button>
                          <button onClick={() => deleteAddress(a.id)} className="btn btn-soft btn-sm" style={{ color: '#EF4444' }}>
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: Password Security */}
            {activeTab === 'security' && (
              <div className="card" style={{ padding: '32px', background: 'white', borderRadius: '16px' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', color: '#0F172A' }}>Change Account Password</h2>
                <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>New Password (min 6 characters)</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="btn btn-primary"
                    style={{ marginTop: '8px', alignSelf: 'flex-start', padding: '12px 24px' }}
                  >
                    {isChangingPass ? 'Updating...' : 'Change Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
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
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0F172A' }}>
                {editingAddressId ? 'Edit Address' : 'Add Pakistani Delivery Address'}
              </h3>
              <button onClick={() => setShowAddressModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>Recipient Full Name *</label>
                <input
                  type="text"
                  required
                  value={addressForm.full_name}
                  onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  placeholder="e.g. 0300-1234567"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>Province *</label>
                  <select
                    value={addressForm.province}
                    onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white' }}
                  >
                    {PAKISTAN_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>City *</label>
                  <select
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white' }}
                  >
                    {MAJOR_PAKISTANI_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>Area / Sector</label>
                <input
                  type="text"
                  value={addressForm.area}
                  onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                  placeholder="e.g. Gulberg III, DHA Phase 5"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>Street Address *</label>
                <input
                  type="text"
                  required
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  placeholder="House #, Street #"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>Apartment / Floor</label>
                  <input
                    type="text"
                    value={addressForm.apartment}
                    onChange={(e) => setAddressForm({ ...addressForm, apartment: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>Postal Code</label>
                  <input
                    type="text"
                    value={addressForm.postal_code}
                    onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddressModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #CBD5E1', background: 'white', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '10px' }}>
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return & Exchange Modal Trigger */}
      {activeReturnOrder && (
        <ReturnExchangeModal
          order={activeReturnOrder}
          isOpen={!!activeReturnOrder}
          onClose={() => setActiveReturnOrder(null)}
          onSuccess={() => {
            setActiveReturnOrder(null);
            setTab('returns');
          }}
        />
      )}

      {/* Order Details Modal */}
      {selectedOrderDetails && (
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
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0F172A' }}>Receipt #{selectedOrderDetails.order_number}</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Carrier: {selectedOrderDetails.tracking_carrier}</span>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {selectedOrderDetails.items?.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{it.product_name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{it.size} • {it.color} • Qty: {it.quantity}</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>{formatPKR(it.total_price)}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>{formatPKR(selectedOrderDetails.subtotal)}</span>
              </div>
              {selectedOrderDetails.discount_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', fontWeight: 600 }}>
                  <span>Discount ({selectedOrderDetails.coupon_code}):</span>
                  <span>-{formatPKR(selectedOrderDetails.discount_amount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery:</span>
                <span>{selectedOrderDetails.shipping_fee === 0 ? 'FREE' : formatPKR(selectedOrderDetails.shipping_fee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', paddingTop: '8px', borderTop: '1px solid #E2E8F0', color: '#0F172A' }}>
                <span>Total Amount:</span>
                <span>{formatPKR(selectedOrderDetails.total_amount)}</span>
              </div>
            </div>

            <button onClick={() => setSelectedOrderDetails(null)} className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
