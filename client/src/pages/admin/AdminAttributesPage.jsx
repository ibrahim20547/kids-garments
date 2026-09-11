import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import {
  FiPlus, FiTrash2, FiTag, FiCheck, FiAlertCircle, FiScissors
} from 'react-icons/fi';

const AdminAttributesPage = () => {
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Size Form
  const [newSizeName, setNewSizeName] = useState('');
  const [newSizeCategory, setNewSizeCategory] = useState('');
  const [sizeLoading, setSizeLoading] = useState(false);

  // Color Form
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#4f46e5');
  const [colorLoading, setColorLoading] = useState(false);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAttributes();
      setSizes(res.data?.sizes || []);
      setColors(res.data?.colors || []);
    } catch (err) {
      showNotification('Failed to fetch sizes and colors', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleAddSize = async (e) => {
    e.preventDefault();
    if (!newSizeName.trim()) return;

    try {
      setSizeLoading(true);
      await adminApi.addSize({
        name: newSizeName.trim(),
        category: newSizeCategory.trim() || undefined
      });
      setNewSizeName('');
      setNewSizeCategory('');
      showNotification('Size added successfully');
      fetchAttributes();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to add size', 'error');
    } finally {
      setSizeLoading(false);
    }
  };

  const handleDeleteSize = async (id, name) => {
    if (window.confirm(`Delete size "${name}"?`)) {
      try {
        await adminApi.deleteSize(id);
        showNotification('Size deleted');
        fetchAttributes();
      } catch (err) {
        showNotification('Failed to delete size', 'error');
      }
    }
  };

  const handleAddColor = async (e) => {
    e.preventDefault();
    if (!newColorName.trim()) return;

    try {
      setColorLoading(true);
      await adminApi.addColor({
        name: newColorName.trim(),
        hex_code: newColorHex
      });
      setNewColorName('');
      setNewColorHex('#4f46e5');
      showNotification('Color added successfully');
      fetchAttributes();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to add color', 'error');
    } finally {
      setColorLoading(false);
    }
  };

  const handleDeleteColor = async (id, name) => {
    if (window.confirm(`Delete color "${name}"?`)) {
      try {
        await adminApi.deleteColor(id);
        showNotification('Color deleted');
        fetchAttributes();
      } catch (err) {
        showNotification('Failed to delete color', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 text-sm font-medium ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {toast.type === 'error' ? <FiAlertCircle /> : <FiCheck />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Sizes & Colors Master Library</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage master size tags and color swatches available when creating or editing kids garments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sizes Management */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
            <FiScissors className="text-indigo-600 w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-800">Master Sizes</h2>
          </div>

          {/* Add Size Form */}
          <form onSubmit={handleAddSize} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              placeholder="e.g. 5-6 Years / 28"
              value={newSizeName}
              onChange={(e) => setNewSizeName(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={sizeLoading}
              className="flex items-center justify-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition disabled:opacity-50 shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Size</span>
            </button>
          </form>

          {/* Sizes List */}
          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm">Loading sizes...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {sizes.map((sz) => (
                <div
                  key={sz.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-slate-300 transition"
                >
                  <span className="font-semibold text-slate-700 text-xs truncate">{sz.name}</span>
                  <button
                    onClick={() => handleDeleteSize(sz.id, sz.name)}
                    className="text-slate-400 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition"
                    title="Delete Size"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colors Management */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
            <FiTag className="text-pink-600 w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-800">Master Colors</h2>
          </div>

          {/* Add Color Form */}
          <form onSubmit={handleAddColor} className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                title="Choose Color Swatch"
              />
              <input
                type="text"
                required
                placeholder="Color Name (e.g. Royal Blue)"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                className="flex-1 sm:w-48 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
            <button
              type="submit"
              disabled={colorLoading}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition disabled:opacity-50 shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Color</span>
            </button>
          </form>

          {/* Colors List */}
          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm">Loading colors...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {colors.map((col) => (
                <div
                  key={col.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 group hover:border-slate-300 transition"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span
                      className="w-5 h-5 rounded-full border border-black/10 flex-shrink-0"
                      style={{ backgroundColor: col.hex_code }}
                    />
                    <span className="font-semibold text-slate-700 text-xs truncate">{col.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteColor(col.id, col.name)}
                    className="text-slate-400 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0"
                    title="Delete Color"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAttributesPage;
