// Helper to get proper image URL
export function getImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  
  // Already absolute URL (Cloudinary, CDN, etc.)
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
// Cloudinary URLs don't need unoptimized - they handle their own optimization
export function isInternalUpload(url: string | undefined | null): boolean {
  if (!url) return false;
  
  // Cloudinary URLs are external and optimized
  if (url.startsWith('http') && url.includes('cloudinary.com')) {
    return false;
  }
  
  // External URLs don't need unoptimized
  if (url.startsWith('http')) {
    return false;
  }
  
  const processedUrl = getImageUrl(url);
  return processedUrl.startsWith('/api/uploads/');
}

// Placeholder image for when image fails to load
export const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EGörsel Yüklenemedi%3C/text%3E%3C/svg%3E';

// Blur placeholder for images - small base64 image
export const BLUR_PLACEHOLDER = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pFdz2MlWa7D7RdCtSh2F//2Q==';
