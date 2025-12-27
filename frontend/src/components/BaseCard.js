import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Flame } from 'lucide-react';
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
  description,
  discountText,
  expiryDate,
  isActive = true,
  showActiveStatus = false,
  brandName,
  brandSlug,
  brandLogoUrl, // #5 - Logo URL for brand
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
    coupon: 'text-primary',
    discount: 'text-primary',
    giveaway: 'text-emerald-400'
  };
  const discountColor = typeColors[type] || 'text-primary';

  // Compact version for horizontal scrolling lists
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isExpired ? 'opacity-60' : ''} ${className}`}
        data-testid={testId}
      >
        <div className="glass-effect rounded-xl p-4 h-full flex flex-col">
          {/* Top Row: Brand + Time */}
          <div className="flex items-center justify-between mb-2">
            {brandName && (
              <Link 
                to={brandSlug ? `/magaza/${brandSlug}` : '#'}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline truncate max-w-[120px]"
              >
                {brandLogoUrl && <BrandLogo logoUrl={brandLogoUrl} brandName={brandName} size="xs" />}
                <span className="truncate">{brandName}</span>
              </Link>
            )}
            {timeLeft && (
              <span className={`text-xs flex items-center gap-1 ${expiringSoon ? 'text-orange-400' : 'text-muted-foreground'}`}>
                <Clock className="w-3 h-3" />
                {timeLeft.text}
              </span>
            )}
          </div>

          {/* Discount */}
          {discountText && (
            <div className={`text-lg font-heading font-bold ${discountColor} mb-1`}>
              {discountText}
            </div>
          )}

          {/* Title */}
          <h3 className="text-sm font-medium mb-3 line-clamp-2 flex-1">{title}</h3>

          {/* Actions */}
          {actions}
        </div>
      </motion.div>
    );
  }

  // Full version
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative group ${isExpired ? 'opacity-60' : ''} ${className}`}
      data-testid={testId}
    >
      <div className="glass-effect rounded-2xl p-5 hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
        {/* Top Row: Brand (left) + Expiry (right) */}
        <div className="flex items-start justify-between mb-3">
          {/* Left: Brand Name with Logo - #5 */}
          <div className="flex flex-col gap-1">
            {brandName && (
              <Link 
                to={brandSlug ? `/magaza/${brandSlug}` : '#'}
                className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors max-w-[180px]"
                title={brandName}
              >
                <BrandLogo logoUrl={brandLogoUrl} brandName={brandName} size="xs" />
                <span className="text-primary text-xs font-medium truncate">{brandName}</span>
              </Link>
            )}
            {/* Expiring Soon Badge */}
            {expiringSoon && !isExpired && (
              <span 
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-xs font-medium w-fit"
                data-testid="expiring-soon-badge"
              >
                <Flame className="w-3 h-3" />
                Son 24 Saat
              </span>
            )}
          </div>

          {/* Right: Expiry Date */}
          <div className="flex flex-col items-end gap-1">
            {timeLeft && (
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                isExpired 
                  ? 'bg-destructive/15 text-destructive' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                <Clock className="w-3 h-3" />
                {timeLeft.text}
              </span>
            )}
            
            {showActiveStatus && (
              isExpired ? (
                <span className="px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-xs">
                  Süresi Doldu
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-green-500/15 text-green-500 text-xs">
                  Aktif
                </span>
              )
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-base font-heading font-bold mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
          )}
          
          {discountText && (
            <div className="text-xl font-heading font-bold text-primary mb-3">
              {discountText}
            </div>
          )}
          
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div className="mt-3 pt-3 border-t border-border">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export { BaseCard, isExpiringSoon, getTimeRemaining };
export default BaseCard;
