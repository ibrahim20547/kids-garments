import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Clock,
  ArrowRight,
  Plus,
  Eye,
  CheckCircle,
  Truck,
  RotateCcw
} from 'lucide-react';
import { api } from '../../services/api';
import { formatPKR } from '../../utils/currency';
import { handleImageError } from '../../utils/imageUtils';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminDashboardStats()
      .then((res) => setStats(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
        <p>Loading real-time admin analytics...</p>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Revenue',
      value: formatPKR(stats?.total_sales || 0),
      subtitle: `Avg. Order: ${formatPKR(stats?.avg_order_value || 0)}`,
      icon: DollarSign,
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.15)'
    },
    {
      title: 'Total Orders',
      value: stats?.total_orders || 0,
      subtitle: `${stats?.pending_orders || 0} pending processing`,
      icon: ShoppingCart,
      color: '#3B82F6',
      bg: 'rgba(59, 130, 246, 0.15)'
    },
    {
      title: 'Active Products',
      value: stats?.active_products !== undefined ? stats.active_products : (stats?.total_products || 0),
      subtitle: `${stats?.total_products || 0} total in catalog`,
      icon: Package,
      color: '#EC4899',
      bg: 'rgba(236, 72, 153, 0.15)'
    },
    {
      title: 'Out of Stock',
      value: stats?.out_of_stock_count || 0,
      subtitle: 'Products with 0 stock',
      icon: AlertTriangle,
      color: stats?.out_of_stock_count > 0 ? '#EF4444' : '#10B981',
      bg: stats?.out_of_stock_count > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'
    },
    {
      title: 'Total Categories',
      value: stats?.total_categories || 0,
      subtitle: 'Active storefront sections',
      icon: TrendingUp,
      color: '#06B6D4',
      bg: 'rgba(6, 182, 212, 0.15)'
    },
    {
      title: 'Registered Customers',
      value: stats?.total_customers || 0,
      subtitle: 'Pakistani accounts',
      icon: Users,
      color: '#8B5CF6',
      bg: 'rgba(139, 92, 246, 0.15)'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 4px 0', color: '#F8FAFC' }}>
            Store Performance Overview
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#94A3B8' }}>
            Live metrics for Kids Garments Pakistan operations, products, and fulfillment.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link
            to="/admin/products"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              backgroundColor: '#38BDF8',
              color: '#0F172A',
              fontWeight: 700,
              fontSize: '0.85rem',
              textDecoration: 'none'
            }}
          >
            <Plus size={16} /> Add Product
          </Link>

          <Link
            to="/admin/categories"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              backgroundColor: '#334155',
              color: '#F8FAFC',
              fontWeight: 600,
              fontSize: '0.85rem',
              textDecoration: 'none'
            }}
          >
            <TrendingUp size={16} /> Categories
          </Link>

          <Link
            to="/admin/orders"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              backgroundColor: '#334155',
              color: '#F8FAFC',
              fontWeight: 600,
              fontSize: '0.85rem',
              textDecoration: 'none'
            }}
          >
            <ShoppingCart size={16} /> Manage Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px' }}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              style={{
                backgroundColor: '#1E293B',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #334155',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8' }}>{kpi.title}</span>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: kpi.bg, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '4px' }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{kpi.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Section: Recent Orders & Low Stock Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }} className="admin-grid-2">
        {/* Recent Orders Card */}
        <div style={{ backgroundColor: '#1E293B', borderRadius: '16px', padding: '24px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#F8FAFC' }}>
              Recent Orders
            </h3>
            <Link to="/admin/orders" style={{ fontSize: '0.82rem', color: '#38BDF8', textDecoration: 'none', fontWeight: 600 }}>
              View All Orders &rarr;
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 8px' }}>Order #</th>
                  <th style={{ padding: '10px 8px' }}>Customer</th>
                  <th style={{ padding: '10px 8px' }}>Total (PKR)</th>
                  <th style={{ padding: '10px 8px' }}>Status</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recent_orders && stats.recent_orders.length > 0 ? (
                  stats.recent_orders.map((ord) => (
                    <tr key={ord.id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 700, color: '#F8FAFC' }}>
                        {ord.order_number}
                      </td>
                      <td style={{ padding: '12px 8px', color: '#94A3B8' }}>
                        <div>{ord.customer_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{ord.customer_phone}</div>
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 700, color: '#F8FAFC' }}>
                        {formatPKR(ord.total_amount)}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor:
                              ord.order_status === 'Delivered'
                                ? 'rgba(34, 197, 94, 0.15)'
                                : ord.order_status === 'Pending'
                                ? 'rgba(234, 179, 8, 0.15)'
                                : ord.order_status === 'Shipped'
                                ? 'rgba(56, 189, 248, 0.15)'
                                : 'rgba(148, 163, 184, 0.15)',
                            color:
                              ord.order_status === 'Delivered'
                                ? '#22C55E'
                                : ord.order_status === 'Pending'
                                ? '#EAB308'
                                : ord.order_status === 'Shipped'
                                ? '#38BDF8'
                                : '#94A3B8'
                          }}
                        >
                          {ord.order_status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <Link
                          to={`/admin/orders?search=${ord.order_number}`}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            backgroundColor: '#334155',
                            color: '#F8FAFC',
                            textDecoration: 'none',
                            fontSize: '0.78rem',
                            fontWeight: 600
                          }}
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                      No orders placed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts Card */}
        <div style={{ backgroundColor: '#1E293B', borderRadius: '16px', padding: '24px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#EF4444" /> Low Stock Warning
            </h3>
            <Link to="/admin/inventory?filter=low" style={{ fontSize: '0.82rem', color: '#38BDF8', textDecoration: 'none', fontWeight: 600 }}>
              Manage Stock &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats?.low_stock_products && stats.low_stock_products.length > 0 ? (
              stats.low_stock_products.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#0F172A',
                    border: '1px solid #334155'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <img
                      src={item.main_image}
                      alt={item.name}
                      onError={(e) => handleImageError(e, 'Kids')}
                      style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>SKU: {item.sku}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: item.stock_quantity === 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 88, 12, 0.2)',
                        color: item.stock_quantity === 0 ? '#EF4444' : '#FB923C'
                      }}
                    >
                      {item.stock_quantity} left
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#22C55E' }}>
                <CheckCircle size={32} style={{ margin: '0 auto 8px' }} />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>All inventory levels are healthy!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Registered Customers Strip */}
      <div style={{ backgroundColor: '#1E293B', borderRadius: '16px', padding: '24px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#F8FAFC' }}>
            Recent Customers
          </h3>
          <Link to="/admin/customers" style={{ fontSize: '0.82rem', color: '#38BDF8', textDecoration: 'none', fontWeight: 600 }}>
            View All Customers &rarr;
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {stats?.recent_customers && stats.recent_customers.length > 0 ? (
            stats.recent_customers.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#38BDF8', color: '#0F172A', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {c.full_name ? c.full_name[0] : 'U'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.full_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.email}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#64748B', fontSize: '0.85rem' }}>No customers registered yet.</p>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
