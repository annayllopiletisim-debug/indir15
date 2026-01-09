// Helper to get proper image URL
export function getImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://indirimci-2.preview.emergentagent.com';
  
  // Already absolute URL
  if (url.startsWith('http')) {
    return url;
  }
  
  // Local upload path
  if (url.startsWith('/api/uploads/')) {
    return `${backendUrl}${url}`;
  }
  
  if (url.startsWith('/uploads/')) {
    return `${backendUrl}/api${url}`;
  }
  
  // Default - prepend backend URL with /api/uploads
  return `${backendUrl}/api/uploads/${url}`;
}
