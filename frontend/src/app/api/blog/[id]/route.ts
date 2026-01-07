import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { BlogPost } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    
    // Check if it's a slug or id
    let post = await BlogPost.findOne({ slug: id }).lean();
    if (!post) {
      post = await BlogPost.findOne({ id }).lean();
    }
    
    if (!post) {
      return NextResponse.json({ error: 'Yazı bulunamadı' }, { status: 404 });
    }
    
    // Increment view count for published posts
    if ((post as any).is_published) {
      await BlogPost.updateOne({ id: (post as any).id }, { $inc: { view_count: 1 } });
    }
    
    return NextResponse.json({ ...(post as any), _id: undefined });
  } catch (error) {
    return NextResponse.json({ error: 'Hata oluştu' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authenticated } = await verifyAuth();
    if (!authenticated) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const data = await request.json();
    
    // If publishing for the first time, set published_at
    const existingPost = await BlogPost.findOne({ id });
    if (data.is_published && existingPost && !existingPost.published_at) {
      data.published_at = new Date();
    }
    
    data.updated_at = new Date();
    
    const result = await BlogPost.updateOne({ id }, { $set: data });
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Yazı bulunamadı' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authenticated } = await verifyAuth();
    if (!authenticated) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const result = await BlogPost.deleteOne({ id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Yazı bulunamadı' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Silme başarısız' }, { status: 500 });
  }
}
