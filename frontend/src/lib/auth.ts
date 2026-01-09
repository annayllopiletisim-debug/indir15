import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';

export async function verifyAuth(): Promise<{ authenticated: boolean; user?: any }> {
  try {
    if (!JWT_SECRET) {
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
