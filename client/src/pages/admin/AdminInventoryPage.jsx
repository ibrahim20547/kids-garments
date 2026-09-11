import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { formatPKR } from '../../utils/currency';
import { handleImageError } from '../../utils/imageUtils';
import {
  FiPackage, FiAlertTriangle, FiCheck, FiAlertCircle, FiSave,
  FiSearch, FiFilter, FiRefreshCw, FiDollarSign, FiSlash, FiCheckCircle
} from 'react-icons/fi';

const AdminInventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({ total_items: 0, low_stock_count: 0, out_of_stock_count: 0, total_units: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, in_stock, low_stock, out_of_stock
  const [search, setSearch] = useState('');
  const [stockInputs, setStockInputs] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getInventory({
        status: filter !== 'all' ? filter : undefined
      });
      const items = res.data?.inventory || [];
      setInventory(items);
      
      const inStockCount = items.filter(i => (i.stock_quantity !== undefined ? i.stock_quantity : i.stock) > 5).length;
      const lowStockCount = items.filter(i => {
        const qty = i.stock_quantity !== undefined ? i.stock_quantity : i.stock;
        return qty > 0 && qty <= 5;
      }).length;
      const outStockCount = items.filter(i => (i.stock_quantity !== undefined ? i.stock_quantity : i.stock) <= 0).length;
      const totalUnits = items.reduce((acc, i) => acc + (i.stock_quantity !== undefined ? i.stock_quantity : (i.stock || 0)), 0);

      setStats(res.data?.stats || {
        total_items: items.length,
        low_stock_count: lowStockCount,
        out_of_stock_count: outStockCount,
        total_units: totalUnits
      });

      const initialInputs = {};
      items.forEach(item => {
        initialInputs[item.id] = item.stock_quantity !== undefined ? item.stock_quantity : (item.stock || 0);
      });
      setStockInputs(initialInputs);
    } catch (err) {
      showNotification('Failed to fetch inventory data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [filter]);

  const handleStockInputChange = (id, value) => {
    setStockInputs(prev => ({
      ...prev,
      [id]: Math.max(0, parseInt(value, 10) || 0)
    }));
  };

  const handleUpdateStock = async (id, customQty = null) => {
    const newStock = customQty !== null ? customQty : stockInputs[id];
    if (newStock === undefined || newStock < 0) {
      showNotification('Please enter a valid stock number', 'error');
      return;
    }

    try {
      setSavingId(id);
      await adminApi.updateProductStock(id, newStock);
      showNotification(`Product stock updated to ${newStock} units`);
      setStockInputs(prev => ({ ...prev, [id]: newStock }));
      fetchInventory();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to update stock', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || (item.sku && item.sku.toLowerCase().includes(search.toLowerCase()));
    const qty = stockInputs[item.id] !== undefined ? stockInputs[item.id] : (item.stock_quantity !== undefined ? item.stock_quantity : item.stock);
    
    if (filter === 'out_of_stock' || filter === 'out') return matchesSearch && qty <= 0;
    if (filter === 'low_stock' || filter === 'low') return matchesSearch && qty > 0 && qty <= 5;
    if (filter === 'in_stock' || filter === 'in') return matchesSearch && qty > 5;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '12px',
            backgroundColor: toast.type === 'error' ? '#EF4444' : '#10B981',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          {toast.type === 'error' ? <FiAlertCircle size={20} /> : <FiCheck size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          backgroundColor: '#1E293B',
          borderRadius: '18px',
          padding: '24px',
          border: '1px solid #334155',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 4px 0', color: '#F8FAFC' }}>
            Inventory & Warehouse Stock Control
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#94A3B8' }}>
            Monitor garment stock levels, set low-stock triggers, and mark items In/Out of Stock instantly.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            border: '1px solid #334155',
            backgroundColor: '#0F172A',
            color: '#38BDF8',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <FiRefreshCw size={15} />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#1E293B', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
            Total Garments Tracked
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F8FAFC' }}>
            {stats.total_items}
          </div>
        </div>

        <div style={{ backgroundColor: '#1E293B', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.8rem', color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
            Total Warehouse Units
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38BDF8' }}>
            {stats.total_units}
          </div>
        </div>

        <div style={{ backgroundColor: '#1E293B', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.8rem', color: '#F59E0B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
            Low Stock Warnings (≤ 5)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F59E0B' }}>
            {stats.low_stock_count}
          </div>
        </div>

        <div style={{ backgroundColor: '#1E293B', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.8rem', color: '#EF4444', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
            Out of Stock (0 Units)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#EF4444' }}>
            {stats.out_of_stock_count}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          backgroundColor: '#1E293B',
          borderRadius: '16px',
          padding: '16px 20px',
          border: '1px solid #334155',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <FiSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input
            type="text"
            placeholder="Search by garment title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              borderRadius: '10px',
              border: '1px solid #334155',
              backgroundColor: '#0F172A',
              color: '#F8FAFC',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Items' },
            { id: 'in_stock', label: 'In Stock' },
            { id: 'low_stock', label: 'Low Stock' },
            { id: 'out_of_stock', label: 'Out of Stock' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: filter === btn.id ? '1px solid #38BDF8' : '1px solid #334155',
                backgroundColor: filter === btn.id ? 'rgba(56, 189, 248, 0.15)' : '#0F172A',
                color: filter === btn.id ? '#38BDF8' : '#94A3B8',
                fontWeight: filter === btn.id ? 700 : 500,
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div
        style={{
          backgroundColor: '#1E293B',
          borderRadius: '18px',
          border: '1px solid #334155',
          overflow: 'hidden'
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #334155', borderTopColor: '#38BDF8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p>Loading inventory items...</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
            <FiPackage size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <h3 style={{ fontSize: '1.2rem', color: '#F8FAFC', marginBottom: '8px' }}>No products match this filter</h3>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 18px' }}>Product</th>
                  <th style={{ padding: '14px 18px' }}>Category</th>
                  <th style={{ padding: '14px 18px' }}>Price</th>
                  <th style={{ padding: '14px 18px' }}>Stock Status</th>
                  <th style={{ padding: '14px 18px' }}>Current Stock</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const qty = stockInputs[item.id] !== undefined ? stockInputs[item.id] : (item.stock_quantity !== undefined ? item.stock_quantity : item.stock);
                  const isOut = qty <= 0;
                  const isLow = qty > 0 && qty <= 5;
                  const isSaving = savingId === item.id;

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #334155' }}>
                      {/* Product */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <img
                            src={item.main_image || (item.images && item.images[0]) || 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=100'}
                            alt={item.name}
                            style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #334155' }}
                            onError={(e) => handleImageError(e, item.gender || 'Kids')}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#F8FAFC' }}>{item.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>SKU: {item.sku || `#KG-${item.id}`}</div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '14px 18px', color: '#94A3B8' }}>
                        {item.category_name || 'General'}
                      </td>

                      {/* Price */}
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#F8FAFC' }}>
                        {formatPKR(item.price)}
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: isOut
                              ? 'rgba(239, 68, 68, 0.15)'
                              : isLow
                              ? 'rgba(234, 179, 8, 0.15)'
                              : 'rgba(34, 197, 94, 0.15)',
                            color: isOut ? '#EF4444' : isLow ? '#EAB308' : '#22C55E'
                          }}
                        >
                          {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>

                      {/* Stock Quantity Input */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="number"
                            min="0"
                            value={stockInputs[item.id] !== undefined ? stockInputs[item.id] : ''}
                            onChange={(e) => handleStockInputChange(item.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateStock(item.id);
                            }}
                            style={{
                              width: '80px',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: isOut ? '1px solid #EF4444' : isLow ? '1px solid #EAB308' : '1px solid #334155',
                              backgroundColor: '#0F172A',
                              color: '#F8FAFC',
                              fontSize: '0.88rem',
                              fontWeight: 700,
                              outline: 'none',
                              textAlign: 'center'
                            }}
                          />

                          <button
                            onClick={() => handleUpdateStock(item.id)}
                            disabled={isSaving}
                            title="Save stock update"
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: 'none',
                              backgroundColor: '#38BDF8',
                              color: '#0F172A',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              cursor: isSaving ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <FiSave size={13} />
                            <span>{isSaving ? 'Saving' : 'Save'}</span>
                          </button>
                        </div>
                      </td>

                      {/* Quick Actions (Mark Out of Stock / In Stock) */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          {isOut ? (
                            <button
                              onClick={() => handleUpdateStock(item.id, 25)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                                color: '#22C55E',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <FiCheckCircle size={13} />
                              <span>Restock (25)</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStock(item.id, 0)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                color: '#EF4444',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <FiSlash size={13} />
                              <span>Mark Out of Stock</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInventoryPage;
