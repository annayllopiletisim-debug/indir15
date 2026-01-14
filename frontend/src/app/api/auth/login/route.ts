import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // All credentials must come from environment variables - no fallbacks
    const jwtSecret = process.env.JWT_SECRET;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    
    // Fail fast if required env vars are missing
    if (!jwtSecret || !adminUsername || !adminPasswordHash) {
      console.error('Missing required environment variables for authentication');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    const { username, password } = await request.json();

    // Validate username
    if (username !== adminUsername) {
      return NextResponse.json({ error: 'Geçersiz kullanıcı adı veya şifre' }, { status: 401 });
    }

    // Check password against bcrypt hash from environment
    let isValidPassword = false;
    if (adminPasswordHash.startsWith('$2')) {
      isValidPassword = bcrypt.compareSync(password, adminPasswordHash);
    }
    
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
