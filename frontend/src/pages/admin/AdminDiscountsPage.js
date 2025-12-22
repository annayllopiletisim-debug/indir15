import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../utils/api';
import { Plus, Edit, Trash2, X, Search, CheckSquare, Square, Trash } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const AdminDiscountsPage = () => {
  const [discounts, setDiscounts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [formData, setFormData] = useState({
    brand_id: '', title: '', description: '', discount_text: '', expiry_date: '',
    utm_template: 'utm_source=savvysaver&utm_medium=discount', destination_url: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [discountsRes, brandsRes] = await Promise.all([api.get('/discounts'), api.get('/brands')]);
      setDiscounts(discountsRes.data);
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
      editingId ? await api.put(`/discounts/${editingId}`, data) : await api.post('/discounts', data);
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Failed to save discount:', error);
      alert('Hata: İndirim kaydedilemedi');
    }
  };

  const handleEdit = (discount) => {
    const editData = {...discount};
    if (editData.expiry_date) editData.expiry_date = new Date(editData.expiry_date).toISOString().slice(0, 16);
    setFormData(editData);
    setEditingId(discount.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu indirimi silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/discounts/${id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete discount:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`${selectedIds.length} indirimi silmek istediğinize emin misiniz?`)) return;
    
    try {
      await Promise.all(selectedIds.map(id => api.delete(`/discounts/${id}`)));
      setSelectedIds([]);
      fetchData();
    } catch (error) {
      console.error('Bulk delete failed:', error);
      alert('Toplu silme işlemi başarısız');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredDiscounts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDiscounts.map(d => d.id));
    }
  };

  const resetForm = () => {
    setFormData({
      brand_id: '', title: '', description: '', discount_text: '', expiry_date: '',
      utm_template: 'utm_source=savvysaver&utm_medium=discount', destination_url: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getBrandName = (brandId) => brands.find(b => b.id === brandId)?.name || 'Bilinmiyor';
  const isExpired = (date) => date && new Date(date) < new Date();

  const filteredDiscounts = discounts.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && !isExpired(d.expiry_date)) ||
                          (statusFilter === 'expired' && isExpired(d.expiry_date));
    const matchesBrand = brandFilter === 'all' || d.brand_id === brandFilter;
    return matchesSearch && matchesStatus && matchesBrand;
  });

  if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

  return (
    <>
      <Helmet><title>İndirimler - Admin</title></Helmet>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading font-bold">İndirim Yönetimi</h1>
            <p className="text-sm text-muted-foreground">Toplam {discounts.length} indirim</p>
          </div>
          <Button onClick={() => { setShowForm(true); setEditingId(null); }}>
            <Plus className="w-4 h-4 mr-2" /> Yeni İndirim
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="İndirim ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 bg-void-subtle rounded-lg border border-white/10">
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="expired">Süresi Dolmuş</option>
          </select>

          <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="px-4 py-2 bg-void-subtle rounded-lg border border-white/10">
            <option value="all">Tüm Mağazalar</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
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
                <h2 className="text-xl font-bold">{editingId ? 'İndirimi Düzenle' : 'Yeni İndirim'}</h2>
                <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mağaza *</label>
                  <select value={formData.brand_id} onChange={(e) => setFormData({...formData, brand_id: e.target.value})}
                    className="w-full p-2 bg-void-subtle rounded-lg border border-white/10" required>
                    <option value="">Seçin</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Başlık *</label>
                  <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Açıklama</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-2 bg-void-subtle rounded-lg border border-white/10 min-h-[80px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">İndirim Metni</label>
                    <Input value={formData.discount_text} onChange={(e) => setFormData({...formData, discount_text: e.target.value})} placeholder="%30 İndirim" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bitiş Tarihi</label>
                    <Input type="datetime-local" value={formData.expiry_date} onChange={(e) => setFormData({...formData, expiry_date: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hedef URL</label>
                  <Input value={formData.destination_url} onChange={(e) => setFormData({...formData, destination_url: e.target.value})} placeholder="https://..." />
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
                    {selectedIds.length === filteredDiscounts.length && filteredDiscounts.length > 0 ? 
                      <CheckSquare className="w-4 h-4 text-neon-purple" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">İndirim</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Mağaza</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Bitiş</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Durum</th>
                <th className="px-4 py-3 text-right text-sm font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDiscounts.map(discount => (
                <tr key={discount.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(discount.id)} className="p-1 hover:bg-white/10 rounded">
                      {selectedIds.includes(discount.id) ? <CheckSquare className="w-4 h-4 text-neon-purple" /> : <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium">{discount.title}</span>
                      {discount.discount_text && <span className="ml-2 text-xs text-neon-pink">{discount.discount_text}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{getBrandName(discount.brand_id)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {discount.expiry_date ? new Date(discount.expiry_date).toLocaleDateString('tr-TR') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${isExpired(discount.expiry_date) ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {isExpired(discount.expiry_date) ? 'Süresi Doldu' : 'Aktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(discount)} className="p-2 hover:bg-white/10 rounded-lg"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(discount.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDiscounts.length === 0 && <div className="p-8 text-center text-muted-foreground">İndirim bulunamadı.</div>}
        </div>
      </div>
    </>
  );
};

export default AdminDiscountsPage;
