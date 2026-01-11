import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Hardcoded credentials (fallback if env vars don't work)
const FALLBACK_USERNAME = 'admin';
const FALLBACK_PASSWORD_HASH = '$2b$10$RAtNBOxtp81Hjwtsfr.aVOIy7qWKY.LlKNyK9JjnmRemI59Vkzvya'; // Muzafferadmin*
const FALLBACK_JWT_SECRET = 'indirimkesfet-secret-key-2026';

export async function POST(request: Request) {
  try {
    // Use env vars if available, otherwise use fallbacks
    const jwtSecret = process.env.JWT_SECRET || FALLBACK_JWT_SECRET;
    const adminUsername = process.env.ADMIN_USERNAME || FALLBACK_USERNAME;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || FALLBACK_PASSWORD_HASH;

    const { username, password } = await request.json();

    // Validate credentials
    if (username !== adminUsername) {
      return NextResponse.json({ error: 'Geçersiz kullanıcı adı veya şifre' }, { status: 401 });
    }

    // Try with env hash first, then fallback
    let isValidPassword = bcrypt.compareSync(password, adminPasswordHash);
    
    // If env hash fails, try fallback hash
    if (!isValidPassword && adminPasswordHash !== FALLBACK_PASSWORD_HASH) {
      isValidPassword = bcrypt.compareSync(password, FALLBACK_PASSWORD_HASH);
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
