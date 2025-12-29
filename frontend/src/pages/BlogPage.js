import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';
import { Search, Calendar, Clock, Eye, Star, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const BlogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 0 });

  const currentCategory = searchParams.get('kategori') || 'all';
  const currentPage = parseInt(searchParams.get('sayfa')) || 1;

  useEffect(() => {
    fetchData();
  }, [currentCategory, currentPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, tagsRes, popularRes] = await Promise.all([
        api.get('/blog/categories'),
        api.get('/blog/tags'),
        api.get('/blog/posts/popular?limit=4')
      ]);

      setCategories(categoriesRes.data);
      setTags(tagsRes.data);
      setPopularPosts(popularRes.data);

      // Fetch posts based on category
      const postsParams = new URLSearchParams();
      postsParams.append('page', currentPage);
      postsParams.append('limit', 9);
      if (currentCategory !== 'all') {
        postsParams.append('category_slug', currentCategory);
      }

      const postsRes = await api.get(`/blog/posts?${postsParams.toString()}`);
      setPosts(postsRes.data.posts);
      setPagination({
        page: postsRes.data.page,
        total: postsRes.data.total,
        total_pages: postsRes.data.total_pages
      });

      // Get featured post
      if (currentCategory === 'all' && currentPage === 1) {
        const featuredRes = await api.get('/blog/posts/featured?limit=1');
        setFeaturedPost(featuredRes.data[0] || null);
      } else {
        setFeaturedPost(null);
      }
    } catch (error) {
      console.error('Failed to fetch blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (slug) => {
    const params = new URLSearchParams();
    if (slug !== 'all') params.set('kategori', slug);
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('sayfa', newPage);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatViewCount = (count) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count;
  };

  // Filter posts for display (exclude featured from grid)
  const displayPosts = featuredPost 
    ? posts.filter(p => p.id !== featuredPost.id) 
    : posts;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Blog - İndirim Keşfet | Tasarruf Rehberi ve Kupon İpuçları</title>
        <meta name="description" content="Alışverişte tasarruf etmenin yolları, kupon kullanım ipuçları, marka kampanyaları ve daha fazlası. En güncel indirim haberlerini ve rehberlerini keşfedin." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
        {/* Blog Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <h1 className="text-2xl lg:text-3xl font-heading font-bold">Blog</h1>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Blog yazılarında ara..."
                className="pl-10 bg-card border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <p className="text-muted-foreground text-sm lg:text-base">
            Alışverişte tasarruf etmenin yolları, kupon kullanım ipuçları, marka kampanyaları ve daha fazlası. En güncel indirim haberlerini ve rehberlerini keşfedin.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              currentCategory === 'all'
                ? 'bg-primary text-white'
                : 'bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary'
            }`}
          >
            Tümü
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                currentCategory === cat.slug
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary'
              }`}
            >
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {cat.name}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <Link to={`/blog/${featuredPost.slug}`} className="block mb-10">
            <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all group">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Image */}
                <div className="h-48 lg:h-80 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  {featuredPost.image_url ? (
                    <img 
                      src={featuredPost.image_url} 
                      alt={featuredPost.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl opacity-30">📝</div>
                  )}
                </div>
                {/* Content */}
                <div className="p-6 lg:p-8 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-1.5 bg-primary text-white px-3 py-1 rounded-lg text-xs font-semibold w-fit mb-4">
                    <Star className="w-3 h-3" /> Öne Çıkan
                  </div>
                  <h2 className="text-xl lg:text-2xl font-heading font-bold mb-3 group-hover:text-primary transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-muted-foreground text-sm lg:text-base mb-4 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(featuredPost.published_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredPost.read_time} dk okuma
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {formatViewCount(featuredPost.view_count)} görüntüleme
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Posts Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-heading font-bold mb-4">
              {currentCategory === 'all' ? 'Son Yazılar' : categories.find(c => c.slug === currentCategory)?.name || 'Yazılar'}
            </h2>

            {displayPosts.length === 0 ? (
              <div className="bg-card rounded-xl p-8 text-center">
                <p className="text-muted-foreground">Bu kategoride henüz yazı bulunmuyor.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {displayPosts.map((post) => (
                  <Link 
                    key={post.id} 
                    to={`/blog/${post.slug}`}
                    className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all group"
                  >
                    {/* Image */}
                    <div className="h-40 bg-gradient-to-br from-muted to-card flex items-center justify-center relative">
                      {post.image_url ? (
                        <img 
                          src={post.image_url} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-4xl opacity-20">📝</div>
                      )}
                      <span className="absolute top-3 left-3 bg-black/60 px-2 py-1 rounded text-xs text-white font-medium">
                        {post.category_name}
                      </span>
                    </div>
                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-xs mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.published_at)}
                        </span>
                        <span>{post.read_time} dk</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                  let pageNum;
                  if (pagination.total_pages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.total_pages - 2) {
                    pageNum = pagination.total_pages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.total_pages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Popular Posts */}
            <div className="bg-card rounded-xl p-5 border border-border">
              <h3 className="font-heading font-semibold mb-4 pb-3 border-b border-border">Popüler Yazılar</h3>
              <div className="space-y-4">
                {popularPosts.map((post, index) => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="flex gap-3 group">
                    <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {formatViewCount(post.view_count)} görüntüleme
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="font-heading font-semibold mb-4 pb-3 border-b border-border">Etiketler</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 15).map((tag) => (
                    <Link
                      key={tag.name}
                      to={`/blog?tag=${tag.name}`}
                      className="bg-muted px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-primary hover:text-white transition-colors"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-5 text-white">
              <h3 className="font-heading font-semibold mb-2">Bülten</h3>
              <p className="text-sm text-white/90 mb-4">
                Haftalık en iyi tasarruf ipuçlarını e-posta ile al.
              </p>
              <Input
                type="email"
                placeholder="E-posta adresin"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70 mb-2"
              />
              <Button className="w-full bg-white text-primary hover:bg-white/90">
                Abone Ol
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default BlogPage;
