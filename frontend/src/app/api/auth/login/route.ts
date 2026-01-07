import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_USERNAME = 'admin';
// Hardcoded for now - bcrypt hash for 'admin123'
const ADMIN_PASSWORD_HASH = '$2b$12$KyxZqhWBt9ViySfOUH1DSumNQ6e0wjhhR.XjeeikyQct3vraz73TO';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Validate credentials
    if (username !== ADMIN_USERNAME) {
      return NextResponse.json({ error: 'Geçersiz kullanıcı adı veya şifre' }, { status: 401 });
    }

    const isValidPassword = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Geçersiz kullanıcı adı veya şifre' }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Giriş başarılı',
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Giriş hatası' }, { status: 500 });
  }
}
