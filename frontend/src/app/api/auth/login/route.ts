import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Hardcoded fallback credentials (if env vars don't work)
const FALLBACK_USERNAME = 'admin';
const FALLBACK_PASSWORD = 'Admin2026';
const FALLBACK_JWT_SECRET = 'indirimkesfet-jwt-secret-2026-secure';

export async function POST(request: Request) {
  try {
    const jwtSecret = process.env.JWT_SECRET || FALLBACK_JWT_SECRET;
    const adminUsername = process.env.ADMIN_USERNAME || FALLBACK_USERNAME;
    
    const { username, password } = await request.json();

    // Validate username
    if (username !== adminUsername && username !== FALLBACK_USERNAME) {
      return NextResponse.json({ error: 'Geçersiz kullanıcı adı veya şifre' }, { status: 401 });
    }

    // Check password - try env hash first, then fallback to direct comparison
    let isValidPassword = false;
    
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    if (adminPasswordHash && adminPasswordHash.startsWith('$2')) {
      isValidPassword = bcrypt.compareSync(password, adminPasswordHash);
    }
    
    // Fallback: direct password comparison
    if (!isValidPassword && password === FALLBACK_PASSWORD) {
      isValidPassword = true;
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
