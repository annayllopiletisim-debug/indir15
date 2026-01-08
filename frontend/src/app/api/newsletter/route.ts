import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Newsletter } from '@/lib/models';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin' }, { status: 400 });
    }
    
    await connectDB();
    
    // Check if already subscribed
    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.is_active) {
        return NextResponse.json({ message: 'Bu e-posta zaten kayıtlı' }, { status: 200 });
      } else {
        // Reactivate
        await Newsletter.updateOne({ email: email.toLowerCase() }, { is_active: true, subscribed_at: new Date() });
        return NextResponse.json({ message: 'Aboneliğiniz yeniden aktifleştirildi' });
      }
    }
    
    // Create new subscriber
    await Newsletter.create({
      email: email.toLowerCase(),
      is_active: true,
      subscribed_at: new Date()
    });
    
    return NextResponse.json({ message: 'Bültene başarıyla abone oldunuz!' });
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const count = await Newsletter.countDocuments({ is_active: true });
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
