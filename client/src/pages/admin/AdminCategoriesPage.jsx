import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../../services/api';
import {
  FiPlus, FiEdit2, FiTrash2, FiFolder, FiCheck, FiAlertCircle, FiX, FiLayers,
  FiUpload, FiSearch, FiCheckCircle
} from 'react-icons/fi';
import { handleImageError } from '../../utils/imageUtils';

const GENDERS = ['Unisex', 'Boys', 'Girls', 'Baby'];

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);

  const initialForm = {
    name: '',
    slug: '',
    description: '',
    image_url: '',
    gender: 'Unisex',
    is_active: true,
    sort_order: 0
  };

  const [formData, setFormData] = useState(initialForm);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCategories();
      setCategories(res.data?.categories || []);
    } catch (err) {
      showNotification('Failed to fetch categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug || '',
      description: cat.description || '',
      image_url: cat.image_url || '',
      gender: cat.gender || 'Unisex',
      is_active: cat.is_active !== undefined ? !!cat.is_active : true,
      sort_order: cat.sort_order || 0
    });
    setShowModal(true);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    if (!editingCategory) {
      setFormData(prev => ({
        ...prev,
        name,
        slug: generateSlug(name)
      }));
    } else {
      setFormData(prev => ({ ...prev, name }));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const res = await adminApi.uploadImage(file);
      const uploadedUrl = res.data?.url;
      if (uploadedUrl) {
        setFormData(prev => ({ ...prev, image_url: uploadedUrl }));
        showNotification('Category image uploaded successfully!');
      }
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to upload category image', 'error');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showNotification('Category name is required', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || generateSlug(formData.name),
        description: formData.description.trim(),
        image_url: formData.image_url.trim() || 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400',
        gender: formData.gender,
        is_active: formData.is_active ? 1 : 0,
        sort_order: parseInt(formData.sort_order, 10) || 0
      };

      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, payload);
        showNotification('Category updated successfully!');
      } else {
        await adminApi.createCategory(payload);
        showNotification('New category added to store successfully!');
      }

      setShowModal(false);
      fetchCategories();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to save category', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;
    try {
      setActionLoading(true);
      await adminApi.deleteCategory(deletingCategory.id);
      showNotification(`Category "${deletingCategory.name}" deleted successfully`);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to delete category', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
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
            Store Categories Management
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#94A3B8' }}>
            Manage main departments (Boys, Girls, Baby, etc.) and garment types across your storefront.
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
          <span>Add New Category</span>
        </button>
      </div>

      {/* Search Bar */}
      <div
        style={{
          backgroundColor: '#1E293B',
          borderRadius: '16px',
          padding: '16px 20px',
          border: '1px solid #334155',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <FiSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input
            type="text"
            placeholder="Search categories by name or description..."
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
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #334155', borderTopColor: '#38BDF8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p>Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div
          style={{
            backgroundColor: '#1E293B',
            borderRadius: '18px',
            padding: '60px 20px',
            textAlign: 'center',
            border: '1px solid #334155',
            color: '#94A3B8'
          }}
        >
          <FiFolder size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.2rem', color: '#F8FAFC', marginBottom: '8px' }}>No categories found</h3>
          <p style={{ fontSize: '0.88rem' }}>Create a new category above to organize your catalog.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredCategories.map((cat) => {
            const isActive = cat.is_active !== undefined ? !!cat.is_active : true;

            return (
              <div
                key={cat.id}
                style={{
                  backgroundColor: '#1E293B',
                  borderRadius: '16px',
                  border: '1px solid #334155',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                {/* Category Cover Image */}
                <div style={{ height: '140px', position: 'relative', overflow: 'hidden', backgroundColor: '#0F172A' }}>
                  <img
                    src={cat.image_url || 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400'}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => handleImageError(e, cat.gender || 'Kids')}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: isActive ? 'rgba(34, 197, 94, 0.9)' : 'rgba(100, 116, 139, 0.9)',
                      color: '#FFFFFF'
                    }}
                  >
                    {isActive ? 'Active' : 'Disabled'}
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      color: '#38BDF8'
                    }}
                  >
                    {cat.gender || 'Unisex'}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F8FAFC', margin: '0 0 6px 0' }}>
                      {cat.name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '10px' }}>
                      Slug: <code style={{ color: '#38BDF8', backgroundColor: '#0F172A', padding: '2px 6px', borderRadius: '4px' }}>/{cat.slug}</code>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: 0, lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {cat.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #334155' }}>
                    <button
                      onClick={() => openEditModal(cat)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#334155',
                        color: '#38BDF8',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 600
                      }}
                    >
                      <FiEdit2 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingCategory(cat)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        color: '#EF4444',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 600
                      }}
                    >
                      <FiTrash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
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
              maxWidth: '560px',
              backgroundColor: '#1E293B',
              borderRadius: '20px',
              border: '1px solid #334155',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#F8FAFC' }}>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '6px' }}
              >
                <FiX size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Kids Shalwar Kameez, Boys, Girls..."
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

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="kids-shalwar-kameez"
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
                    Target Department
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
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                  Category Description
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description shown in category overview..."
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

              {/* Category Image Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                  Category Banner Image
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://... or upload local file"
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      backgroundColor: '#0F172A',
                      color: '#F8FAFC',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />

                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      backgroundColor: '#38BDF8',
                      color: '#0F172A',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      border: 'none',
                      cursor: uploadingImage ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FiUpload size={16} />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                  </button>
                </div>
              </div>

              {/* Active Toggle */}
              <div style={{ padding: '12px 14px', backgroundColor: '#0F172A', borderRadius: '10px', border: '1px solid #334155' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', color: '#F8FAFC' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#22C55E' }}
                  />
                  <span>Enable category on public website</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
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
                  {actionLoading ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
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
              Delete Category?
            </h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.88rem', color: '#94A3B8', lineHeight: '1.5' }}>
              Are you sure you want to delete <strong>"{deletingCategory.name}"</strong>? Any products currently assigned to this category will become unassigned.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
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
    </div>
  );
};

export default AdminCategoriesPage;
