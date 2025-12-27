import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Flame, ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import BrandLogo from './BrandLogo';

// Helper to check if expiring within 24 hours
const isExpiringSoon = (expiryDate) => {
  if (!expiryDate) return false;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry - now;
  return diff > 0 && diff <= 24 * 60 * 60 * 1000;
};

// Helper to get time remaining
const getTimeRemaining = (expiryDate) => {
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
    return { expired: false, text: `${days}g ${hours}s` };
  } else if (hours > 0) {
    return { expired: false, text: `${hours}s ${minutes}dk` };
  } else {
    return { expired: false, text: `${minutes}dk` };
  }
};

const BaseCard = ({
  type = 'coupon', // 'coupon', 'discount', or 'giveaway'
  title,
  description, // kept for backward compatibility but not displayed
  discountText,
  expiryDate,
  imageUrl, // NEW: Card image URL
  isActive = true,
  showActiveStatus = false,
  brandName,
  brandSlug,
  brandLogoUrl,
  children,
  actions,
  testId,
  className = '',
  compact = false
}) => {
  const timeLeft = getTimeRemaining(expiryDate);
  const isExpired = timeLeft?.expired || !isActive;
  const expiringSoon = isExpiringSoon(expiryDate);
  
  // Type-specific colors
  const typeColors = {
    coupon: { text: 'text-primary', bg: 'from-primary/20 to-pink-500/20', icon: 'text-primary' },
    discount: { text: 'text-primary', bg: 'from-blue-500/20 to-primary/20', icon: 'text-blue-400' },
    giveaway: { text: 'text-emerald-400', bg: 'from-emerald-500/20 to-teal-500/20', icon: 'text-emerald-400' }
  };
  const colors = typeColors[type] || typeColors.coupon;

  // Compact version for horizontal scrolling lists
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isExpired ? 'opacity-60' : ''} ${className}`}
        data-testid={testId}
      >
        <div className="glass-effect rounded-xl p-3 h-full flex gap-3">
          {/* Left: Image */}
          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
                <ImageIcon className={`w-6 h-6 ${colors.icon} opacity-50`} />
              </div>
            )}
          </div>
          
          {/* Right: Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Brand */}
            {brandName && (
              <div className="flex items-center gap-1.5 mb-1">
                <BrandLogo logoUrl={brandLogoUrl} brandName={brandName} size="xs" />
                <span className="text-xs font-medium text-muted-foreground truncate">{brandName}</span>
              </div>
            )}
            
            {/* Title */}
            <h3 className="text-sm font-medium line-clamp-1 mb-1">{title}</h3>
            
            {/* Discount */}
            {discountText && (
              <div className={`text-base font-heading font-bold ${colors.text} mb-2`}>
                {discountText}
              </div>
            )}

            {/* Actions */}
            <div className="mt-auto">
              {actions}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Full version - NEW LAYOUT with image on left
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative group ${isExpired ? 'opacity-60' : ''} ${className}`}
      data-testid={testId}
    >
      <div className="glass-effect rounded-2xl p-4 hover:border-primary/30 transition-all duration-300 h-full">
        <div className="flex gap-4">
          {/* Left: Image Area */}
          <div className="flex-shrink-0 w-28 sm:w-32">
            <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 relative">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={title} 
                  className="w-full h-full object-cover" 
                  loading="lazy"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
                  <ImageIcon className={`w-10 h-10 ${colors.icon} opacity-40`} />
                </div>
              )}
              
              {/* Expiring Soon Badge - overlay on image */}
              {expiringSoon && !isExpired && (
                <span 
                  className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs font-medium"
                  data-testid="expiring-soon-badge"
                >
                  <Flame className="w-3 h-3" />
                  Son 24s
                </span>
              )}
            </div>
          </div>

          {/* Right: Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top: Brand + Time */}
            <div className="flex items-center justify-between gap-2 mb-2">
              {/* Brand */}
              {brandName && (
                <Link 
                  to={brandSlug ? `/magaza/${brandSlug}` : '#'}
                  className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity max-w-[140px]"
                  title={brandName}
                >
                  <BrandLogo logoUrl={brandLogoUrl} brandName={brandName} size="sm" />
                  <span className="text-sm font-medium truncate">{brandName}</span>
                </Link>
              )}
              
              {/* Time remaining */}
              {timeLeft && (
                <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  isExpired 
                    ? 'bg-destructive/15 text-destructive' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Clock className="w-3 h-3" />
                  {timeLeft.text}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-base font-heading font-bold mb-2 line-clamp-2">{title}</h3>
            
            {/* Discount Text */}
            {discountText && (
              <div className={`text-xl font-heading font-bold ${colors.text} mb-3`}>
                {discountText}
              </div>
            )}
            
            {children}

            {/* Actions */}
            {actions && (
              <div className="mt-auto pt-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export { BaseCard, isExpiringSoon, getTimeRemaining };
export default BaseCard;
