import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Plus, Edit, Trash2, Gift, Search, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { getAuthToken } from '../../utils/auth';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminGiveawaysPage = () => {
  const [giveaways, setGiveaways] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    brand_id: '', title: '', description: '', long_description: '', terms_conditions: '',
    prize_text: '', expiry_date: '',
    is_active: true, is_featured: false, utm_template: 'utm_source=İndirim Keşfet&utm_medium=giveaway', destination_url: '',
    image_url: ''
  });

  const fetchData = async () => {
    try {
      const token = getAuthToken();
      const [giveawaysRes, brandsRes] = await Promise.all([
        axios.get(`${API}/giveaways`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/brands`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setGiveaways(giveawaysRes.data);
      setBrands(brandsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setFormData({
      brand_id: '', title: '', description: '', long_description: '', terms_conditions: '',
      prize_text: '', expiry_date: '',
      is_active: true, is_featured: false, utm_template: 'utm_source=İndirim Keşfet&utm_medium=giveaway', destination_url: '',
      image_url: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      const data = { ...formData };
      if (data.expiry_date) data.expiry_date = new Date(data.expiry_date).toISOString();
      else delete data.expiry_date;

      if (editingId) {
        await axios.put(`${API}/giveaways/${editingId}`, data, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API}/giveaways`, data, { headers: { Authorization: `Bearer ${token}` } });
      }
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Failed to save giveaway:', error);
      alert('Kaydetme başarısız: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEdit = (giveaway) => {
    setFormData({
      brand_id: giveaway.brand_id,
      title: giveaway.title,
      description: giveaway.description || '',
      long_description: giveaway.long_description || '',
      terms_conditions: giveaway.terms_conditions || '',
      prize_text: giveaway.prize_text,
      expiry_date: giveaway.expiry_date ? giveaway.expiry_date.split('T')[0] : '',
      is_active: giveaway.is_active,
      is_featured: giveaway.is_featured || false,
      utm_template: giveaway.utm_template || '',
      destination_url: giveaway.destination_url,
      image_url: giveaway.image_url || ''
    });
    setEditingId(giveaway.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu çekilişi silmek istediğinize emin misiniz?')) return;
    try {
      const token = getAuthToken();
      await axios.delete(`${API}/giveaways/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (error) {
      console.error('Failed to delete giveaway:', error);
    }
  };

  const getBrandName = (brandId) => {
    const brand = brands.find(b => b.id === brandId);
    return brand?.name || 'Bilinmiyor';
  };

  const filteredGiveaways = giveaways.filter(g =>
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    getBrandName(g.brand_id).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Helmet><title>Çekilişler - Admin</title></Helmet>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Gift className="w-7 h-7 text-emerald-400" />
            Çekilişler
          </h1>
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Yeni Çekiliş
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Çekiliş veya mağaza ara..."
            className="pl-10"
          />
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-void-paper rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{editingId ? 'Çekiliş Düzenle' : 'Yeni Çekiliş'}</h2>
                <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mağaza *</label>
                  <select value={formData.brand_id} onChange={(e) => setFormData({...formData, brand_id: e.target.value})}
                    className="w-full p-2 bg-void-subtle rounded-lg border border-white/10" required>
                    <option value="">Seçin...</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Çekiliş Başlığı *</label>
                  <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ödül Metni *</label>
                  <Input value={formData.prize_text} onChange={(e) => setFormData({...formData, prize_text: e.target.value})} 
                    placeholder="Örn: iPhone 15 Pro, 10.000 TL" required />
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
                    placeholder="Detay sayfasındaki uzun açıklama (opsiyonel)" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Katılım Koşulları</label>
                  <textarea value={formData.terms_conditions} onChange={(e) => setFormData({...formData, terms_conditions: e.target.value})}
                    className="w-full p-2 bg-void-subtle rounded-lg border border-white/10 min-h-[100px]" 
                    placeholder="Çekilişe katılım koşulları (opsiyonel)" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Bitiş Tarihi</label>
                    <Input type="date" value={formData.expiry_date} onChange={(e) => setFormData({...formData, expiry_date: e.target.value})} />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} />
                    <label className="text-sm">Aktif</label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hedef URL *</label>
                  <Input value={formData.destination_url} onChange={(e) => setFormData({...formData, destination_url: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kampanya Görseli (URL)</label>
                  <Input value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} placeholder="https://example.com/image.jpg" />
                  <p className="text-xs text-gray-400 mt-1">Kartlarda görünecek kampanya görseli URL'i</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">UTM Template</label>
                  <Input value={formData.utm_template} onChange={(e) => setFormData({...formData, utm_template: e.target.value})} />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">{editingId ? 'Güncelle' : 'Oluştur'}</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>İptal</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-void-paper border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-4">Çekiliş</th>
                <th className="text-left p-4">Mağaza</th>
                <th className="text-left p-4">Ödül</th>
                <th className="text-left p-4">Bitiş</th>
                <th className="text-left p-4">Durum</th>
                <th className="text-right p-4">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredGiveaways.map(giveaway => (
                <tr key={giveaway.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div className="font-medium">{giveaway.title}</div>
                    <div className="text-sm text-gray-400 truncate max-w-xs">{giveaway.description}</div>
                  </td>
                  <td className="p-4">{getBrandName(giveaway.brand_id)}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                      {giveaway.prize_text}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    {giveaway.expiry_date ? new Date(giveaway.expiry_date).toLocaleDateString('tr-TR') : '-'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      giveaway.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {giveaway.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEdit(giveaway)} className="p-2 hover:bg-white/10 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(giveaway.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredGiveaways.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Henüz çekiliş bulunmuyor</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminGiveawaysPage;
