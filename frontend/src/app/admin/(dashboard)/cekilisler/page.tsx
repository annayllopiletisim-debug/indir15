'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Gift } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
}

interface Giveaway {
  id: string;
  brand_id: string;
  title: string;
  description?: string;
  expiry_date?: string;
  destination_url?: string;
  image_url?: string;
}

export default function AdminGiveawaysPage() {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    brand_id: '',
    title: '',
    description: '',
    expiry_date: '',
    destination_url: '',
    image_url: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [giveawaysRes, brandsRes] = await Promise.all([
        fetch('/api/giveaways'),
        fetch('/api/brands'),
      ]);
      setGiveaways(await giveawaysRes.json());
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
      const url = editingId ? `/api/giveaways/${editingId}` : '/api/giveaways';
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

  const handleEdit = (giveaway: Giveaway) => {
    setFormData({
      brand_id: giveaway.brand_id,
      title: giveaway.title,
      description: giveaway.description || '',
      expiry_date: giveaway.expiry_date?.split('T')[0] || '',
      destination_url: giveaway.destination_url || '',
      image_url: giveaway.image_url || '',
    });
    setEditingId(giveaway.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu çekilişi silmek istediğinizden emin misiniz?')) return;
    try {
      await fetch(`/api/giveaways/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
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

  const resetForm = () => {
    setFormData({ brand_id: '', title: '', description: '', expiry_date: '', destination_url: '', image_url: '' });
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
        <h1 className="text-2xl font-bold text-white">Çekilişler</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"
        >
          <Plus className="w-5 h-5" />
          Yeni Çekiliş
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Çekiliş Düzenle' : 'Yeni Çekiliş'}
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
              <label className="block text-sm text-gray-400 mb-1">Bitiş Tarihi</label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
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
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Hedef URL</label>
              <input
                type="url"
                value={formData.destination_url}
                onChange={(e) => setFormData({ ...formData, destination_url: e.target.value })}
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
                <label className="px-4 py-2 bg-slate-600 text-white rounded-lg cursor-pointer hover:bg-slate-500">
                  {uploading ? 'Yükleniyor...' : 'Yükle'}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
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
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Görsel</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Başlık</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Mağaza</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Bitiş</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {giveaways.map((giveaway) => (
              <tr key={giveaway.id} className="hover:bg-slate-700/50">
                <td className="px-4 py-3">
                  {giveaway.image_url ? (
                    <img src={giveaway.image_url} alt={giveaway.title} className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-12 bg-slate-600 rounded flex items-center justify-center">
                      <Gift className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-white">{giveaway.title}</td>
                <td className="px-4 py-3 text-gray-400">{getBrandName(giveaway.brand_id)}</td>
                <td className="px-4 py-3 text-gray-400">
                  {giveaway.expiry_date ? new Date(giveaway.expiry_date).toLocaleDateString('tr-TR') : 'Süresiz'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(giveaway)} className="p-2 text-gray-400 hover:text-white">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(giveaway.id)} className="p-2 text-gray-400 hover:text-red-400">
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
