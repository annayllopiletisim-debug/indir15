import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import connectDB from '@/lib/db';
import { BlogPost } from '@/lib/models';
import { Calendar, User, Eye, ArrowLeft, Tag } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getBlogPost(slug: string) {
  await connectDB();
  const post = await BlogPost.findOneAndUpdate(
    { slug, is_published: true },
    { $inc: { view_count: 1 } },
    { new: true }
  ).lean();
  if (!post) return null;
  return { ...(post as any), _id: undefined };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const post = await BlogPost.findOne({ slug, is_published: true }).lean();
  
  if (!post) {
    return { title: 'Yazı Bulunamadı' };
  }

  const postData = post as any;
  return {
    title: postData.meta_title || `${postData.title} | İndirim Keşfet Blog`,
    description: postData.meta_description || postData.excerpt || postData.title,
    openGraph: {
      title: postData.title,
      description: postData.excerpt || postData.title,
      images: postData.featured_image ? [postData.featured_image] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <article className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Tüm Yazılar
        </Link>

        {post.featured_image && (
          <div className="aspect-video rounded-xl overflow-hidden mb-8">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <header className="mb-8">
          {post.category && (
            <span className="text-sm px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">
              {post.category}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-4">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {post.author || 'Admin'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '-'}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {post.view_count || 0} görüntülenme
            </span>
          </div>
        </header>

        {post.excerpt && (
          <p className="text-lg text-gray-300 mb-8 border-l-4 border-purple-500 pl-4 italic">
            {post.excerpt}
          </p>
        )}

        <div
          className="prose prose-invert prose-purple max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-p:text-gray-300 prose-p:leading-relaxed
            prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white
            prose-ul:text-gray-300 prose-ol:text-gray-300
            prose-blockquote:border-purple-500 prose-blockquote:text-gray-400
            prose-code:text-purple-300 prose-code:bg-slate-800 prose-code:px-1 prose-code:rounded
            prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t border-slate-700">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-gray-400" />
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-slate-700 text-gray-300 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
