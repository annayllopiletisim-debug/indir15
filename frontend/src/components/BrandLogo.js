import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

const BrandLogo = ({ logoUrl, brandName, size = 'md', className = '' }) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // Determine if it's a local upload or external URL
  const getLogoSrc = () => {
    if (!logoUrl) return null;
    if (logoUrl.startsWith('/uploads/')) {
      return `${process.env.REACT_APP_BACKEND_URL}${logoUrl}`;
    }
    return logoUrl;
  };

  const logoSrc = getLogoSrc();

  if (!logoSrc || hasError) {
    return (
      <div
        className={`${sizeClasses[size]} ${className} rounded-xl bg-white flex items-center justify-center p-2`}
        title={brandName}
      >
        <Building2 className={`${iconSizes[size]} text-gray-400`} />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${className} rounded-xl bg-white flex items-center justify-center p-2 overflow-hidden`}
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
