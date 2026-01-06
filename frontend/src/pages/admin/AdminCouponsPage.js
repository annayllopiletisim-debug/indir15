import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../utils/api';
import { Plus, Edit, Trash2, X, Search, Filter, CheckSquare, Square, Trash } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, expired
  const [brandFilter, setBrandFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [formData, setFormData] = useState({
    brand_id: '', title: '', description: '', long_description: '', terms_conditions: '',
    code: '', discount_text: '', expiry_date: '',
    is_active: true, is_featured: false, utm_template: 'utm_source=İndirim Keşfet&utm_medium=coupon', destination_url: '',
    image_url: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [couponsRes, brandsRes] = await Promise.all([api.get('/coupons'), api.get('/brands')]);
      setCoupons(couponsRes.data);
      setBrands(brandsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {...formData};
      if (data.expiry_date) data.expiry_date = new Date(data.expiry_date).toISOString();
      editingId ? await api.put(`/coupons/${editingId}`, data) : await api.post('/coupons', data);
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Failed to save coupon:', error);
      alert('Hata: Kupon kaydedilemedi');
    }
  };

  const handleEdit = (coupon) => {
    const editData = {...coupon};
    if (editData.expiry_date) editData.expiry_date = new Date(editData.expiry_date).toISOString().slice(0, 16);
    setFormData(editData);
    setEditingId(coupon.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu kuponu silmek istediğinizden emin misiniz?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete coupon:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`${selectedIds.length} kuponu silmek istediğinize emin misiniz?`)) return;
    
    try {
      await Promise.all(selectedIds.map(id => api.delete(`/coupons/${id}`)));
      setSelectedIds([]);
      fetchData();
    } catch (error) {
      console.error('Bulk delete failed:', error);
      alert('Toplu silme işlemi başarısız');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCoupons.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCoupons.map(c => c.id));
    }
  };

  const resetForm = () => {
    setFormData({
      brand_id: '', title: '', description: '', long_description: '', terms_conditions: '',
      code: '', discount_text: '', expiry_date: '',
      is_active: true, is_featured: false, utm_template: 'utm_source=İndirim Keşfet&utm_medium=coupon', destination_url: '',
      image_url: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getBrandName = (brandId) => brands.find(b => b.id === brandId)?.name || 'Bilinmiyor';
  
  const isExpired = (date) => date && new Date(date) < new Date();

  // Apply filters
  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && c.is_active && !isExpired(c.expiry_date)) ||
                          (statusFilter === 'expired' && (!c.is_active || isExpired(c.expiry_date)));
    const matchesBrand = brandFilter === 'all' || c.brand_id === brandFilter;
    return matchesSearch && matchesStatus && matchesBrand;
  });

  if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

  return (
    <>
      <Helmet><title>Kuponlar - Admin</title></Helmet>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading font-bold">Kupon Yönetimi</h1>
            <p className="text-sm text-gray-400">Toplam {coupons.length} kupon</p>
          </div>
          <Button onClick={() => { setShowForm(true); setEditingId(null); }} data-testid="add-coupon-btn">
            <Plus className="w-4 h-4 mr-2" /> Yeni Kupon
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Kupon ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-void-subtle rounded-lg border border-white/10"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="expired">Süresi Dolmuş</option>
          </select>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="px-4 py-2 bg-void-subtle rounded-lg border border-white/10"
          >
            <option value="all">Tüm Mağazalar</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {selectedIds.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash className="w-4 h-4 mr-2" /> {selectedIds.length} Seçili Sil
            </Button>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-void-paper rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{editingId ? 'Kuponu Düzenle' : 'Yeni Kupon'}</h2>
                <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Mağaza *</label>
                    <select value={formData.brand_id} onChange={(e) => setFormData({...formData, brand_id: e.target.value})}
                      className="w-full p-2 bg-void-subtle rounded-lg border border-white/10" required>
                      <option value="">Seçin</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Kupon Kodu *</label>
                    <Input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Başlık *</label>
                  <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Açıklama (Kısa)</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-2 bg-void-subtle rounded-lg border border-white/10 min-h-[80px]" 
                    placeholder="Kartlarda görünecek kısa açıklama" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Uzun Açıklama (Detay Sayfası)</label>
                  <textarea value={formData.long_description} onChange={(e) => setFormData({...formData, long_description: e.target.value})}
                    className="w-full p-2 bg-void-subtle rounded-lg border border-white/10 min-h-[120px]" 
                    placeholder="Detay sayfasında görünecek uzun açıklama (opsiyonel)" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kullanım Koşulları</label>
                  <textarea value={formData.terms_conditions} onChange={(e) => setFormData({...formData, terms_conditions: e.target.value})}
                    className="w-full p-2 bg-void-subtle rounded-lg border border-white/10 min-h-[100px]" 
                    placeholder="Kuponun geçerlilik koşulları (opsiyonel)" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">İndirim Metni</label>
                    <Input value={formData.discount_text} onChange={(e) => setFormData({...formData, discount_text: e.target.value})} placeholder="%20 İndirim" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bitiş Tarihi <span className="text-gray-400 font-normal">(Opsiyonel - Boş bırakılırsa süresiz)</span></label>
                    <Input type="datetime-local" value={formData.expiry_date} onChange={(e) => setFormData({...formData, expiry_date: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hedef URL</label>
                  <Input value={formData.destination_url} onChange={(e) => setFormData({...formData, destination_url: e.target.value})} placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kampanya Görseli (URL)</label>
                  <Input value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} placeholder="https://example.com/image.jpg" />
                  <p className="text-xs text-gray-400 mt-1">Kartlarda görünecek kampanya görseli URL'i</p>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} />
                  <label htmlFor="is_active" className="text-sm">Aktif</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_featured" checked={formData.is_featured} onChange={(e) => setFormData({...formData, is_featured: e.target.checked})} />
                  <label htmlFor="is_featured" className="text-sm">⭐ Öne Çıkan (Ana sayfada göster)</label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit">{editingId ? 'Güncelle' : 'Ekle'}</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>İptal</Button>
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
                <th className="px-4 py-3 text-left">
                  <button onClick={toggleSelectAll} className="p-1 hover:bg-white/10 rounded">
                    {selectedIds.length === filteredCoupons.length && filteredCoupons.length > 0 ? 
                      <CheckSquare className="w-4 h-4 text-neon-purple" /> : 
                      <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">Kupon</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Kod</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Mağaza</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Bitiş</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Durum</th>
                <th className="px-4 py-3 text-right text-sm font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCoupons.map(coupon => (
                <tr key={coupon.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(coupon.id)} className="p-1 hover:bg-white/10 rounded">
                      {selectedIds.includes(coupon.id) ? 
                        <CheckSquare className="w-4 h-4 text-neon-purple" /> : 
                        <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium">{coupon.title}</span>
                      {coupon.discount_text && <span className="ml-2 text-xs text-neon-purple">{coupon.discount_text}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3"><code className="px-2 py-1 bg-void-subtle rounded text-sm">{coupon.code}</code></td>
                  <td className="px-4 py-3 text-gray-400">{getBrandName(coupon.brand_id)}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString('tr-TR') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      !coupon.is_active || isExpired(coupon.expiry_date) ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {!coupon.is_active ? 'Pasif' : isExpired(coupon.expiry_date) ? 'Süresi Doldu' : 'Aktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(coupon)} className="p-2 hover:bg-white/10 rounded-lg"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(coupon.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCoupons.length === 0 && <div className="p-8 text-center text-gray-400">Kupon bulunamadı.</div>}
        </div>
      </div>
    </>
  );
};

export default AdminCouponsPage;
