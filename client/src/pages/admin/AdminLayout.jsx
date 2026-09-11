import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Sliders,
  Boxes,
  ShoppingCart,
  Users,
  Tag,
  Star,
  RefreshCw,
  FileText,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Bell,
  Search,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { api, getAdminToken, setAdminToken } from '../../services/api';
import { formatPKR } from '../../utils/currency';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lowStockAlertCount, setLowStockAlertCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      navigate('/admin');
      return;
    }

    api.getAdminMe()
      .then((res) => {
        setAdminUser(res.admin);
        // Load quick badge counts
        api.getAdminDashboardStats()
          .then((stats) => {
            setLowStockAlertCount(stats.low_stock_count || 0);
            setPendingOrdersCount(stats.pending_orders || 0);
          })
          .catch(() => {});
      })
      .catch((err) => {
        setAdminToken(null);
        navigate('/admin');
      })
      .finally(() => setLoading(false));
  }, [navigate, location.pathname]);

  const handleAdminLogout = () => {
    setAdminToken(null);
    navigate('/admin');
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A', color: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid #334155', borderTopColor: '#38BDF8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '0.95rem', color: '#94A3B8' }}>Authenticating Admin Portal...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Sizes & Colors', path: '/admin/attributes', icon: Sliders },
    { label: 'Inventory / Stock', path: '/admin/inventory', icon: Boxes, badge: lowStockAlertCount > 0 ? lowStockAlertCount : null, badgeColor: '#EA580C' },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingCart, badge: pendingOrdersCount > 0 ? pendingOrdersCount : null, badgeColor: '#3B82F6' },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Discounts & Coupons', path: '/admin/coupons', icon: Tag },
    { label: 'Reviews Moderation', path: '/admin/reviews', icon: Star },
    { label: 'Returns & Exchanges', path: '/admin/returns', icon: RefreshCw },
    { label: 'Website Content', path: '/admin/content', icon: FileText }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0F172A', color: '#F8FAFC', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 900
          }}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#1E293B',
          borderRight: '1px solid #334155',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 1000,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(0)',
          transition: 'transform 0.3s ease'
        }}
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
      >
        {/* Brand Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>
              KG
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#F8FAFC', letterSpacing: '0.3px' }}>Kids Garments</div>
              <div style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase' }}>Admin Control Center</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="mobile-close-btn"
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'none' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: isActive ? '#334155' : 'transparent',
                  color: isActive ? '#38BDF8' : '#94A3B8',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = '#1E293B';
                  if (!isActive) e.currentTarget.style.color = '#F8FAFC';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  if (!isActive) e.currentTarget.style.color = '#94A3B8';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '10px',
                      backgroundColor: item.badgeColor || '#3B82F6',
                      color: '#FFFFFF'
                    }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>

        {/* Admin User Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid #334155', backgroundColor: '#0F172A' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {adminUser?.full_name || 'Admin Officer'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {adminUser?.email}
              </div>
            </div>
            <button
              onClick={handleAdminLogout}
              title="Sign Out of Admin"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#EF4444',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minWidth: 0 }} className="admin-main-wrapper">
        {/* Top Header Bar */}
        <header
          style={{
            height: '64px',
            backgroundColor: '#1E293B',
            borderBottom: '1px solid #334155',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 800
          }}
        >
          {/* Left: Mobile Toggle & Page Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mobile-menu-toggle"
              style={{ background: 'none', border: 'none', color: '#F8FAFC', cursor: 'pointer', display: 'none' }}
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#94A3B8' }}>
              <span>Admin Portal</span>
              <ChevronRight size={14} />
              <span style={{ color: '#38BDF8', fontWeight: 600, textTransform: 'capitalize' }}>
                {location.pathname.replace('/admin', '').replace('/', '') || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: '#334155',
                color: '#F8FAFC',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
                transition: 'background 0.2s'
              }}
            >
              <span>View Storefront</span>
              <ExternalLink size={14} />
            </a>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(34, 197, 94, 0.12)', borderRadius: '20px', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22C55E' }}>PK Live</span>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Route Content */}
        <main style={{ flex: 1, padding: '28px', backgroundColor: '#0F172A', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .admin-sidebar {
            transform: translateX(-100%) !important;
          }
          .admin-sidebar.open {
            transform: translateX(0) !important;
          }
          .admin-main-wrapper {
            margin-left: 0 !important;
          }
          .mobile-menu-toggle {
            display: block !important;
          }
          .mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
