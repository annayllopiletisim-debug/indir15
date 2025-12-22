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
  const [formData, setFormData] = useState({
    brand_id: '',
    title: '',
    description: '',
    code: '',
    discount_text: '',
    expiry_date: '',
    is_active: true,
    utm_template: 'utm_source=savvysaver&utm_medium=coupon',
    destination_url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [couponsRes, brandsRes] = await Promise.all([
        api.get('/coupons'),
        api.get('/brands')
      ]);
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
      if (data.expiry_date) {
        data.expiry_date = new Date(data.expiry_date).toISOString();
      }
      
      if (editingId) {
        await api.put(`/coupons/${editingId}`, data);
      } else {
        await api.post('/coupons', data);
      }
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Failed to save coupon:', error);
      alert('Hata: Kupon kaydedilemedi');
    }
  };

  const handleEdit = (coupon) => {
    const editData = {...coupon};
    if (editData.expiry_date) {
      editData.expiry_date = new Date(editData.expiry_date).toISOString().slice(0, 16);
    }
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
    setFormData({
      brand_id: '',
      title: '',
      description: '',
      code: '',
      discount_text: '',
      expiry_date: '',
      is_active: true,
      utm_template: 'utm_source=savvysaver&utm_medium=coupon',
      destination_url: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="p-8">Yükleniyor...</div>;

  return (
    <>
      <Helmet><title>Kuponlar - Admin Panel</title></Helmet>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-heading font-bold">Kuponlar</h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" /><span>Yeni Kupon</span>
          </button>
        </div>

        {showForm && (
          <div className="glass-effect p-6 rounded-2xl mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingId ? 'Kupon Düzenle' : 'Yeni Kupon'}</h2>
              <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mağaza *</label>
                <select
                  value={formData.brand_id}
                  onChange={(e) => setFormData({...formData, brand_id: e.target.value})}
                  className="w-full px-4 py-2 bg-void-subtle rounded-lg"
                  required
                >
                  <option value="">Seçiniz</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Başlık *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-void-subtle rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Kupon Kodu *</label>
                  <input type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="w-full px-4 py-2 bg-void-subtle rounded-lg" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Açıklama</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 bg-void-subtle rounded-lg" rows="2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">İndirim Metni *</label>
                  <input type="text" value={formData.discount_text} onChange={(e) => setFormData({...formData, discount_text: e.target.value})} className="w-full px-4 py-2 bg-void-subtle rounded-lg" placeholder="%20 İndirim" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Son Kullanma</label>
                  <input type="datetime-local" value={formData.expiry_date} onChange={(e) => setFormData({...formData, expiry_date: e.target.value})} className="w-full px-4 py-2 bg-void-subtle rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hedef URL *</label>
                <input type="url" value={formData.destination_url} onChange={(e) => setFormData({...formData, destination_url: e.target.value})} className="w-full px-4 py-2 bg-void-subtle rounded-lg" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">UTM Template</label>
                <input type="text" value={formData.utm_template} onChange={(e) => setFormData({...formData, utm_template: e.target.value})} className="w-full px-4 py-2 bg-void-subtle rounded-lg" />
              </div>

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
          {coupons.map(coupon => (
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
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminCouponsPage;
