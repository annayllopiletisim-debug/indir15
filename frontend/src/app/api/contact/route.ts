import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/db';
import { ContactMessage } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';

// Public: Submit contact form
export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json({ error: 'Ad, e-posta ve mesaj gerekli' }, { status: 400 });
    }
    
    const contact = new ContactMessage({
      id: uuidv4(),
      name: data.name,
      email: data.email,
      subject: data.subject || 'Genel',
      message: data.message,
      is_read: false,
      created_at: new Date(),
    });
    
    await contact.save();
    return NextResponse.json({ success: true, message: 'Mesajınız alındı' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Mesaj gönderilemedi' }, { status: 500 });
  }
}

// Admin: Get all messages
export async function GET() {
  try {
    const { authenticated } = await verifyAuth();
    if (!authenticated) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    await connectDB();
    const messages = await ContactMessage.find({}).sort({ created_at: -1 }).lean();
    const sanitized = messages.map((m: any) => ({ ...m, _id: undefined }));
    return NextResponse.json(sanitized);
  } catch (error) {
    return NextResponse.json({ error: 'Veriler alınamadı' }, { status: 500 });
  }
}
