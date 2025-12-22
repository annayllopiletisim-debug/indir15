export const trackClick = async (type, itemId, brandId, categoryId = null) => {
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
        category_id: categoryId,
        session_id: getSessionId(),
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to track click:', error);
    return false;
  }
};

// Get or create session ID for tracking
export const getSessionId = () => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
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

export const isExpiringSoon = (expiryDate) => {
  if (!expiryDate) return false;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry - now;
  return diff > 0 && diff <= 24 * 60 * 60 * 1000;
};

export const shareOnWhatsApp = (text, url) => {
  const message = encodeURIComponent(`${text} - ${url}`);
  window.open(`https://wa.me/?text=${message}`, '_blank');
};

export const shareOnFacebook = (url) => {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
