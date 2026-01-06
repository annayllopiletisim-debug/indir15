import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Search, Tag, GripVertical, Upload, Download, X } from 'lucide-react';
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
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [editingMapping, setEditingMapping] = useState(null);
  const [draggedBrand, setDraggedBrand] = useState(null);
  const [formData, setFormData] = useState({
    keyword: '',
    brand_ids: [],
    category_id: '',
    priority: 0,
    is_active: true
  });
  const fileInputRef = useRef(null);

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
    if (!window.confirm('Bu eşleştirmeyi silmek istediğinize emin misiniz?')) return;
    
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

  // Drag and Drop handlers
  const handleDragStart = (e, index) => {
    setDraggedBrand(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedBrand === null || draggedBrand === index) return;
    
    const newBrandIds = [...formData.brand_ids];
    const draggedItem = newBrandIds[draggedBrand];
    newBrandIds.splice(draggedBrand, 1);
    newBrandIds.splice(index, 0, draggedItem);
    
    setFormData(prev => ({ ...prev, brand_ids: newBrandIds }));
    setDraggedBrand(index);
  };

  const handleDragEnd = () => {
    setDraggedBrand(null);
  };

  // CSV Import/Export
  const handleCSVImport = async () => {
    try {
      const lines = csvData.trim().split('\n');
      let successCount = 0;
      let errorCount = 0;

      for (const line of lines) {
        const [keyword, ...brandNames] = line.split(',').map(s => s.trim());
        if (!keyword) continue;

        const brandIds = brandNames
          .map(name => brands.find(b => b.name.toLowerCase() === name.toLowerCase())?.id)
          .filter(Boolean);

        try {
          await axios.post(`${API}/keyword-mappings`, {
            keyword: keyword.toLowerCase(),
            brand_ids: brandIds,
            priority: 0,
            is_active: true
          }, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
          });
          successCount++;
        } catch (e) {
          errorCount++;
        }
      }

      alert(`İçe aktarma tamamlandı!\n✓ ${successCount} başarılı\n✗ ${errorCount} hatalı`);
      setShowCSVModal(false);
      setCsvData('');
      fetchData();
    } catch (error) {
      alert('CSV içe aktarma hatası');
    }
  };

  const handleCSVExport = () => {
    const csvContent = mappings.map(m => {
      const brandNames = m.brand_ids?.map(id => getBrandName(id)).join(',') || '';
      return `${m.keyword},${brandNames}`;
    }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keyword_mappings.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvData(event.target.result);
      setShowCSVModal(true);
    };
    reader.readAsText(file);
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
          <p className="text-sm text-gray-400">Arama kelimelerini mağazalarla eşleştirin</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" /> CSV İçe Aktar
          </Button>
          <Button variant="outline" onClick={handleCSVExport}>
            <Download className="w-4 h-4 mr-2" /> CSV Dışa Aktar
          </Button>
          <Button onClick={() => { setShowForm(true); setEditingMapping(null); resetForm(); }}>
            <Plus className="w-4 h-4 mr-2" /> Yeni Eşleştirme
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Anahtar kelime ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* CSV Import Modal */}
      {showCSVModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-void-paper rounded-2xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">CSV İçe Aktarma</h2>
              <button onClick={() => setShowCSVModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-400 mb-4">
              Format: <code className="bg-void-subtle px-2 py-1 rounded">anahtar_kelime,mağaza1,mağaza2,mağaza3</code>
            </p>
            
            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              className="w-full h-64 p-4 bg-void-subtle rounded-lg font-mono text-sm resize-none"
              placeholder="ayakkabı,Nike,Adidas,Puma&#10;telefon,Apple Store,Samsung&#10;giyim,Zara,H&M,Mango"
            />

            <div className="flex gap-2 mt-4">
              <Button onClick={handleCSVImport}>İçe Aktar</Button>
              <Button variant="outline" onClick={() => setShowCSVModal(false)}>İptal</Button>
            </div>
          </div>
        </div>
      )}

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
                <p className="text-xs text-gray-400 mt-1">Küçük harfle yazın, otomatik dönüştürülecek</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mağazalar (Sürükle-Bırak ile Sırala) *</label>
                
                {/* Selected brands with drag-drop */}
                {formData.brand_ids.length > 0 && (
                  <div className="mb-3 space-y-2">
                    <p className="text-xs text-gray-400">Seçili mağazalar (sürükleyerek sıralayın):</p>
                    {formData.brand_ids.map((brandId, index) => (
                      <div
                        key={brandId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-2 p-2 bg-void-subtle rounded-lg cursor-move ${
                          draggedBrand === index ? 'opacity-50' : ''
                        }`}
                      >
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <span className="w-6 h-6 rounded bg-neon-purple/20 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="flex-1">{getBrandName(brandId)}</span>
                        <button
                          type="button"
                          onClick={() => toggleBrand(brandId)}
                          className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                        >
                          ×
                        </button>
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
                <p className="text-xs text-gray-400 mt-1">Yüksek değer = Yüksek öncelik</p>
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
                      <span className="px-2 py-0.5 bg-void-subtle rounded text-xs text-gray-400">
                        +{mapping.brand_ids.length - 3} daha
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400">{mapping.priority}</td>
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
          <div className="p-8 text-center text-gray-400">
            Henüz anahtar kelime eşleştirmesi bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminKeywordsPage;
