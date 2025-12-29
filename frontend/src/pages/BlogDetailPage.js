import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';
import { Calendar, Clock, Eye, ChevronRight, Tag, Share2, Twitter, Facebook, Linkedin, ArrowRight, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [ctaData, setCTAData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(null);

  useEffect(() => {
    fetchPost();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const [postRes, relatedRes] = await Promise.all([
        api.get(`/blog/posts/${slug}`),
        api.get(`/blog/posts/${slug}/related?limit=3`)
      ]);
      
      setPost(postRes.data);
      setRelatedPosts(relatedRes.data);

      // Fetch CTA data for related categories
      if (postRes.data.related_category_ids?.length > 0) {
        const ctaRes = await api.get(`/blog/cta-data?category_ids=${postRes.data.related_category_ids.join(',')}`);
        setCTAData(ctaRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatViewCount = (count) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count;
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = post?.title || '';

  const handleShare = (platform) => {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    };
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  // Extract headings from content for TOC
  const extractHeadings = (content) => {
    if (!content) return [];
    const regex = /<h([23])[^>]*>(.*?)<\/h\1>/gi;
    const headings = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      const text = match[2].replace(/<[^>]*>/g, '');
      headings.push({
        level: parseInt(match[1]),
        text,
        id: text.toLowerCase().replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      });
    }
    return headings;
  };

  // Add IDs to headings in content
  const processContent = (content) => {
    if (!content) return '';
    return content.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, text) => {
      const cleanText = text.replace(/<[^>]*>/g, '');
      const id = cleanText.toLowerCase().replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      return `<h${level} id="${id}" class="scroll-mt-20"${attrs}>${text}</h${level}>`;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Yazı Bulunamadı</h1>
          <Link to="/blog" className="text-primary hover:underline">Blog'a Dön</Link>
        </div>
      </div>
    );
  }

  const headings = extractHeadings(post.content);
  const processedContent = processContent(post.content);

  // JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.image_url || '',
    "datePublished": post.published_at,
    "dateModified": post.updated_at,
    "author": {
      "@type": "Organization",
      "name": "İndirim Keşfet"
    },
    "publisher": {
      "@type": "Organization",
      "name": "İndirim Keşfet",
      "logo": {
        "@type": "ImageObject",
        "url": "/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": shareUrl
    }
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": "/" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "/blog" },
      { "@type": "ListItem", "position": 3, "name": post.category_name, "item": `/blog?kategori=${post.category_slug}` },
      { "@type": "ListItem", "position": 4, "name": post.title }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{post.meta_title || post.title} - İndirim Keşfet Blog</title>
        <meta name="description" content={post.meta_description || post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={shareUrl} />
        {post.image_url && <meta property="og:image" content={post.image_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      </Helmet>

      <article className="max-w-4xl mx-auto px-4 py-6 lg:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-primary">Ana Sayfa</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/blog" className="hover:text-primary">Blog</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/blog?kategori=${post.category_slug}`} className="hover:text-primary">{post.category_name}</Link>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-medium mb-4">
            {post.category_name}
          </span>
          <h1 className="text-2xl lg:text-4xl font-heading font-bold mb-4 leading-tight">
            {post.title}
          </h1>
          <p className="text-muted-foreground text-base lg:text-lg mb-6">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(post.published_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.read_time} dk okuma
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {formatViewCount(post.view_count)} görüntüleme
            </span>
          </div>
        </header>

        {/* Featured Image */}
        {post.image_url && (
          <div className="rounded-2xl overflow-hidden mb-8">
            <img 
              src={post.image_url} 
              alt={post.title}
              className="w-full h-64 lg:h-96 object-cover"
            />
          </div>
        )}

        {/* Table of Contents */}
        {headings.length > 2 && (
          <div className="bg-card rounded-xl p-5 mb-8 border border-border">
            <h4 className="font-heading font-semibold mb-3 flex items-center gap-2">
              📑 İçindekiler
            </h4>
            <ul className="space-y-2">
              {headings.map((heading, index) => (
                <li key={index} className={heading.level === 3 ? 'ml-4' : ''}>
                  <a 
                    href={`#${heading.id}`}
                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Article Content */}
        <div 
          className="prose prose-invert max-w-none mb-8
            prose-headings:font-heading prose-headings:font-bold
            prose-h2:text-xl prose-h2:lg:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-ul:my-4 prose-li:text-muted-foreground
            prose-strong:text-foreground"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />

        {/* Mid-Article CTA Box (Yazı Ortası CTA) */}
        {ctaData.length > 0 && (
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 lg:p-8 my-10 text-white">
            <h4 className="text-lg lg:text-xl font-heading font-bold mb-2 flex items-center gap-2">
              🎯 Güncel Kuponları Keşfet
            </h4>
            <p className="text-white/90 mb-4">
              Bu kategorilerde aktif kampanyalar sizi bekliyor
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {ctaData.slice(0, 3).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/kategori/${cat.slug}`}
                  className="bg-white/10 hover:bg-white/20 rounded-xl p-3 flex items-center gap-3 transition-colors group"
                >
                  <span className="text-2xl">{cat.icon_url || '🏷️'}</span>
                  <div>
                    <div className="font-medium text-sm">{cat.name}</div>
                    <div className="text-xs text-white/70">{cat.deal_count} kupon</div>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap py-6 border-t border-border">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Tag className="w-4 h-4" /> Etiketler:
            </span>
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/blog?tag=${tag}`}
                className="bg-card border border-border px-3 py-1 rounded-lg text-sm text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Share Section */}
        <div className="flex items-center justify-between py-6 border-t border-border">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Share2 className="w-4 h-4" /> Bu yazıyı paylaş:
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleShare('twitter')}
              className="hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2]"
            >
              <Twitter className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleShare('facebook')}
              className="hover:bg-[#4267B2] hover:text-white hover:border-[#4267B2]"
            >
              <Facebook className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleShare('linkedin')}
              className="hover:bg-[#0077B5] hover:text-white hover:border-[#0077B5]"
            >
              <Linkedin className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* End of Article CTA Box (Yazı Sonu CTA) */}
        {ctaData.length > 0 && (
          <div className="bg-card rounded-2xl p-6 lg:p-8 my-8 border border-border">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h4 className="text-lg font-heading font-bold mb-1">İlgili Kategoriler</h4>
                <p className="text-sm text-muted-foreground">Bu yazıyla ilgili kategorilerde aktif kuponları keşfedin</p>
              </div>
              <Link 
                to="/kategoriler" 
                className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
              >
                Tüm Kategoriler <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ctaData.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/kategori/${cat.slug}`}
                  className="flex items-center gap-4 p-4 bg-muted/50 hover:bg-primary/10 rounded-xl transition-colors group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
                    {cat.icon_url || '🏷️'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium group-hover:text-primary transition-colors">{cat.name}</div>
                    <div className="text-sm text-green-500 font-medium">{cat.deal_count} aktif kupon</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="bg-muted/30 rounded-2xl p-6 lg:p-8 mt-10">
            <h3 className="text-lg font-heading font-bold mb-6">İlgili Yazılar</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedPosts.map((relatedPost) => (
                <Link 
                  key={relatedPost.id} 
                  to={`/blog/${relatedPost.slug}`}
                  className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all group"
                >
                  <div className="h-28 bg-gradient-to-br from-muted to-card flex items-center justify-center">
                    {relatedPost.image_url ? (
                      <img 
                        src={relatedPost.image_url} 
                        alt={relatedPost.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-3xl opacity-20">📝</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {relatedPost.title}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(relatedPost.published_at)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
};

export default BlogDetailPage;
