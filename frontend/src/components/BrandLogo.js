import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

const BrandLogo = ({ logoUrl, brandName, size = 'md', className = '' }) => {
  const [hasError, setHasError] = useState(false);

  // #7 - Büyütülmüş logo boyutları
  const sizeClasses = {
    xs: 'w-8 h-8',      // 28px -> 32px
    sm: 'w-12 h-12',    // 40px -> 48px
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const iconSizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // Generate initials for fallback
  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.split(' ');
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return name.substring(0, 2);
  };

  // Determine if it's a local upload or external URL
  const getLogoSrc = () => {
    if (!logoUrl) return null;
    if (logoUrl.startsWith('/uploads/')) {
      return `${process.env.REACT_APP_BACKEND_URL}/api${logoUrl}`;
    }
    if (logoUrl.startsWith('/api/uploads/')) {
      return `${process.env.REACT_APP_BACKEND_URL}${logoUrl}`;
    }
    return logoUrl;
  };

  const logoSrc = getLogoSrc();

  // Fallback with initials (improved from icon)
  if (!logoSrc || hasError) {
    return (
      <div
        className={`${sizeClasses[size]} ${className} rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 flex items-center justify-center flex-shrink-0`}
        title={brandName}
      >
        <span className={`font-bold text-primary uppercase ${
          size === 'xs' ? 'text-xs' : 
          size === 'sm' ? 'text-sm' : 
          size === 'md' ? 'text-base' : 
          size === 'lg' ? 'text-xl' : 'text-2xl'
        }`}>
          {getInitials(brandName)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${className} rounded-xl bg-white flex items-center justify-center p-1.5 overflow-hidden flex-shrink-0`}
      title={brandName}
    >
      <img
        src={logoSrc}
        alt={brandName || 'Brand logo'}
        className="max-w-full max-h-full object-contain"
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
};

export default BrandLogo;
