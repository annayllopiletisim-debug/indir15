import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Search, FileText, Upload } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { getToken } from '../../utils/auth';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminCatalogsPage = () => {
  const [catalogs, setCatalogs] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    brand_id: '',
    title: '',
    description: '',
    pdf_url: '',
    thumbnail_url: '',
    category_id: '',
    valid_from: '',
    valid_until: '',
    is_active: true
  });

  const fetchData = async () => {
    try {
      const [catalogsRes, brandsRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/catalogs`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        axios.get(`${API}/brands`),
        axios.get(`${API}/categories`)
      ]);
      setCatalogs(catalogsRes.data);
      setBrands(brandsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (type === 'pdf' && file.type !== 'application/pdf') {
      alert('Lütfen PDF dosyası seçin');
      return;
    }
    if (type === 'pdf' && file.size > 10 * 1024 * 1024) {
      alert('PDF dosyası en fazla 10MB olabilir');
      return;
    }

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const endpoint = type === 'pdf' ? '/upload/pdf' : '/upload/logo';
      const res = await axios.post(`${API}${endpoint}`, formDataUpload, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (type === 'pdf') {
        setFormData(prev => ({ ...prev, pdf_url: res.data.url }));
      } else {
        setFormData(prev => ({ ...prev, thumbnail_url: res.data.url }));
      }
    } catch (error) {
      alert(error.response?.data?.detail || 'Yükleme başarısız');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : null,
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null
      };

      if (editingCatalog) {
        await axios.put(`${API}/catalogs/${editingCatalog.id}`, payload, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
      } else {
        await axios.post(`${API}/catalogs`, payload, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
      }
      
      setShowForm(false);
      setEditingCatalog(null);
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Hata oluştu');
    }
  };

  const handleEdit = (catalog) => {
    setEditingCatalog(catalog);
    setFormData({
      brand_id: catalog.brand_id,
      title: catalog.title,
      description: catalog.description || '',
      pdf_url: catalog.pdf_url,
      thumbnail_url: catalog.thumbnail_url || '',
      category_id: catalog.category_id || '',
      valid_from: catalog.valid_from ? catalog.valid_from.split('T')[0] : '',
      valid_until: catalog.valid_until ? catalog.valid_until.split('T')[0] : '',
      is_active: catalog.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu kataloğu silmek istediğinize emin misiniz?')) return;
    
    try {
      await axios.delete(`${API}/catalogs/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      fetchData();
    } catch (error) {
      alert('Silme işlemi başarısız');
    }
  };

  const resetForm = () => {
    setFormData({
      brand_id: '',
      title: '',
      description: '',
      pdf_url: '',
      thumbnail_url: '',
      category_id: '',
      valid_from: '',
      valid_until: '',
      is_active: true
    });
  };

  const filteredCatalogs = catalogs.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBrandName = (brandId) => {
    const brand = brands.find(b => b.id === brandId);
    return brand?.name || 'Bilinmiyor';
  };

  if (loading) {
    return <div className="p-8 text-center">Yükleniyor...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Katalog Yönetimi</h1>
        <Button onClick={() => { setShowForm(true); setEditingCatalog(null); resetForm(); }}>
          <Plus className="w-4 h-4 mr-2" /> Yeni Katalog
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Katalog ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-void-paper rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingCatalog ? 'Kataloğu Düzenle' : 'Yeni Katalog Ekle'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mağaza *</label>
                <select
                  value={formData.brand_id}
                  onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                  className="w-full p-2 rounded-lg bg-void-subtle border border-white/10"
                  required
                >
                  <option value="">Seçin...</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Katalog Adı *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 rounded-lg bg-void-subtle border border-white/10 min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">PDF Dosyası * (Max 10MB)</label>
                <div className="flex gap-2">
                  <Input
                    value={formData.pdf_url}
                    onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                    placeholder="PDF URL veya yükleyin"
                    className="flex-1"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload(e, 'pdf')}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" disabled={uploading}>
                      <Upload className="w-4 h-4" />
                    </Button>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Önizleme Görseli</label>
                <div className="flex gap-2">
                  <Input
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    placeholder="Görsel URL veya yükleyin"
                    className="flex-1"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'image')}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" disabled={uploading}>
                      <Upload className="w-4 h-4" />
                    </Button>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Geçerlilik Başlangıcı</label>
                  <Input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Geçerlilik Bitişi</label>
                  <Input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm">Aktif</label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={uploading}>
                  {editingCatalog ? 'Güncelle' : 'Ekle'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  İptal
                </Button>
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
              <th className="px-4 py-3 text-left text-sm font-medium">Katalog</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Mağaza</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Geçerlilik</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Durum</th>
              <th className="px-4 py-3 text-right text-sm font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredCatalogs.map(catalog => (
              <tr key={catalog.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-void-subtle flex items-center justify-center">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium">{catalog.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{getBrandName(catalog.brand_id)}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {catalog.valid_from && new Date(catalog.valid_from).toLocaleDateString('tr-TR')}
                  {catalog.valid_from && catalog.valid_until && ' - '}
                  {catalog.valid_until && new Date(catalog.valid_until).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${catalog.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {catalog.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(catalog)} className="p-2 hover:bg-white/10 rounded-lg">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(catalog.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredCatalogs.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            Henüz katalog bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCatalogsPage;
