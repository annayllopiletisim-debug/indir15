'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, Loader2, Upload, Search, Filter, X, Image, RefreshCw } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  default_deal_image?: string;
  website_url?: string;
  affiliate_url?: string;
  category_ids?: string[];
  is_featured?: boolean;
  deal_count?: number;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingDealImage, setUploadingDealImage] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'yes' | 'no'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'deal_count' | 'newest'>('name');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo_url: '',
    default_deal_image: '',
    website_url: '',
    affiliate_url: '',
    category_ids: [] as string[],
    is_featured: false,
  });

  const [migrationStatus, setMigrationStatus] = useState<{ brandsWithoutCategories: number; totalBrands: number } | null>(null);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    fetchData();
    fetchMigrationStatus();
  }, []);

  const fetchMigrationStatus = async () => {
    try {
      const res = await fetch('/api/admin/migrate-brand-categories');
      const data = await res.json();
      setMigrationStatus(data);
    } catch (err) {
      console.error('Error fetching migration status:', err);
    }
  };

  const runMigration = async () => {
    if (!confirm('Kategorisi olmayan mağazaları otomatik olarak kategorilere atamak istiyor musunuz?')) return;
    setMigrating(true);
    try {
      const res = await fetch('/api/admin/migrate-brand-categories', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer admin' },
      });
      const data = await res.json();
      alert(`Migration tamamlandı: ${data.results?.brandsUpdated || 0} mağaza güncellendi`);
      fetchData();
      fetchMigrationStatus();
    } catch (err) {
      console.error('Migration error:', err);
      alert('Migration hatası oluştu');
    } finally {
      setMigrating(false);
    }
  };

  // Filtered and sorted brands
  const filteredBrands = useMemo(() => {
    let result = [...brands];
    
    // Search filter
    if (searchTerm) {
      result = result.filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Featured filter
    if (filterFeatured === 'yes') {
      result = result.filter(b => b.is_featured);
    } else if (filterFeatured === 'no') {
      result = result.filter(b => !b.is_featured);
    }

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter(b => b.category_ids?.includes(filterCategory));
    }
    
    // Sort
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'deal_count') {
      result.sort((a, b) => (b.deal_count || 0) - (a.deal_count || 0));
    }
    
    return result;
  }, [brands, searchTerm, filterFeatured, filterCategory, sortBy]);

  const fetchData = async () => {
    try {
      const [brandsRes, categoriesRes] = await Promise.all([
        fetch('/api/brands'),
        fetch('/api/categories')
      ]);
      const [brandsData, categoriesData] = await Promise.all([
        brandsRes.json(),
        categoriesRes.json()
      ]);
      setBrands(brandsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/brands/${editingId}` : '/api/brands';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchData();
        resetForm();
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleEdit = (brand: Brand) => {
    setFormData({
      name: brand.name,
      slug: brand.slug,
      description: brand.description || '',
      logo_url: brand.logo_url || '',
      default_deal_image: brand.default_deal_image || '',
      website_url: brand.website_url || '',
      affiliate_url: brand.affiliate_url || '',
      category_ids: brand.category_ids || [],
      is_featured: brand.is_featured || false,
    });
    setEditingId(brand.id);
    setShowForm(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData({ ...formData, logo_url: data.url });
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDealImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDealImage(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData({ ...formData, default_deal_image: data.url });
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploadingDealImage(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategoryIds = formData.category_ids.includes(categoryId)
      ? formData.category_ids.filter(id => id !== categoryId)
      : [...formData.category_ids, categoryId];
    setFormData({ ...formData, category_ids: newCategoryIds });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu mağazayı silmek istediğinizden emin misiniz?')) return;
    try {
      await fetch(`/api/brands/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', logo_url: '', default_deal_image: '', website_url: '', affiliate_url: '', category_ids: [], is_featured: false });
    setEditingId(null);
    setShowForm(false);
  };

  const getCategoryNames = (categoryIds: string[] | undefined) => {
    if (!categoryIds || categoryIds.length === 0) return '-';
    return categoryIds.map(id => categories.find(c => c.id === id)?.name || '').filter(Boolean).join(', ');
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[ıİ]/g, 'i').replace(/[ğĞ]/g, 'g').replace(/[üÜ]/g, 'u')
      .replace(/[şŞ]/g, 's').replace(/[öÖ]/g, 'o').replace(/[çÇ]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterFeatured('all');
    setFilterCategory('all');
    setSortBy('name');
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
        <h1 className="text-2xl font-bold text-white">Mağazalar ({brands.length})</h1>
        <div className="flex items-center gap-3">
          {migrationStatus && migrationStatus.brandsWithoutCategories > 0 && (
            <button
              onClick={runMigration}
              disabled={migrating}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg flex items-center gap-2 hover:bg-amber-700 disabled:opacity-50"
              title={`${migrationStatus.brandsWithoutCategories} mağaza kategorisiz`}
            >
              {migrating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
              Kategori Ata ({migrationStatus.brandsWithoutCategories})
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"
          >
            <Plus className="w-5 h-5" />
            Yeni Mağaza
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Mağaza ara..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={filterFeatured}
            onChange={(e) => setFilterFeatured(e.target.value as any)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            <option value="all">Tüm Mağazalar</option>
            <option value="yes">Öne Çıkanlar</option>
            <option value="no">Normal</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            <option value="name">Ada Göre</option>
            <option value="deal_count">Fırsat Sayısına Göre</option>
          </select>
          {(searchTerm || filterFeatured !== 'all' || filterCategory !== 'all' || sortBy !== 'name') && (
            <button onClick={clearFilters} className="p-2 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="mt-2 text-sm text-gray-400">
          {filteredBrands.length} sonuç gösteriliyor
        </div>
      </div>

      {showForm && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Mağaza Düzenle' : 'Yeni Mağaza'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Mağaza Adı *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })}
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
              <label className="block text-sm text-gray-400 mb-1">Açıklama</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                rows={2}
              />
            </div>

            {/* Categories */}
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Kategoriler</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      formData.category_ids.includes(category.id)
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Logo</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="URL veya yükle"
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
                <label className="px-4 py-2 bg-slate-600 text-white rounded-lg cursor-pointer hover:bg-slate-500 flex items-center gap-2">
                  {uploading ? '...' : <Upload className="w-4 h-4" />}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploading} />
                </label>
              </div>
              {formData.logo_url && (
                <img src={formData.logo_url} alt="Logo önizleme" className="mt-2 w-16 h-16 object-contain rounded bg-white p-1" />
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Varsayılan İndirim Görseli</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.default_deal_image}
                  onChange={(e) => setFormData({ ...formData, default_deal_image: e.target.value })}
                  placeholder="URL veya yükle"
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
                <label className="px-4 py-2 bg-slate-600 text-white rounded-lg cursor-pointer hover:bg-slate-500 flex items-center gap-2">
                  {uploadingDealImage ? '...' : <Image className="w-4 h-4" />}
                  <input type="file" accept="image/*" onChange={handleDealImageUpload} className="hidden" disabled={uploadingDealImage} />
                </label>
              </div>
              {formData.default_deal_image && (
                <img src={formData.default_deal_image} alt="Görsel önizleme" className="mt-2 w-24 h-16 object-cover rounded" />
              )}
              <p className="text-xs text-gray-500 mt-1">İndirim kartlarında özel görsel yoksa bu görsel kullanılır</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Website URL</label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Affiliate URL</label>
              <input
                type="url"
                value={formData.affiliate_url}
                onChange={(e) => setFormData({ ...formData, affiliate_url: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                Öne Çıkan Mağaza
              </label>
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                {editingId ? 'Güncelle' : 'Kaydet'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Logo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Ad</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Kategoriler</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Fırsatlar</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Durum</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredBrands.map((brand) => (
              <tr key={brand.id} className="hover:bg-slate-700/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {brand.logo_url ? (
                      <img src={brand.logo_url} alt={brand.name} className="w-10 h-10 object-contain rounded" />
                    ) : (
                      <div className="w-10 h-10 bg-purple-500/20 rounded flex items-center justify-center text-purple-400 font-bold">
                        {brand.name.charAt(0)}
                      </div>
                    )}
                    {brand.default_deal_image && (
                      <img src={brand.default_deal_image} alt="Varsayılan" className="w-10 h-10 object-cover rounded opacity-60" title="Varsayılan indirim görseli" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-white font-medium">{brand.name}</td>
                <td className="px-4 py-3 text-gray-400 text-sm">{getCategoryNames(brand.category_ids)}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm font-medium">
                    {brand.deal_count || 0}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {brand.is_featured ? (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm">⭐ Öne Çıkan</span>
                  ) : (
                    <span className="text-gray-500 text-sm">Normal</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(brand)} className="p-2 text-gray-400 hover:text-white">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(brand.id)} className="p-2 text-gray-400 hover:text-red-400">
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
