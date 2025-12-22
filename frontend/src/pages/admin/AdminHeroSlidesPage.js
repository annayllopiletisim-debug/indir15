import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Search, Image, GripVertical, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { getAuthToken } from '../../utils/auth';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminHeroSlidesPage = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    button_text: '',
    order: 0,
    is_active: true
  });

  const fetchSlides = async () => {
    try {
      const res = await axios.get(`${API}/hero-slides?include_inactive=true`);
      setSlides(res.data);
    } catch (error) {
      console.error('Failed to fetch slides:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSlide) {
        await axios.put(`${API}/hero-slides/${editingSlide.id}`, formData, {
          headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
      } else {
        await axios.post(`${API}/hero-slides`, formData, {
          headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
      }
      setShowForm(false);
      setEditingSlide(null);
      resetForm();
      fetchSlides();
    } catch (error) {
      alert(error.response?.data?.detail || 'Hata oluştu');
    }
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      image_url: slide.image_url || '',
      link_url: slide.link_url || '',
      button_text: slide.button_text || '',
      order: slide.order || 0,
      is_active: slide.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu slaytı silmek istediğinize emin misiniz?')) return;
    try {
      await axios.delete(`${API}/hero-slides/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      fetchSlides();
    } catch (error) {
      alert('Silme işlemi başarısız');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      link_url: '',
      button_text: '',
      order: 0,
      is_active: true
    });
  };

  if (loading) {
    return <div className="p-8 text-center">Yükleniyor...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Hero Slaytlar</h1>
          <p className="text-sm text-muted-foreground">Ana sayfa slider yönetimi</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingSlide(null); resetForm(); }}>
          <Plus className="w-4 h-4 mr-2" /> Yeni Slayt
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-void-paper rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingSlide ? 'Slaytı Düzenle' : 'Yeni Slayt Ekle'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Başlık *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Alt Başlık</label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Görsel URL *</label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  required
                />
                {formData.image_url && (
                  <img src={formData.image_url} alt="Preview" className="mt-2 h-32 object-cover rounded-lg" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Link URL</label>
                <Input
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Buton Metni</label>
                <Input
                  value={formData.button_text}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  placeholder="Keşfet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sıra</label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
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
                <Button type="submit">
                  {editingSlide ? 'Güncelle' : 'Ekle'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  İptal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slides.map((slide, index) => (
          <div key={slide.id} className="glass-effect rounded-2xl overflow-hidden">
            <div className="relative h-40">
              {slide.image_url ? (
                <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-void-subtle flex items-center justify-center">
                  <Image className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded text-xs">
                Sıra: {slide.order}
              </div>
              <div className="absolute top-2 right-2">
                {slide.is_active ? (
                  <Eye className="w-5 h-5 text-green-400" />
                ) : (
                  <EyeOff className="w-5 h-5 text-red-400" />
                )}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold mb-1">{slide.title}</h3>
              {slide.subtitle && <p className="text-sm text-muted-foreground mb-2">{slide.subtitle}</p>}
              <div className="flex gap-2">
                <button onClick={() => handleEdit(slide)} className="p-2 hover:bg-white/10 rounded-lg">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(slide.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          Henüz slayt bulunmuyor.
        </div>
      )}
    </div>
  );
};

export default AdminHeroSlidesPage;
