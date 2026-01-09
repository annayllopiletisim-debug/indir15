import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/db';
import { BlogPost } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    
    let query: any = {};
    if (published === 'true') {
      query.is_published = true;
    }
    
    const posts = await BlogPost.find(query).sort({ created_at: -1 }).limit(100).lean();
    const sanitized = posts.map((p: any) => ({ ...p, _id: undefined }));
    return NextResponse.json(sanitized);
  } catch (error) {
    return NextResponse.json({ error: 'Veriler alınamadı' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { authenticated } = await verifyAuth();
    if (!authenticated) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    
    const post = new BlogPost({
      id: uuidv4(),
      ...data,
      published_at: data.is_published ? new Date() : null,
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    await post.save();
    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Blog post creation error:', error);
    return NextResponse.json({ error: 'Kayıt başarısız' }, { status: 500 });
  }
}
