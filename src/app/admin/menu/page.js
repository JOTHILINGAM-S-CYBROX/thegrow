'use client';

import { useMenu } from '@/hooks/useMenu';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminMenuPage() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    subCategory: 'Continental',
    imageUrl: '',
    isVeg: true,
    isSpicy: false,
    isAvailable: true,
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { items, loading, error, pagination, refetch } = useMenu(page, 20, category);

  const categories = ['Soup', 'Appetizer', 'Main Course', 'Dessert', 'Drinks'];
  const subCategories = ['Indian', 'Continental', 'Asian'];

  const handleCategoryFilter = (newCategory) => {
    setCategory(newCategory === 'all' ? null : newCategory);
    setPage(1);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.success) {
        alert('Menu item added successfully');
        setFormData({
          name: '',
          description: '',
          price: '',
          category: 'Main Course',
          subCategory: 'Continental',
          imageUrl: '',
          isVeg: true,
          isSpicy: false,
          isAvailable: true,
        });
        setShowForm(false);
        refetch();
      } else {
        setFormError(data.error || 'Failed to add menu item');
      }
    } catch (error) {
      setFormError('Error adding menu item');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        alert('Menu item deleted successfully');
        refetch();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error deleting item: ${error.message}`);
    }
  };

  return (
    <div className="p-12 relative z-10 w-full max-w-7xl">
      {/* Header */}
      <header className="mb-12 flex justify-between items-end border-b border-stone-200 pb-8">
        <div>
          <h1 className="text-5xl font-serif text-primary italic leading-tight">Menu Management</h1>
          <p className="text-stone-500 font-label tracking-widest text-xs uppercase mt-3">Add, Edit & Delete Menu Items</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-emerald-800 text-white px-6 py-3 rounded-full font-label text-xs font-bold uppercase tracking-widest transition-colors"
        >
          {showForm ? '✕ Cancel' : '+ Add New Item'}
        </button>
      </header>

      {/* Add Item Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 mb-8">
          <h2 className="text-2xl font-serif italic text-primary mb-6">Add New Menu Item</h2>
          
          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg mb-6">
              {formError}
            </div>
          )}

          <form onSubmit={handleAddMenuItem} className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Item Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Truffle Grove Burger"
                  required
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleFormChange}
                  placeholder="₹0"
                  step="0.01"
                  required
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Sub Category</label>
                <select
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {subCategories.map(subCat => (
                    <option key={subCat} value={subCat}>{subCat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleFormChange}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isVeg"
                  checked={formData.isVeg}
                  onChange={(e) => setFormData(prev => ({ ...prev, isVeg: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-stone-700">Vegetarian</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isSpicy"
                  checked={formData.isSpicy}
                  onChange={(e) => setFormData(prev => ({ ...prev, isSpicy: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-stone-700">Spicy</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-stone-700">Available</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Describe the menu item..."
                required
                rows="3"
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-primary hover:bg-emerald-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Menu Item'}
            </button>
          </form>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-stone-100 p-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleCategoryFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              category === null
                ? 'bg-primary text-white'
                : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                category === cat
                  ? 'bg-primary text-white'
                  : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-rose-100 border border-rose-400 text-rose-700 px-6 py-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-stone-500">Loading menu items...</div>
        </div>
      )}

      {/* Menu Items Grid */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              {item.imageUrl && (
                <div className="aspect-video bg-stone-200 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-serif italic text-primary">{item.name}</h3>
                  <div className="flex gap-1">
                    {item.isVeg ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-green-600 bg-green-50 text-xs" title="Vegetarian">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-red-600 bg-red-50 text-xs" title="Non-Vegetarian">
                        <span className="w-1 h-2 border-r border-b border-red-600 rotate-45"></span>
                      </span>
                    )}
                    {item.isSpicy && (
                      <span className="text-sm" title="Spicy">🌶️</span>
                    )}
                    {!item.isAvailable && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Out of Stock</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="text-xs font-label bg-stone-100 text-stone-700 px-2 py-1 rounded-full">
                    {item.category}
                  </span>
                  {item.subCategory && (
                    <span className="text-xs font-label bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {item.subCategory}
                    </span>
                  )}
                </div>

                <p className="text-stone-600 text-sm mb-4 line-clamp-2">{item.description}</p>

                <div className="flex justify-between items-center">
                  <span className="text-2xl font-serif italic text-emerald-800">₹{item.price}</span>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/menu/${item._id}`}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-semibold transition"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 text-sm font-semibold transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 text-center">
          <p className="text-stone-500">No menu items found</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-4 py-2 rounded-lg transition ${
                p === page
                  ? 'bg-primary text-white'
                  : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
