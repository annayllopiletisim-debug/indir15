import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // Read env vars at runtime for each request
    const jwtSecret = process.env.JWT_SECRET;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    // Debug log
    console.log('Login attempt - env check:', { 
      hasJwt: !!jwtSecret, 
      hasUser: !!adminUsername, 
      hasHash: !!adminPasswordHash,
      hashValue: adminPasswordHash?.substring(0, 20) + '...'
    });

    if (!jwtSecret || !adminUsername || !adminPasswordHash) {
      console.error('Missing env vars:', { jwtSecret: !!jwtSecret, adminUsername: !!adminUsername, adminPasswordHash: !!adminPasswordHash });
      return NextResponse.json({ error: 'Sunucu yapılandırma hatası' }, { status: 500 });
    }

    const { username, password } = await request.json();

    console.log('Login attempt:', { username, expectedUsername: adminUsername });

    // Validate credentials
    if (username !== adminUsername) {
      console.log('Username mismatch');
      return NextResponse.json({ error: 'Geçersiz kullanıcı adı veya şifre' }, { status: 401 });
    }

    const isValidPassword = bcrypt.compareSync(password, adminPasswordHash);
    console.log('Password check result:', isValidPassword);
    if (!isValidPassword) {
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
