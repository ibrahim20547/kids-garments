import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../../services/api';
import { formatPKR } from '../../utils/currency';
import { handleImageError } from '../../utils/imageUtils';
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiCheck, FiX,
  FiFilter, FiAlertCircle, FiImage, FiLayers, FiRefreshCw,
  FiUpload, FiStar, FiChevronLeft, FiChevronRight, FiSliders
} from 'react-icons/fi';

const GENDERS = ['Unisex', 'Boys', 'Girls', 'Baby'];
const AGE_GROUPS = ['0-6M', '6-12M', '1-2Y', '2-4Y', '5-7Y', '8-12Y', '13-16Y'];

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizesList, setSizesList] = useState([]);
  const [colorsList, setColorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Controls
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals & Action States
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);

  const initialForm = {
    name: '',
    sku: '',
    description: '',
    features: '',
    category_id: '',
    gender: 'Unisex',
    age_group: '2-4Y',
    brand: 'Kids Garments',
    price: '',
    sale_price: '',
    stock_quantity: 50,
    low_stock_threshold: 5,
    status: 'active',
    is_featured: false,
    is_new: true,
    main_image: '',
    images: [''],
    sizes: [],
    colors: []
  };

  const [formData, setFormData] = useState(initialForm);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, attrRes] = await Promise.all([
        adminApi.getProducts({
          search: search || undefined,
          category_id: selectedCategory || undefined,
          stock_status: stockFilter || undefined,
          status: statusFilter || undefined
        }),
        adminApi.getCategories(),
        adminApi.getAttributes()
      ]);

      setProducts(prodRes.data?.products || []);
      setCategories(catRes.data?.categories || []);
      setSizesList(attrRes.data?.sizes || []);
      setColorsList(attrRes.data?.colors || []);
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, stockFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData();
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      ...initialForm,
      category_id: categories.length > 0 ? categories[0].id : '',
      sizes: sizesList.slice(0, 3).map(s => s.name),
      colors: colorsList.slice(0, 2).map(c => c.name)
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    
    // Normalize sizes and colors
    const normSizes = (product.sizes || []).map(s => (typeof s === 'object' ? s.size_name || s.size : s));
    const normColors = (product.colors || []).map(c => (typeof c === 'object' ? c.color_name || c.name : c));
    const galleryImages = (product.images && product.images.length > 0)
      ? product.images
      : (product.main_image ? [product.main_image] : ['']);

    setFormData({
      name: product.name,
      sku: product.sku || '',
      description: product.description || '',
      features: product.fabric_care || product.features || '',
      category_id: product.category_id || (categories.length > 0 ? categories[0].id : ''),
      gender: product.gender || 'Unisex',
      age_group: product.age_group || '2-4Y',
      brand: product.brand || 'Kids Garments',
      price: product.price,
      sale_price: product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : '',
      stock_quantity: product.stock_quantity !== undefined ? product.stock_quantity : (product.stock || 0),
      low_stock_threshold: product.low_stock_threshold || 5,
      status: product.status || (product.is_active ? 'active' : 'inactive'),
      is_featured: !!product.is_featured,
      is_new: !!product.is_new,
      main_image: product.main_image || '',
      images: galleryImages,
      sizes: normSizes,
      colors: normColors
    });
    setShowModal(true);
  };

  // Image Upload Handlers
  const handleMainFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const res = await adminApi.uploadImage(file);
      const uploadedUrl = res.data?.url;
      if (uploadedUrl) {
        setFormData(prev => ({
          ...prev,
          main_image: uploadedUrl,
          images: prev.images[0] === '' ? [uploadedUrl] : [uploadedUrl, ...prev.images.filter(img => img !== uploadedUrl)]
        }));
        showNotification('Main product image uploaded successfully!');
      }
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to upload image', 'error');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGalleryFileUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const res = await adminApi.uploadImage(file);
      const uploadedUrl = res.data?.url;
      if (uploadedUrl) {
        const updated = [...formData.images];
        updated[index] = uploadedUrl;
        setFormData(prev => ({
          ...prev,
          images: updated,
          main_image: prev.main_image || uploadedUrl
        }));
        showNotification('Gallery image uploaded successfully!');
      }
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to upload image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageChange = (index, value) => {
    const updated = [...formData.images];
    updated[index] = value;
    setFormData(prev => ({
      ...prev,
      images: updated,
      main_image: prev.main_image || (index === 0 ? value : prev.main_image)
    }));
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index) => {
    const updated = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: updated.length > 0 ? updated : [''] }));
  };

  const toggleSize = (sizeName) => {
    const exists = formData.sizes.includes(sizeName);
    setFormData(prev => ({
      ...prev,
      sizes: exists ? prev.sizes.filter(s => s !== sizeName) : [...prev.sizes, sizeName]
    }));
  };

  const toggleColor = (colorName) => {
    const exists = formData.colors.includes(colorName);
    setFormData(prev => ({
      ...prev,
      colors: exists ? prev.colors.filter(c => c !== colorName) : [...prev.colors, colorName]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      showNotification('Product Name and Price are required', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const cleanImages = formData.images.filter(img => img && img.trim() !== '');
      const mainImg = formData.main_image.trim() || (cleanImages.length > 0 ? cleanImages[0] : '');

      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim() || undefined,
        category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
        gender: formData.gender,
        age_group: formData.age_group,
        brand: formData.brand || 'Kids Garments',
        description: formData.description.trim(),
        fabric_care: formData.features.trim(),
        price: parseFloat(formData.price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        stock_quantity: parseInt(formData.stock_quantity, 10) || 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold, 10) || 5,
        status: formData.status,
        is_featured: !!formData.is_featured,
        is_new: !!formData.is_new,
        main_image: mainImg,
        images: cleanImages.length > 0 ? cleanImages : [mainImg],
        sizes: formData.sizes,
        colors: formData.colors
      };

      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, payload);
        showNotification('Product updated successfully!');
      } else {
        await adminApi.createProduct(payload);
        showNotification('New product added to catalog successfully!');
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to save product', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      setActionLoading(true);
      await adminApi.deleteProduct(deletingProduct.id);
      showNotification(`"${deletingProduct.name}" permanently deleted`);
      setDeletingProduct(null);
      fetchData();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to delete product', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Sorting
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'stock_asc') return (a.stock_quantity || 0) - (b.stock_quantity || 0);
    return (b.id || 0) - (a.id || 0); // newest
  });

  // Pagination calculation
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

      {/* Header & Controls */}
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
            Products Catalog Management
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#94A3B8' }}>
            Add, update, or remove garments, manage PKR pricing, stock levels, variants, and gallery media.
          </p>
        </div>

        <button
          onClick={openAddModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 22px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(236, 72, 153, 0.35)'
          }}
        >
          <FiPlus size={18} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          backgroundColor: '#1E293B',
          borderRadius: '16px',
          padding: '18px 20px',
          border: '1px solid #334155',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, minWidth: '240px', position: 'relative' }}>
          <FiSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input
            type="text"
            placeholder="Search by title, SKU, or tags..."
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
        </form>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #334155',
              backgroundColor: '#0F172A',
              color: '#F8FAFC',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #334155',
              backgroundColor: '#0F172A',
              color: '#F8FAFC',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Stock Levels</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock (≤ 5)</option>
            <option value="out">Out of Stock (0)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #334155',
              backgroundColor: '#0F172A',
              color: '#F8FAFC',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active (Published)</option>
            <option value="inactive">Inactive (Hidden)</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #334155',
              backgroundColor: '#0F172A',
              color: '#F8FAFC',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="newest">Sort: Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="stock_asc">Stock: Low to High</option>
          </select>
        </div>
      </div>

      {/* Product List Table */}
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
            <p>Loading garments catalog...</p>
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
            <FiLayers size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <h3 style={{ fontSize: '1.2rem', color: '#F8FAFC', marginBottom: '8px' }}>No products found</h3>
            <p style={{ fontSize: '0.88rem' }}>Try clearing filters or add your first product using the button above.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 18px' }}>Product</th>
                  <th style={{ padding: '14px 18px' }}>Category</th>
                  <th style={{ padding: '14px 18px' }}>Price (PKR)</th>
                  <th style={{ padding: '14px 18px' }}>Stock</th>
                  <th style={{ padding: '14px 18px' }}>Badges</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((p) => {
                  const stockQty = p.stock_quantity !== undefined ? p.stock_quantity : (p.stock || 0);
                  const isOut = stockQty <= 0;
                  const isLow = stockQty > 0 && stockQty <= (p.low_stock_threshold || 5);

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #334155' }}>
                      {/* Product Name & Image */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <img
                            src={p.main_image || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=100'}
                            alt={p.name}
                            style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #334155', flexShrink: 0 }}
                            onError={(e) => handleImageError(e, p.gender || 'Kids')}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '0.92rem' }}>{p.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                              <span>SKU: {p.sku || `#KG-${p.id}`}</span>
                              <span>•</span>
                              <span>{p.gender || 'Unisex'}</span>
                              <span>•</span>
                              <span>{p.age_group || 'All Ages'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '14px 18px', color: '#94A3B8', fontWeight: 500 }}>
                        {p.category_name || categories.find(c => c.id === p.category_id)?.name || 'General'}
                      </td>

                      {/* Price */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#F8FAFC' }}>
                          {formatPKR(p.price)}
                        </div>
                        {p.sale_price && p.sale_price < p.price && (
                          <div style={{ fontSize: '0.75rem', color: '#EC4899', textDecoration: 'line-through' }}>
                            Sale: {formatPKR(p.sale_price)}
                          </div>
                        )}
                      </td>

                      {/* Stock */}
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
                          {isOut ? 'Out of Stock (0)' : isLow ? `Low Stock (${stockQty})` : `In Stock (${stockQty})`}
                        </span>
                      </td>

                      {/* Badges */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {p.is_featured ? (
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '8px', backgroundColor: 'rgba(236, 72, 153, 0.2)', color: '#F472B6' }}>
                              Featured
                            </span>
                          ) : null}
                          {p.is_new ? (
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8' }}>
                              New Arrival
                            </span>
                          ) : null}
                          {!p.is_featured && !p.is_new && <span style={{ color: '#64748B', fontSize: '0.75rem' }}>—</span>}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: p.status === 'active' || p.is_active ? '#22C55E' : '#94A3B8'
                          }}
                        >
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: p.status === 'active' || p.is_active ? '#22C55E' : '#64748B' }} />
                          {p.status === 'active' || p.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => openEditModal(p)}
                            title="Edit Product Details"
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              backgroundColor: '#334155',
                              color: '#38BDF8',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(p)}
                            title="Delete Product"
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(239, 68, 68, 0.15)',
                              color: '#EF4444',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid #334155',
              backgroundColor: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              color: '#94A3B8'
            }}
          >
            <div>
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({sortedProducts.length} total garments)
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#1E293B',
                  color: '#F8FAFC',
                  border: '1px solid #334155',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#1E293B',
                  color: '#F8FAFC',
                  border: '1px solid #334155',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9000,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '750px',
              maxHeight: '90vh',
              backgroundColor: '#1E293B',
              borderRadius: '20px',
              border: '1px solid #334155',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#F8FAFC' }}>
                  {editingProduct ? 'Edit Product Details' : 'Add New Kids Garment'}
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94A3B8' }}>
                  Complete the fields below to sync changes with the public storefront and database.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '6px' }}
              >
                <FiX size={22} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Row 1: Name & SKU */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Boys Festive Cotton Kurta Set"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      backgroundColor: '#0F172A',
                      color: '#F8FAFC',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                    SKU / Article #
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    placeholder="e.g. KG-KURTA-01"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      backgroundColor: '#0F172A',
                      color: '#F8FAFC',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Row 2: Category, Gender, Age Group, Brand */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      backgroundColor: '#0F172A',
                      color: '#F8FAFC',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                    Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      backgroundColor: '#0F172A',
                      color: '#F8FAFC',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  >
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                    Age Group *
                  </label>
                  <select
                    value={formData.age_group}
                    onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      backgroundColor: '#0F172A',
                      color: '#F8FAFC',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  >
                    {AGE_GROUPS.map((ag) => (
                      <option key={ag} value={ag}>{ag}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Kids Garments"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      backgroundColor: '#0F172A',
                      color: '#F8FAFC',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Row 3: Pricing & Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                    Price (PKR ₨) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="2499"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      backgroundColor: '#0F172A',
                      color: '#F8FAFC',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                    Discount Price (PKR ₨)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                    placeholder="Optional (e.g. 1999)"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      backgroundColor: '#0F172A',
                      color: '#F8FAFC',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    placeholder="50"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      backgroundColor: '#0F172A',
                      color: '#F8FAFC',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                    Low Stock Alert At
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                    placeholder="5"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      backgroundColor: '#0F172A',
                      color: '#F8FAFC',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Main Product Image Upload & URL */}
              <div style={{ backgroundColor: '#0F172A', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '8px' }}>
                  Main Product Image *
                </label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    required
                    value={formData.main_image}
                    onChange={(e) => setFormData({ ...formData, main_image: e.target.value })}
                    placeholder="https://images.unsplash.com/... or upload local file"
                    style={{
                      flex: 1,
                      minWidth: '220px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      backgroundColor: '#1E293B',
                      color: '#F8FAFC',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleMainFileUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />

                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      backgroundColor: '#38BDF8',
                      color: '#0F172A',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      border: 'none',
                      cursor: uploadingImage ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <FiUpload size={16} />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                  </button>

                  {formData.main_image && (
                    <img
                      src={formData.main_image}
                      alt="preview"
                      style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #38BDF8' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>
              </div>

              {/* Multiple Gallery Images */}
              <div style={{ backgroundColor: '#0F172A', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F8FAFC' }}>
                    Gallery Images (Multiple Photos)
                  </label>
                  <button
                    type="button"
                    onClick={addImageField}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'none',
                      border: 'none',
                      color: '#38BDF8',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <FiPlus size={14} /> Add Another Photo
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {formData.images.map((imgUrl, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={imgUrl}
                        onChange={(e) => handleImageChange(idx, e.target.value)}
                        placeholder={`Gallery Image #${idx + 1} URL`}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #334155',
                          backgroundColor: '#1E293B',
                          color: '#F8FAFC',
                          fontSize: '0.82rem',
                          outline: 'none'
                        }}
                      />

                      <label
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#334155',
                          color: '#F8FAFC',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <FiUpload size={13} />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleGalleryFileUpload(e, idx)}
                        />
                      </label>

                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt="preview"
                          style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : null}

                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(idx)}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '6px' }}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sizes Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '8px' }}>
                  Available Sizes
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {sizesList.map((sz) => {
                    const isSelected = formData.sizes.includes(sz.name);
                    return (
                      <button
                        type="button"
                        key={sz.id || sz.name}
                        onClick={() => toggleSize(sz.name)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: isSelected ? '1px solid #38BDF8' : '1px solid #334155',
                          backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.2)' : '#0F172A',
                          color: isSelected ? '#38BDF8' : '#94A3B8',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {sz.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '8px' }}>
                  Available Colors
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {colorsList.map((col) => {
                    const isSelected = formData.colors.includes(col.name);
                    return (
                      <button
                        type="button"
                        key={col.id || col.name}
                        onClick={() => toggleColor(col.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: isSelected ? '1px solid #EC4899' : '1px solid #334155',
                          backgroundColor: isSelected ? 'rgba(236, 72, 153, 0.2)' : '#0F172A',
                          color: isSelected ? '#F472B6' : '#94A3B8',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: col.hex_code || col.color_hex || '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
                        <span>{col.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description & Features */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                  Product Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed product information for customers..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #334155',
                    backgroundColor: '#0F172A',
                    color: '#F8FAFC',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                  Product Features & Fabric Care
                </label>
                <input
                  type="text"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="e.g. 100% Breathable Cotton • Machine Wash Gentle • Made in Pakistan"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #334155',
                    backgroundColor: '#0F172A',
                    color: '#F8FAFC',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Toggles: Featured, New Arrival, Status */}
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', padding: '14px', backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#F8FAFC' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#EC4899' }}
                  />
                  <span>Featured on Homepage</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#F8FAFC' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_new}
                    onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#38BDF8' }}
                  />
                  <span>Mark as New Arrival</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#F8FAFC' }}>
                  <input
                    type="checkbox"
                    checked={formData.status === 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })}
                    style={{ width: '16px', height: '16px', accentColor: '#22C55E' }}
                  />
                  <span>Published / Active on Storefront</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px', borderTop: '1px solid #334155' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    backgroundColor: '#334155',
                    color: '#F8FAFC',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(236, 72, 153, 0.35)'
                  }}
                >
                  {actionLoading ? 'Saving Product...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#1E293B',
              borderRadius: '20px',
              border: '1px solid #334155',
              padding: '28px',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <FiTrash2 size={28} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px 0', color: '#F8FAFC' }}>
              Permanently Delete Product?
            </h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.88rem', color: '#94A3B8', lineHeight: '1.5' }}>
              Are you sure you want to delete <strong>"{deletingProduct.name}"</strong>? This will permanently remove it from the catalog and customer storefront.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  backgroundColor: '#334155',
                  color: '#F8FAFC',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={confirmDelete}
                style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: actionLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminProductsPage;
