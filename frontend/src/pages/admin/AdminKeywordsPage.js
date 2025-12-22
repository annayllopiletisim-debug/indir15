import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Search, Tag, GripVertical } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { getAuthToken } from '../../utils/auth';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminKeywordsPage = () => {
  const [mappings, setMappings] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMapping, setEditingMapping] = useState(null);
  const [formData, setFormData] = useState({
    keyword: '',
    brand_ids: [],
    category_id: '',
    priority: 0,
    is_active: true
  });

  const fetchData = async () => {
    try {
      const [mappingsRes, brandsRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/keyword-mappings`, { headers: { Authorization: `Bearer ${getAuthToken()}` } }),
        axios.get(`${API}/brands`),
        axios.get(`${API}/categories`)
      ]);
      setMappings(mappingsRes.data);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingMapping) {
        await axios.put(`${API}/keyword-mappings/${editingMapping.id}`, formData, {
          headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
      } else {
        await axios.post(`${API}/keyword-mappings`, formData, {
          headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
      }
      
      setShowForm(false);
      setEditingMapping(null);
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Hata oluştu');
    }
  };

  const handleEdit = (mapping) => {
    setEditingMapping(mapping);
    setFormData({
      keyword: mapping.keyword,
      brand_ids: mapping.brand_ids || [],
      category_id: mapping.category_id || '',
      priority: mapping.priority || 0,
      is_active: mapping.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu eşleşmeyi silmek istediğinize emin misiniz?')) return;
    
    try {
      await axios.delete(`${API}/keyword-mappings/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      fetchData();
    } catch (error) {
      alert('Silme işlemi başarısız');
    }
  };

  const resetForm = () => {
    setFormData({
      keyword: '',
      brand_ids: [],
      category_id: '',
      priority: 0,
      is_active: true
    });
  };

  const toggleBrand = (brandId) => {
    setFormData(prev => {
      const newBrandIds = prev.brand_ids.includes(brandId)
        ? prev.brand_ids.filter(id => id !== brandId)
        : [...prev.brand_ids, brandId];
      return { ...prev, brand_ids: newBrandIds };
    });
  };

  const moveBrand = (fromIndex, toIndex) => {
    setFormData(prev => {
      const newBrandIds = [...prev.brand_ids];
      const [removed] = newBrandIds.splice(fromIndex, 1);
      newBrandIds.splice(toIndex, 0, removed);
      return { ...prev, brand_ids: newBrandIds };
    });
  };

  const filteredMappings = mappings.filter(m =>
    m.keyword.toLowerCase().includes(searchQuery.toLowerCase())
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
        <div>
          <h1 className="text-2xl font-heading font-bold">Anahtar Kelime Eşleştirme</h1>
          <p className="text-sm text-muted-foreground">Arama kelimelerini mağazalarla eşleştirin</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingMapping(null); resetForm(); }}>
          <Plus className="w-4 h-4 mr-2" /> Yeni Eşleştirme
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Anahtar kelime ara..."
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
              {editingMapping ? 'Eşleştirmeyi Düzenle' : 'Yeni Eşleştirme Ekle'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Anahtar Kelime *</label>
                <Input
                  value={formData.keyword}
                  onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                  placeholder="örn: ayakkabı, eşarp, telefon"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Küçük harfle yazın, otomatik dönüştürülecek</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mağazalar (Sıralı Öncelik) *</label>
                
                {/* Selected brands with priority order */}
                {formData.brand_ids.length > 0 && (
                  <div className="mb-3 space-y-2">
                    <p className="text-xs text-muted-foreground">Seçili mağazalar (öncelik sırasına göre):</p>
                    {formData.brand_ids.map((brandId, index) => (
                      <div key={brandId} className="flex items-center gap-2 p-2 bg-void-subtle rounded-lg">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <span className="flex-1">{index + 1}. {getBrandName(brandId)}</span>
                        <div className="flex gap-1">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => moveBrand(index, index - 1)}
                              className="px-2 py-1 text-xs bg-white/10 rounded hover:bg-white/20"
                            >
                              ↑
                            </button>
                          )}
                          {index < formData.brand_ids.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveBrand(index, index + 1)}
                              className="px-2 py-1 text-xs bg-white/10 rounded hover:bg-white/20"
                            >
                              ↓
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleBrand(brandId)}
                            className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Brand selector */}
                <div className="border border-white/10 rounded-lg p-3 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {brands.filter(b => !formData.brand_ids.includes(b.id)).map(brand => (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() => toggleBrand(brand.id)}
                        className="px-3 py-2 text-left text-sm rounded-lg hover:bg-white/10 transition-colors"
                      >
                        {brand.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Öncelik</label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground mt-1">Yüksek değer = Yüksek öncelik</p>
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
                <Button type="submit" disabled={formData.brand_ids.length === 0}>
                  {editingMapping ? 'Güncelle' : 'Ekle'}
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
              <th className="px-4 py-3 text-left text-sm font-medium">Anahtar Kelime</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Eşleşen Mağazalar</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Öncelik</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Durum</th>
              <th className="px-4 py-3 text-right text-sm font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredMappings.map(mapping => (
              <tr key={mapping.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-neon-purple" />
                    <span className="font-medium">{mapping.keyword}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {mapping.brand_ids?.slice(0, 3).map((brandId, i) => (
                      <span key={brandId} className="px-2 py-0.5 bg-void-subtle rounded text-xs">
                        {i + 1}. {getBrandName(brandId)}
                      </span>
                    ))}
                    {mapping.brand_ids?.length > 3 && (
                      <span className="px-2 py-0.5 bg-void-subtle rounded text-xs text-muted-foreground">
                        +{mapping.brand_ids.length - 3} daha
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{mapping.priority}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${mapping.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {mapping.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(mapping)} className="p-2 hover:bg-white/10 rounded-lg">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(mapping.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredMappings.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            Henüz anahtar kelime eşleştirmesi bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminKeywordsPage;
