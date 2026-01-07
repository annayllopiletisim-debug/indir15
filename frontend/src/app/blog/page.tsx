import Link from 'next/link';
import { Metadata } from 'next';
import connectDB from '@/lib/db';
import { BlogPost } from '@/lib/models';
import { Calendar, User, Eye, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | İndirim Keşfet',
  description: 'En güncel indirim haberleri, alışveriş ipuçları ve kampanya duyuruları.',
};

async function getBlogPosts() {
  await connectDB();
  const posts = await BlogPost.find({ is_published: true })
    .sort({ published_at: -1 })
    .lean();
  return posts.map((p: any) => ({ ...p, _id: undefined }));
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Blog</h1>
          <p className="text-gray-400 text-lg">En güncel indirim haberleri ve alışveriş ipuçları</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Henüz blog yazısı yayınlanmadı.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/10 group"
              >
                {post.featured_image ? (
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <span className="text-6xl">📰</span>
                  </div>
                )}
                <div className="p-5">
                  {post.category && (
                    <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                      {post.category}
                    </span>
                  )}
                  <h2 className="text-xl font-semibold text-white mt-3 mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author || 'Admin'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString('tr-TR')
                          : '-'}
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.view_count || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
