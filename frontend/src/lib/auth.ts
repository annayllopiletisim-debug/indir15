import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable');
}

export async function verifyAuth(): Promise<{ authenticated: boolean; user?: any }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return { authenticated: false };
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { username: string; role: string };
    return { authenticated: true, user: decoded };
  } catch (error) {
    return { authenticated: false };
  }
}
