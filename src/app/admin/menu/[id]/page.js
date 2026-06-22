'use client';

import { useMenuItem } from '@/hooks/useMenu';
import { useRouter } from 'next/navigation';
import { useState, useEffect, use } from 'react';

export default function EditMenuItemPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const { item, loading, error, updateItem, deleteItem } = useMenuItem(id);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subCategory: '',
    imageUrl: '',
    isVeg: true,
    isSpicy: false,
    isAvailable: true,
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = ['Soup', 'Appetizer', 'Main Course', 'Dessert', 'Drinks'];
  const subCategories = ['Indian', 'Continental', 'Asian'];

  // Load item data into form
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        subCategory: item.subCategory || '',
        imageUrl: item.imageUrl || '',
        isVeg: item.isVeg !== undefined ? item.isVeg : true,
        isSpicy: item.isSpicy || false,
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      });
    }
  }, [item]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const result = await updateItem(formData);
      if (result) {
        alert('Menu item updated successfully');
        router.push('/admin/menu');
      }
    } catch (error) {
      setFormError('Error updating menu item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item? This cannot be undone.')) return;

    const success = await deleteItem();
    if (success) {
      alert('Menu item deleted successfully');
      router.push('/admin/menu');
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center items-center h-64">
        <div className="text-stone-500">Loading menu item...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-12">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-lg">
          Menu item not found
        </div>
        <button
          onClick={() => router.push('/admin/menu')}
          className="mt-4 bg-primary text-white px-6 py-2 rounded-lg"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="p-12 relative z-10 w-full max-w-3xl">
      {/* Header */}
      <header className="mb-12 border-b border-stone-200 pb-8">
        <button
          onClick={() => router.push('/admin/menu')}
          className="text-primary hover:text-emerald-800 mb-4 text-sm font-semibold"
        >
          ← Back to Menu
        </button>
        <h1 className="text-5xl font-serif text-primary italic leading-tight">Edit Menu Item</h1>
      </header>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {formError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-lg mb-6">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Item Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
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
                <option value="">Select a category</option>
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
                <option value="">Select sub category</option>
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
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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

          {formData.imageUrl && (
            <div className="mt-4">
              <label className="block text-sm font-semibold text-stone-700 mb-2">Image Preview</label>
              <div className="w-32 h-32 rounded-xl overflow-hidden border border-stone-300">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              required
              rows="4"
              className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t border-stone-200">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary hover:bg-emerald-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-3 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl font-semibold transition-colors"
            >
              Delete Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
