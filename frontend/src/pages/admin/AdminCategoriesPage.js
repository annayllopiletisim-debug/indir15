import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Search, FolderTree } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { getAuthToken } from '../../utils/auth';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon_url: '',
    parent_id: '',
    is_popular: false
  });

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories`);
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name) => {
    setFormData({
      ...formData,
      name,
      slug: editingCategory ? formData.slug : generateSlug(name)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.parent_id) delete payload.parent_id;
      
      if (editingCategory) {
        await axios.put(`${API}/categories/${editingCategory.id}`, payload, {
          headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
      } else {
        await axios.post(`${API}/categories`, payload, {
          headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
      }
      setShowForm(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.detail || 'Hata oluştu');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      icon_url: category.icon_url || '',
      parent_id: category.parent_id || '',
      is_popular: category.is_popular || false
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    try {
      await axios.delete(`${API}/categories/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      fetchCategories();
    } catch (error) {
      alert('Silme işlemi başarısız');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      icon_url: '',
      parent_id: '',
      is_popular: false
    });
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getParentName = (parentId) => {
    const parent = categories.find(c => c.id === parentId);
    return parent?.name || '-';
  };

  if (loading) {
    return <div className="p-8 text-center">Yükleniyor...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Kategori Yönetimi</h1>
          <p className="text-sm text-gray-400">Toplam {categories.length} kategori</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingCategory(null); resetForm(); }}>
          <Plus className="w-4 h-4 mr-2" /> Yeni Kategori
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Kategori ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-void-paper rounded-2xl p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kategori Adı *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL Slug *</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">İkon URL</label>
                <Input
                  value={formData.icon_url}
                  onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Üst Kategori</label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full p-2 rounded-lg bg-void-subtle border border-white/10"
                >
                  <option value="">Ana Kategori</option>
                  {categories.filter(c => c.id !== editingCategory?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_popular"
                  checked={formData.is_popular}
                  onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_popular" className="text-sm">Popüler Kategori</label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingCategory ? 'Güncelle' : 'Ekle'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  İptal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-void-paper rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-void-subtle">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Kategori</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Slug</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Üst Kategori</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Durum</th>
              <th className="px-4 py-3 text-right text-sm font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredCategories.map(category => (
              <tr key={category.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
                      <FolderTree className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400">/{category.slug}</td>
                <td className="px-4 py-3 text-gray-400">{getParentName(category.parent_id)}</td>
                <td className="px-4 py-3">
                  {category.is_popular && (
                    <span className="px-2 py-1 rounded-full bg-neon-purple/20 text-neon-purple text-xs">Popüler</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(category)} className="p-2 hover:bg-white/10 rounded-lg">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(category.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCategories.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            Henüz kategori bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
