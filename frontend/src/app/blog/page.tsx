import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import connectDB from '@/lib/db';
import { BlogPost } from '@/lib/models';
import { FileText, Calendar, Eye, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog - İndirim ve Tasarruf Rehberi',
  description: 'Alışveriş ipuçları, tasarruf rehberleri ve en güncel kampanya haberleri.',
  alternates: {
    canonical: '/blog',
  },
};

// Cache for 30 minutes, revalidated on-demand when admin makes changes
export const revalidate = 1800;

async function getBlogPosts() {
  try {
    const conn = await connectDB();
    if (!conn) return []; // Build phase
    
    const posts = await BlogPost.find({ is_published: true })
      .sort({ published_at: -1, created_at: -1 })
      .lean();
    
    return posts.map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      featured_image: p.featured_image,
      category: p.category,
      author: p.author,
      view_count: p.view_count || 0,
      published_at: p.published_at ? (typeof p.published_at === 'string' ? p.published_at : p.published_at.toISOString()) : null,
      created_at: p.created_at ? (typeof p.created_at === 'string' ? p.created_at : p.created_at.toISOString()) : null,
    }));
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Blog</h1>
              <p className="text-violet-200 mt-1">Alışveriş ipuçları ve tasarruf rehberleri</p>
            </div>
            <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm">{posts.length} Yazı</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Henüz blog yazısı yok.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-gray-100 group-hover:border-purple-200 h-full flex flex-col">
                  {/* Image */}
                  {post.featured_image ? (
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <FileText className="w-12 h-12 text-purple-300" />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    {/* Category */}
                    {post.category && (
                      <span className="inline-block self-start px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium mb-3">
                        {post.category}
                      </span>
                    )}
                    
                    {/* Title */}
                    <h2 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {post.title}
                    </h2>
                    
                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
                        {post.excerpt}
                      </p>
                    )}
                    
                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {post.published_at || post.created_at
                            ? new Date(post.published_at || post.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '-'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {post.view_count}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-purple-600 font-medium group-hover:gap-2 transition-all">
                        Oku <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
