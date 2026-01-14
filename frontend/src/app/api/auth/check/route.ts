import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    // JWT_SECRET must come from environment - no fallbacks
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET environment variable not set');
      return NextResponse.json({ authenticated: false, error: 'Server configuration error' }, { status: 500 });
    }
    
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { username: string; role: string };
    
    return NextResponse.json({ 
      authenticated: true, 
      user: { username: decoded.username, role: decoded.role } 
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
