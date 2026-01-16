import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    // All credentials must come from environment variables - no fallbacks
    const jwtSecret = process.env.JWT_SECRET;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    // Fail fast if required env vars are missing
    if (!jwtSecret || !adminUsername || !adminPassword) {
      console.error('Missing required environment variables for authentication');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    const { username, password } = await request.json();

    // Validate credentials
    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json({ error: 'Geçersiz kullanıcı adı veya şifre' }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { username, role: 'admin' },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
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
