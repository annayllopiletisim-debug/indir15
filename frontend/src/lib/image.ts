// Helper to get proper image URL
export function getImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  
  // Already absolute URL
  if (url.startsWith('http')) {
    return url;
  }
  
  // Handle /uploads/ paths - these need to go through the API
  if (url.startsWith('/uploads/')) {
    return `/api${url}`;
  }
  
  // Already has /api prefix
  if (url.startsWith('/api/uploads/')) {
    return url;
  }
  
  // Relative path without leading slash
  if (!url.startsWith('/')) {
    return `/api/uploads/${url}`;
  }
  
  return url;
}

// Check if URL is an internal API upload (needs unoptimized rendering)
export function isInternalUpload(url: string | undefined | null): boolean {
  if (!url) return false;
  const processedUrl = getImageUrl(url);
  return processedUrl.startsWith('/api/uploads/');
}

// Placeholder image for when image fails to load
export const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EGörsel Yüklenemedi%3C/text%3E%3C/svg%3E';
