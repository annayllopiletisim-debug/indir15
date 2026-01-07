'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Folder } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    order: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchCategories();
        resetForm();
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      order: category.order || 0,
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istedi\u011finizden emin misiniz?')) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', icon: '', order: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[\u0131\u0130]/g, 'i')
      .replace(/[\u011f\u011e]/g, 'g')
      .replace(/[\u00fc\u00dc]/g, 'u')
      .replace(/[\u015f\u015e]/g, 's')
      .replace(/[\u00f6\u00d6]/g, 'o')
      .replace(/[\u00e7\u00c7]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Kategoriler</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"
        >
          <Plus className="w-5 h-5" />
          Yeni Kategori
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Kategori D\u00fczenle' : 'Yeni Kategori'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Kategori Ad\u0131 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({
                  ...formData,
                  name: e.target.value,
                  slug: generateSlug(e.target.value),
                })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1">A\u00e7\u0131klama</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">\u0130kon (emoji veya icon ad\u0131)</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="\u00f6rn: shopping-bag, gift, percent"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">S\u0131ra</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                {editingId ? 'G\u00fcncelle' : 'Kaydet'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
                \u0130ptal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">\u0130kon</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Ad</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Slug</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">S\u0131ra</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">\u0130\u015flemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-slate-700/50">
                <td className="px-4 py-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">
                    {category.icon || <Folder className="w-5 h-5" />}
                  </div>
                </td>
                <td className="px-4 py-3 text-white font-medium">{category.name}</td>
                <td className="px-4 py-3 text-gray-400">{category.slug}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-slate-600 rounded text-sm text-gray-300">
                    {category.order || 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(category)} className="p-2 text-gray-400 hover:text-white">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(category.id)} className="p-2 text-gray-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
