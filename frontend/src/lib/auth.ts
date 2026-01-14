import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function verifyAuth(): Promise<{ authenticated: boolean; user?: any }> {
  try {
    // JWT_SECRET must come from environment - no fallbacks
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET environment variable not set');
      return { authenticated: false };
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return { authenticated: false };
    }

    const decoded = jwt.verify(token, JWT_SECRET) as unknown as { username: string; role: string };
    return { authenticated: true, user: decoded };
  } catch (error) {
    return { authenticated: false };
  }
}
