import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../utils/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    brand_id: '', title: '', description: '', code: '', discount_text: '', expiry_date: '',
    is_active: true, utm_template: 'utm_source=savvysaver&utm_medium=coupon', destination_url: ''
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

  const resetForm = () => {
    setFormData({ brand_id: '', title: '', description: '', code: '', discount_text: '', expiry_date: '', is_active: true, utm_template: 'utm_source=savvysaver&utm_medium=coupon', destination_url: '' });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="p-8">Yükleniyor...</div>;

  const filteredCoupons = coupons.filter(coupon => {
    const query = searchQuery.toLowerCase();
    const brandName = brands.find(b => b.id === coupon.brand_id)?.name?.toLowerCase() || '';
    return (
      coupon.title.toLowerCase().includes(query) ||
      coupon.code.toLowerCase().includes(query) ||
      (coupon.description?.toLowerCase() || '').includes(query) ||
      brandName.includes(query)
    );
  });

  return (
    <>
      <Helmet><title>Kuponlar - Admin Panel</title></Helmet>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-heading font-bold">Kuponlar</h1>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg flex items-center space-x-2">
            <Plus className="w-5 h-5" /><span>Yeni Kupon</span>
          </button>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Başlık, kod, mağaza adı ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-void-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">{filteredCoupons.length} sonuç bulundu</p>
        </div>

        {showForm && (
          <div className="glass-effect p-6 rounded-2xl mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingId ? 'Kupon Düzenle' : 'Yeni Kupon'}</h2>
              <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select value={formData.brand_id} onChange={(e) => setFormData({...formData, brand_id: e.target.value})} className="w-full px-4 py-2 bg-void-subtle rounded-lg" required>
                <option value="">Mağaza Seçiniz</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Başlık *" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-void-subtle rounded-lg" required />
                <input type="text" placeholder="Kupon Kodu *" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="w-full px-4 py-2 bg-void-subtle rounded-lg" required />
              </div>
              <textarea placeholder="Açıklama" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 bg-void-subtle rounded-lg" rows="2" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="İndirim Metni *" value={formData.discount_text} onChange={(e) => setFormData({...formData, discount_text: e.target.value})} className="w-full px-4 py-2 bg-void-subtle rounded-lg" required />
                <input type="datetime-local" value={formData.expiry_date} onChange={(e) => setFormData({...formData, expiry_date: e.target.value})} className="w-full px-4 py-2 bg-void-subtle rounded-lg" />
              </div>
              <input type="url" placeholder="Hedef URL *" value={formData.destination_url} onChange={(e) => setFormData({...formData, destination_url: e.target.value})} className="w-full px-4 py-2 bg-void-subtle rounded-lg" required />
              <input type="text" placeholder="UTM Template" value={formData.utm_template} onChange={(e) => setFormData({...formData, utm_template: e.target.value})} className="w-full px-4 py-2 bg-void-subtle rounded-lg" />
              <div className="flex items-center space-x-2">
                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4" />
                <label className="text-sm font-medium">Aktif</label>
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="px-6 py-2 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg">{editingId ? 'Güncelle' : 'Kaydet'}</button>
                <button type="button" onClick={resetForm} className="px-6 py-2 bg-void-subtle rounded-lg hover:bg-white/10">İptal</button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {filteredCoupons.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">Sonuç bulunamadı</p>
              <button onClick={() => setSearchQuery('')} className="px-4 py-2 bg-void-subtle rounded-lg">Aramayı Temizle</button>
            </div>
          ) : (
            filteredCoupons.map(coupon => (
              <div key={coupon.id} className="glass-effect p-4 rounded-xl flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-bold">{coupon.title}</h3>
                    <span className="px-3 py-1 rounded-full bg-neon-purple/20 text-neon-purple text-xs font-mono">{coupon.code}</span>
                    <span className="text-sm text-gradient font-bold">{coupon.discount_text}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{brands.find(b => b.id === coupon.brand_id)?.name}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(coupon)} className="p-2 hover:bg-white/10 rounded-lg"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(coupon.id)} className="p-2 hover:bg-destructive/20 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default AdminCouponsPage;
