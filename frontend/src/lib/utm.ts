// UTM parameters helper
export function addUtmParams(url: string, source: string = 'indirimkesfet'): string {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('utm_source', source);
    urlObj.searchParams.set('utm_medium', 'referral');
    urlObj.searchParams.set('utm_campaign', 'deal');
    return urlObj.toString();
  } catch {
    // If URL is invalid, try to add params manually
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}utm_source=${source}&utm_medium=referral&utm_campaign=deal`;
  }
}
