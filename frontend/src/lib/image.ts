// Helper to get proper image URL
export function getImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  
  // For server-side and client-side compatibility, use relative URLs when possible
  // Already absolute URL
  if (url.startsWith('http')) {
    return url;
  }
  
  // Local upload path - use relative URL (works both in preview and production)
  if (url.startsWith('/api/uploads/')) {
    return url;
  }
  
  if (url.startsWith('/uploads/')) {
    return `/api${url}`;
  }
  
  // Default - prepend /api/uploads
  return `/api/uploads/${url}`;
}
