import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = '/app/uploads';

const MIME_TYPES: Record<string, string> = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'svg': 'image/svg+xml',
};

// Simple 1x1 transparent PNG placeholder
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const filename = path.join('/');
    const filepath = join(UPLOAD_DIR, filename);

    // Security: Prevent directory traversal
    if (!filepath.startsWith(UPLOAD_DIR)) {
      return new NextResponse(PLACEHOLDER_PNG, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=60',
        },
      });
    }

    if (!existsSync(filepath)) {
      // Return placeholder image instead of JSON error
      return new NextResponse(PLACEHOLDER_PNG, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=60',
        },
      });
    }

    const file = await readFile(filepath);
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    // Return placeholder on error
    return new NextResponse(PLACEHOLDER_PNG, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=60',
      },
    });
  }
}
