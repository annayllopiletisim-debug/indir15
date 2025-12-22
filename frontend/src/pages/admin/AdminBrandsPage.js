import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../utils/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';

const AdminBrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    logo_url: '',
    description: '',
    meta_title: '',
    meta_description: '',
    app_install_enabled: false,
    ios_app_url: '',
    android_app_url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [brandsRes, catsRes] = await Promise.all([
        api.get('/brands'),
        api.get('/categories')
      ]);
      setBrands(brandsRes.data);
      setCategories(catsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/brands/${editingId}`, formData);
      } else {
        await api.post('/brands', formData);
      }
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Failed to save brand:', error);
      alert('Hata: ' + (error.response?.data?.detail || 'Marka kaydedilemedi'));
    }
  };

  const handleEdit = (brand) => {
    setFormData(brand);
    setEditingId(brand.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu mağazayı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await api.delete(`/brands/${id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete brand:', error);
      alert('Hata: Mağaza silinemedi');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      category_id: '',
      logo_url: '',
      description: '',
      meta_title: '',
      meta_description: '',
      app_install_enabled: false,
      ios_app_url: '',
      android_app_url: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="p-8">Yükleniyor...</div>;
  }

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Mağazalar - Admin Panel</title>
      </Helmet>

      <div data-testid="admin-brands-page">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-heading font-bold">Mağazalar</h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg flex items-center space-x-2"
            data-testid="add-brand-btn"
          >
            <Plus className="w-5 h-5" />
            <span>Yeni Mağaza</span>
          </button>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Mağaza adı veya slug ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-void-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple"
              data-testid="brands-search-input"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                data-testid="clear-search-btn"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {filteredBrands.length} sonuç bulundu
          </p>
        </div>

        {showForm && (
          <div className="glass-effect p-6 rounded-2xl mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingId ? 'Mağaza Düzenle' : 'Yeni Mağaza'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mağaza Adı *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 bg-void-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Slug (URL) *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full px-4 py-2 bg-void-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Kategori *</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  className="w-full px-4 py-2 bg-void-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple"
                  required
                >
                  <option value="">Seçiniz</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Logo URL</label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                  className="w-full px-4 py-2 bg-void-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-void-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Meta Title</label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({...formData, meta_title: e.target.value})}
                    className="w-full px-4 py-2 bg-void-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Meta Description</label>
                  <input
                    type="text"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                    className="w-full px-4 py-2 bg-void-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.app_install_enabled}
                  onChange={(e) => setFormData({...formData, app_install_enabled: e.target.checked})}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Uygulama İndir Sekmesi Aktif</label>
              </div>

              {formData.app_install_enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">iOS App URL</label>
                    <input
                      type="url"
                      value={formData.ios_app_url}
                      onChange={(e) => setFormData({...formData, ios_app_url: e.target.value})}
                      className="w-full px-4 py-2 bg-void-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Android App URL</label>
                    <input
                      type="url"
                      value={formData.android_app_url}
                      onChange={(e) => setFormData({...formData, android_app_url: e.target.value})}
                      className="w-full px-4 py-2 bg-void-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple"
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg"
                >
                  {editingId ? 'Güncelle' : 'Kaydet'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-void-subtle rounded-lg hover:bg-white/10"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map(brand => (
            <div key={brand.id} className="glass-effect p-6 rounded-2xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {brand.logo_url ? (
                    <img src={brand.logo_url} alt={brand.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
                      <span className="text-lg font-bold">{brand.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold">{brand.name}</h3>
                    <p className="text-xs text-muted-foreground">/{brand.slug}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(brand)}
                    className="p-2 hover:bg-white/10 rounded-lg"
                    data-testid={`edit-brand-${brand.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    className="p-2 hover:bg-destructive/20 text-destructive rounded-lg"
                    data-testid={`delete-brand-${brand.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {brand.description && (
                <p className="text-sm text-muted-foreground mb-2">{brand.description}</p>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Kategori: {categories.find(c => c.id === brand.category_id)?.name}</span>
                {brand.app_install_enabled && <span>📱 App</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminBrandsPage;
