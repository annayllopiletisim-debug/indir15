'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Upload } from 'lucide-react';

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
}

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    brand_id: '',
    title: '',
    description: '',
    discount_text: '',
    expiry_date: '',
    is_featured: false,
    destination_url: '',
    image_url: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

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
    });
    setEditingId(discount.id);
    setShowForm(true);
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
    setFormData({ brand_id: '', title: '', description: '', discount_text: '', expiry_date: '', is_featured: false });
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
        <h1 className="text-2xl font-bold text-white">İndirimler</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"
        >
          <Plus className="w-5 h-5" />
          Yeni İndirim
        </button>
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
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Başlık</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Mağaza</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">İndirim</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Tarih</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {discounts.slice(0, 50).map((discount) => (
              <tr key={discount.id} className="hover:bg-slate-700/50">
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
