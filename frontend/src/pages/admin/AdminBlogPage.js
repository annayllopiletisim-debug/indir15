import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../utils/api';
import { Plus, Edit, Trash2, X, Search, Eye, EyeOff, Star, Sparkles, Loader2, Upload, Image } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const AdminBlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: '',
    image_url: '',
    tags: [],
    related_category_ids: [],
    is_featured: false,
    is_published: false,
    read_time: 5,
    meta_title: '',
    meta_description: ''
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [postsRes, categoriesRes, productCategoriesRes] = await Promise.all([
        api.get('/blog/posts'),
        api.get('/blog/categories'),
        api.get('/categories')
      ]);
      setPosts(postsRes.data.posts || []);
      setCategories(categoriesRes.data);
      setProductCategories(productCategoriesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData };
      editingId ? await api.put(`/blog/posts/${editingId}`, data) : await api.post('/blog/posts', data);
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Failed to save post:', error);
      alert('Hata: Blog yazısı kaydedilemedi');
    }
  };

  const handleEdit = (post) => {
    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      category_id: post.category_id || '',
      image_url: post.image_url || '',
      tags: post.tags || [],
      related_category_ids: post.related_category_ids || [],
      is_featured: post.is_featured || false,
      is_published: post.is_published || false,
      read_time: post.read_time || 5,
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || ''
    });
    setEditingId(post.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu yazıyı silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/blog/posts/${id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category_id: '',
      image_url: '',
      tags: [],
      related_category_ids: [],
      is_featured: false,
      is_published: false,
      read_time: 5,
      meta_title: '',
      meta_description: ''
    });
    setTagInput('');
    setEditingId(null);
    setShowForm(false);
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const toggleRelatedCategory = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      related_category_ids: prev.related_category_ids.includes(categoryId)
        ? prev.related_category_ids.filter(id => id !== categoryId)
        : [...prev.related_category_ids, categoryId]
    }));
  };

  // AI Excerpt Generation
  const generateAIExcerpt = async () => {
    if (!formData.title || !formData.content) {
      alert('Lütfen önce başlık ve içerik alanlarını doldurun');
      return;
    }

    setGeneratingAI(true);
    try {
      const category = categories.find(c => c.id === formData.category_id);
      const response = await api.post('/generate-description', {
        brand_name: category?.name || 'Blog',
        title: formData.title,
        discount_text: formData.content.substring(0, 200).replace(/<[^>]*>/g, ''),
        expiry_date: null
      });

      if (response.data.description) {
        setFormData(prev => ({ ...prev, excerpt: response.data.description }));
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      alert('Özet oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setGeneratingAI(false);
    }
  };

  // Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Görsel boyutu 2MB\'dan küçük olmalıdır');
      return;
    }

    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      const response = await api.post('/upload/logo', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, image_url: response.data.url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Görsel yüklenemedi');
    } finally {
      setUploadingImage(false);
    }
  };

  const getCategoryName = (categoryId) => categories.find(c => c.id === categoryId)?.name || 'Bilinmiyor';

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'published' && post.is_published) ||
      (statusFilter === 'draft' && !post.is_published);
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

  return (
    <>
      <Helmet><title>Blog Yönetimi - Admin</title></Helmet>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading font-bold">Blog Yönetimi</h1>
            <p className="text-sm text-gray-400">Toplam {posts.length} yazı</p>
          </div>
          <Button onClick={() => { setShowForm(true); setEditingId(null); }}>
            <Plus className="w-4 h-4 mr-2" /> Yeni Yazı
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Yazı ara..."
              className="pl-10 bg-void-paper border-white/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-void-paper border border-white/10 rounded-lg text-sm"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="published">Yayında</option>
            <option value="draft">Taslak</option>
          </select>
        </div>

        {/* Posts Table */}
        <div className="bg-void-paper rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-void-subtle">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Başlık</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Kategori</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Durum</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Görüntüleme</th>
                <th className="text-right p-4 text-sm font-medium text-gray-400">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {post.image_url ? (
                        <img src={post.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-void-subtle rounded-lg flex items-center justify-center">
                          <Image className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {post.title}
                          {post.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                        </div>
                        <div className="text-xs text-gray-500">/{post.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{getCategoryName(post.category_id)}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      post.is_published 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {post.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {post.is_published ? 'Yayında' : 'Taslak'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">{post.view_count || 0}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(post.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPosts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    Henüz blog yazısı bulunmuyor
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 overflow-y-auto py-8">
            <div className="bg-void-paper rounded-xl w-full max-w-4xl mx-4 border border-white/10">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-heading font-semibold">
                  {editingId ? 'Yazı Düzenle' : 'Yeni Yazı'}
                </h2>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                {/* Basic Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Başlık *</label>
                    <Input
                      value={formData.title}
                      onChange={handleTitleChange}
                      placeholder="Yazı başlığı"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Slug *</label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="yazi-slug"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Kategori *</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                      className="w-full px-3 py-2 bg-void-subtle border border-white/10 rounded-lg"
                      required
                    >
                      <option value="">Kategori Seçin</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Okuma Süresi (dk)</label>
                    <Input
                      type="number"
                      value={formData.read_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, read_time: parseInt(e.target.value) || 5 }))}
                      min="1"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-1">Kapak Görseli</label>
                  <div className="flex items-center gap-4">
                    {formData.image_url ? (
                      <img src={formData.image_url} alt="" className="w-24 h-24 rounded-lg object-cover" />
                    ) : (
                      <div className="w-24 h-24 bg-void-subtle rounded-lg flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        value={formData.image_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                        placeholder="Görsel URL'si"
                        className="mb-2"
                      />
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <Button type="button" variant="outline" size="sm" disabled={uploadingImage} asChild>
                          <span>
                            {uploadingImage ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                            Görsel Yükle
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium">Özet *</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateAIExcerpt}
                      disabled={generatingAI}
                    >
                      {generatingAI ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      AI ile Oluştur
                    </Button>
                  </div>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 bg-void-subtle border border-white/10 rounded-lg resize-none"
                    placeholder="Yazının kısa özeti (SEO için önemli)"
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium mb-1">İçerik * (HTML destekler)</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={10}
                    className="w-full px-3 py-2 bg-void-subtle border border-white/10 rounded-lg resize-none font-mono text-sm"
                    placeholder="<h2>Başlık</h2><p>Paragraf...</p>"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    HTML etiketleri kullanabilirsiniz: h2, h3, p, ul, li, strong, a, vb.
                  </p>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-1">Etiketler</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Etiket ekle"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>Ekle</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 bg-primary/20 text-primary px-2 py-1 rounded-lg text-sm">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Related Categories for CTA */}
                <div>
                  <label className="block text-sm font-medium mb-1">İlgili Ürün Kategorileri (CTA için)</label>
                  <p className="text-xs text-gray-500 mb-2">Blog yazısının sonunda gösterilecek kategori kuponları</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-void-subtle rounded-lg border border-white/10">
                    {productCategories.length === 0 ? (
                      <p className="text-sm text-gray-500 col-span-full py-2">Henüz ürün kategorisi bulunmuyor</p>
                    ) : (
                      productCategories.map((cat) => (
                        <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={formData.related_category_ids.includes(cat.id)}
                            onChange={() => toggleRelatedCategory(cat.id)}
                            className="rounded border-white/20"
                          />
                          <span className="text-sm">{cat.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* SEO Fields */}
                <div className="border-t border-white/10 pt-4">
                  <h3 className="text-sm font-medium mb-3">SEO Ayarları</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Meta Başlık</label>
                      <Input
                        value={formData.meta_title}
                        onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                        placeholder="SEO başlığı (boş bırakılırsa yazı başlığı kullanılır)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Meta Açıklama</label>
                      <textarea
                        value={formData.meta_description}
                        onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 bg-void-subtle border border-white/10 rounded-lg resize-none"
                        placeholder="SEO açıklaması (boş bırakılırsa özet kullanılır)"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Toggles */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                      className="rounded border-white/20"
                    />
                    <span className="text-sm">Yayınla</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="rounded border-white/20"
                    />
                    <span className="text-sm">Öne Çıkan</span>
                  </label>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <Button type="button" variant="outline" onClick={resetForm}>İptal</Button>
                  <Button type="submit">{editingId ? 'Güncelle' : 'Kaydet'}</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminBlogPage;
