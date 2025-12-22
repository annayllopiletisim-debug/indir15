export const trackClick = async (type, itemId, brandId) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        item_id: itemId,
        brand_id: brandId,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to track click:', error);
    return false;
  }
};

export const buildUTMLink = (baseUrl, utmTemplate, itemId) => {
  if (!utmTemplate) return baseUrl;
  
  const params = new URLSearchParams();
  const utmParts = utmTemplate.split('&');
  
  utmParts.forEach(part => {
    const [key, value] = part.split('=');
    if (key && value) {
      params.append(key, value.replace('{item_id}', itemId));
    }
  });
  
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${params.toString()}`;
};

export const getTimeRemaining = (expiryDate) => {
  if (!expiryDate) return null;
  
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry - now;
  
  if (diff <= 0) {
    return { expired: true, text: 'Süresi Doldu' };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return { expired: false, text: `${days} gün ${hours} saat` };
  } else if (hours > 0) {
    return { expired: false, text: `${hours} saat ${minutes} dakika` };
  } else {
    return { expired: false, text: `${minutes} dakika` };
  }
};

export const shareOnWhatsApp = (text, url) => {
  const message = encodeURIComponent(`${text} - ${url}`);
  window.open(`https://wa.me/?text=${message}`, '_blank');
};

export const shareOnFacebook = (url) => {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
};