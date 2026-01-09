'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, Loader2, Copy, Search, X, CheckSquare, Square } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
}

interface Coupon {
  id: string;
  brand_id: string;
  title: string;
  code: string;
  discount_text?: string;
  expiry_date?: string;
  is_active?: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'code' | 'title'>('newest');

  const [formData, setFormData] = useState({
    brand_id: '',
    title: '',
    code: '',
    discount_text: '',
    expiry_date: '',
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered and sorted coupons
  const filteredCoupons = useMemo(() => {
    let result = [...coupons];
    
    // Search filter
    if (searchTerm) {
      result = result.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Brand filter
    if (filterBrand !== 'all') {
      result = result.filter(c => c.brand_id === filterBrand);
    }
    
    // Status filter
    if (filterStatus === 'active') {
      result = result.filter(c => c.is_active);
    } else if (filterStatus === 'inactive') {
      result = result.filter(c => !c.is_active);
    }
    
    // Sort
    if (sortBy === 'code') {
      result.sort((a, b) => a.code.localeCompare(b.code));
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    return result;
  }, [coupons, searchTerm, filterBrand, filterStatus, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterBrand('all');
    setFilterStatus('all');
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
    if (selectedIds.size === filteredCoupons.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCoupons.map(c => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`${selectedIds.size} kuponu silmek istediğinizden emin misiniz?`)) return;
    
    setDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map(id => 
          fetch(`/api/coupons/${id}`, { method: 'DELETE' })
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
      const [couponsRes, brandsRes] = await Promise.all([
        fetch('/api/coupons'),
        fetch('/api/brands'),
      ]);
      setCoupons(await couponsRes.json());
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
      const url = editingId ? `/api/coupons/${editingId}` : '/api/coupons';
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

  const handleEdit = (coupon: Coupon) => {
    setFormData({
      brand_id: coupon.brand_id,
      title: coupon.title,
      code: coupon.code,
      discount_text: coupon.discount_text || '',
      expiry_date: coupon.expiry_date?.split('T')[0] || '',
      is_active: coupon.is_active ?? true,
    });
    setEditingId(coupon.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kuponu silmek istediğinizden emin misiniz?')) return;
    try {
      await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const resetForm = () => {
    setFormData({ brand_id: '', title: '', code: '', discount_text: '', expiry_date: '', is_active: true });
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
        <h1 className="text-2xl font-bold text-white">Kuponlar ({coupons.length})</h1>
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
            Yeni Kupon
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
              placeholder="Kupon veya kod ara..."
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            <option value="newest">En Yeni</option>
            <option value="code">Koda Göre</option>
            <option value="title">Ada Göre</option>
          </select>
          {(searchTerm || filterBrand !== 'all' || filterStatus !== 'all' || sortBy !== 'newest') && (
            <button onClick={clearFilters} className="p-2 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="mt-2 text-sm text-gray-400">
          {filteredCoupons.length} sonuç gösteriliyor
        </div>
      </div>

      {showForm && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Kupon Düzenle' : 'Yeni Kupon'}
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
              <label className="block text-sm text-gray-400 mb-1">Kupon Kodu *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono"
                required
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
            <div>
              <label className="block text-sm text-gray-400 mb-1">İndirim Oranı</label>
              <input
                type="text"
                value={formData.discount_text}
                onChange={(e) => setFormData({ ...formData, discount_text: e.target.value })}
                placeholder="örn: %20 İndirim"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
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
                  {selectedIds.size === filteredCoupons.length && filteredCoupons.length > 0 ? (
                    <CheckSquare className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Başlık</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Mağaza</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Kod</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">İndirim</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Durum</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredCoupons.map((coupon) => (
              <tr key={coupon.id} className={`hover:bg-slate-700/50 ${selectedIds.has(coupon.id) ? 'bg-purple-900/20' : ''}`}>
                <td className="px-4 py-3">
                  <button onClick={() => toggleSelect(coupon.id)} className="text-gray-400 hover:text-white">
                    {selectedIds.has(coupon.id) ? (
                      <CheckSquare className="w-5 h-5 text-purple-400" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-white">{coupon.title}</td>
                <td className="px-4 py-3 text-gray-400">{getBrandName(coupon.brand_id)}</td>
                <td className="px-4 py-3">
                  <code className="px-2 py-1 bg-violet-500/20 text-violet-400 rounded font-mono text-sm">
                    {coupon.code}
                  </code>
                </td>
                <td className="px-4 py-3">
                  {coupon.discount_text && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      {coupon.discount_text}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-sm ${coupon.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {coupon.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(coupon)} className="p-2 text-gray-400 hover:text-white">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(coupon.id)} className="p-2 text-gray-400 hover:text-red-400">
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
