import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../utils/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';

const AdminDiscountsPage = () => {
  const [discounts, setDiscounts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
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
      console.error(error);
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
    if (window.confirm('Silmek istediğinizden emin misiniz?')) {
      await api.delete(`/discounts/${id}`);
      fetchData();
    }
  };

  const resetForm = () => {
    setFormData({ brand_id: '', title: '', description: '', discount_text: '', expiry_date: '', utm_template: 'utm_source=savvysaver&utm_medium=discount', destination_url: '' });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="p-8">Yükleniyor...</div>;

  return (
    <>
      <Helmet><title>İndirimler - Admin Panel</title></Helmet>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-heading font-bold">İndirimler</h1>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg flex items-center space-x-2">
            <Plus className="w-5 h-5" /><span>Yeni İndirim</span>
          </button>
        </div>

        {showForm && (
          <div className="glass-effect p-6 rounded-2xl mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingId ? 'İndirim Düzenle' : 'Yeni İndirim'}</h2>
              <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select value={formData.brand_id} onChange={(e) => setFormData({...formData, brand_id: e.target.value})} className="w-full px-4 py-2 bg-void-subtle rounded-lg" required>
                <option value="">Mağaza Seçiniz</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <input type="text" placeholder="Başlık *" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-void-subtle rounded-lg" required />
              <textarea placeholder="Açıklama *" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 bg-void-subtle rounded-lg" rows="3" required />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="İndirim Metni *" value={formData.discount_text} onChange={(e) => setFormData({...formData, discount_text: e.target.value})} className="w-full px-4 py-2 bg-void-subtle rounded-lg" required />
                <input type="datetime-local" value={formData.expiry_date} onChange={(e) => setFormData({...formData, expiry_date: e.target.value})} className="w-full px-4 py-2 bg-void-subtle rounded-lg" />
              </div>
              <input type="url" placeholder="Hedef URL *" value={formData.destination_url} onChange={(e) => setFormData({...formData, destination_url: e.target.value})} className="w-full px-4 py-2 bg-void-subtle rounded-lg" required />
              <input type="text" placeholder="UTM Template" value={formData.utm_template} onChange={(e) => setFormData({...formData, utm_template: e.target.value})} className="w-full px-4 py-2 bg-void-subtle rounded-lg" />
              <div className="flex space-x-4">
                <button type="submit" className="px-6 py-2 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg">{editingId ? 'Güncelle' : 'Kaydet'}</button>
                <button type="button" onClick={resetForm} className="px-6 py-2 bg-void-subtle rounded-lg">İptal</button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {discounts.map(discount => (
            <div key={discount.id} className="glass-effect p-4 rounded-xl flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-bold mb-1">{discount.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{discount.description}</p>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-gradient font-bold">{discount.discount_text}</span>
                  <span className="text-muted-foreground">{brands.find(b => b.id === discount.brand_id)?.name}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(discount)} className="p-2 hover:bg-white/10 rounded-lg"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(discount.id)} className="p-2 hover:bg-destructive/20 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminDiscountsPage;
