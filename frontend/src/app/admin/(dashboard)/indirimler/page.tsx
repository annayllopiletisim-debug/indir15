'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, Loader2, Upload, Search, X, CheckSquare, Square } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Discount {
  id: string;
  brand_id: string;
  title: string;
  description?: string;
  discount_text?: string;
  expiry_date?: string;
  is_featured?: boolean;
  destination_url?: string;
  image_url?: string;
  tags?: string[];
}

// Kampanya etiketleri listesi
const CAMPAIGN_TAGS = [
  { value: 'black-friday', label: 'Black Friday' },
  { value: 'cyber-monday', label: 'Cyber Monday' },
  { value: '11-11', label: '11.11 Bekarlar Günü' },
  { value: 'yilbasi', label: 'Yılbaşı' },
  { value: 'sevgililer-gunu', label: 'Sevgililer Günü' },
  { value: 'anneler-gunu', label: 'Anneler Günü' },
  { value: 'babalar-gunu', label: 'Babalar Günü' },
  { value: 'ramazan', label: 'Ramazan' },
];

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'yes' | 'no'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  const [formData, setFormData] = useState({
    brand_id: '',
    title: '',
    description: '',
    discount_text: '',
    expiry_date: '',
    is_featured: false,
    destination_url: '',
    image_url: '',
    tags: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered and sorted discounts
  const filteredDiscounts = useMemo(() => {
    let result = [...discounts];
    
    // Search filter
    if (searchTerm) {
      result = result.filter(d => 
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Brand filter
    if (filterBrand !== 'all') {
      result = result.filter(d => d.brand_id === filterBrand);
    }
    
    // Featured filter
    if (filterFeatured === 'yes') {
      result = result.filter(d => d.is_featured);
    } else if (filterFeatured === 'no') {
      result = result.filter(d => !d.is_featured);
    }
    
    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.expiry_date || 0).getTime() - new Date(a.expiry_date || 0).getTime());
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.expiry_date || 0).getTime() - new Date(b.expiry_date || 0).getTime());
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    return result;
  }, [discounts, searchTerm, filterBrand, filterFeatured, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterBrand('all');
    setFilterFeatured('all');
    setSortBy('newest');
  };

  // Selection handlers
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredDiscounts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredDiscounts.map(d => d.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`${selectedIds.size} indirimi silmek istediğinizden emin misiniz?`)) return;
    
    setDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map(id => 
          fetch(`/api/discounts/${id}`, { method: 'DELETE' })
        )
      );
      setSelectedIds(new Set());
      fetchData();
    } catch (err) {
      console.error('Bulk delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  const fetchData = async () => {
    try {
      const [discountsRes, brandsRes] = await Promise.all([
        fetch('/api/discounts'),
        fetch('/api/brands'),
      ]);
      setDiscounts(await discountsRes.json());
      setBrands(await brandsRes.json());
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/discounts/${editingId}` : '/api/discounts';
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

  const handleEdit = (discount: Discount) => {
    setFormData({
      brand_id: discount.brand_id,
      title: discount.title,
      description: discount.description || '',
      discount_text: discount.discount_text || '',
      expiry_date: discount.expiry_date?.split('T')[0] || '',
      is_featured: discount.is_featured || false,
      destination_url: discount.destination_url || '',
      image_url: discount.image_url || '',
    });
    setEditingId(discount.id);
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setFormData({ ...formData, image_url: data.url });
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu indirimi silmek istediğinizden emin misiniz?')) return;
    try {
      await fetch(`/api/discounts/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const resetForm = () => {
    setFormData({ brand_id: '', title: '', description: '', discount_text: '', expiry_date: '', is_featured: false, destination_url: '', image_url: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const getBrandName = (brandId: string) => brands.find(b => b.id === brandId)?.name || '-';

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
        <h1 className="text-2xl font-bold text-white">İndirimler ({discounts.length})</h1>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="w-5 h-5" />
              {deleting ? 'Siliniyor...' : `${selectedIds.size} Seçili Sil`}
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"
          >
            <Plus className="w-5 h-5" />
            Yeni İndirim
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
              placeholder="İndirim ara..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400"
            />
          </div>
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            <option value="all">Tüm Mağazalar</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
          <select
            value={filterFeatured}
            onChange={(e) => setFilterFeatured(e.target.value as any)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            <option value="all">Tümü</option>
            <option value="yes">Öne Çıkanlar</option>
            <option value="no">Normal</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            <option value="newest">En Yeni</option>
            <option value="oldest">En Eski</option>
            <option value="title">Ada Göre</option>
          </select>
          {(searchTerm || filterBrand !== 'all' || filterFeatured !== 'all' || sortBy !== 'newest') && (
            <button onClick={clearFilters} className="p-2 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="mt-2 text-sm text-gray-400">
          {filteredDiscounts.length} sonuç gösteriliyor
        </div>
      </div>

      {showForm && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'İndirim Düzenle' : 'Yeni İndirim'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Mağaza *</label>
              <select
                value={formData.brand_id}
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                required
              >
                <option value="">Seçin...</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">İndirim Oranı</label>
              <input
                type="text"
                value={formData.discount_text}
                onChange={(e) => setFormData({ ...formData, discount_text: e.target.value })}
                placeholder="örn: %50, 2 Al 1 Öde"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Başlık *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                required
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
            <div>
              <label className="block text-sm text-gray-400 mb-1">Bitiş Tarihi</label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Hedef URL</label>
              <input
                type="url"
                value={formData.destination_url}
                onChange={(e) => setFormData({ ...formData, destination_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Görsel</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="URL veya yükle"
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
                <label className="px-4 py-2 bg-slate-600 text-white rounded-lg cursor-pointer hover:bg-slate-500 flex items-center gap-2">
                  {uploading ? '...' : <><Upload className="w-4 h-4" /></>}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
              </div>
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                Öne Çıkan
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
              <th className="px-4 py-3 text-left">
                <button onClick={toggleSelectAll} className="text-gray-400 hover:text-white">
                  {selectedIds.size === filteredDiscounts.length && filteredDiscounts.length > 0 ? (
                    <CheckSquare className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Başlık</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Mağaza</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">İndirim</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Tarih</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredDiscounts.slice(0, 50).map((discount) => (
              <tr key={discount.id} className={`hover:bg-slate-700/50 ${selectedIds.has(discount.id) ? 'bg-purple-900/20' : ''}`}>
                <td className="px-4 py-3">
                  <button onClick={() => toggleSelect(discount.id)} className="text-gray-400 hover:text-white">
                    {selectedIds.has(discount.id) ? (
                      <CheckSquare className="w-5 h-5 text-purple-400" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-white">{discount.title}</td>
                <td className="px-4 py-3 text-gray-400">{getBrandName(discount.brand_id)}</td>
                <td className="px-4 py-3">
                  {discount.discount_text && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      {discount.discount_text}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {discount.expiry_date ? new Date(discount.expiry_date).toLocaleDateString('tr-TR') : 'Süresiz'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(discount)} className="p-2 text-gray-400 hover:text-white">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(discount.id)} className="p-2 text-gray-400 hover:text-red-400">
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
