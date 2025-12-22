import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import ShareButtons from './ShareButtons';

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
    return { expired: false, text: `${days} gün ${hours} saat` };
  } else if (hours > 0) {
    return { expired: false, text: `${hours} saat ${minutes} dk` };
  } else {
    return { expired: false, text: `${minutes} dakika` };
  }
};

const BaseCard = ({
  title,
  description,
  discountText,
  expiryDate,
  isActive = true,
  showActiveStatus = false,
  brandName,
  brandSlug,
  children,
  actions,
  testId,
  className = ''
}) => {
  const timeLeft = getTimeRemaining(expiryDate);
  const isExpired = timeLeft?.expired || !isActive;
  const expiringSoon = isExpiringSoon(expiryDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative group ${isExpired ? 'opacity-60' : ''} ${className}`}
      data-testid={testId}
    >
      <div className="glass-effect rounded-2xl p-6 hover:border-neon-purple/50 transition-all duration-300 h-full flex flex-col">
        {/* Top Row: Brand (left) + Expiry (right) */}
        <div className="flex items-start justify-between mb-4">
          {/* Left: Brand Name */}
          <div className="flex flex-col gap-1">
            {brandName && (
              <Link 
                to={brandSlug ? `/magaza/${brandSlug}` : '#'}
                className="inline-flex items-center px-3 py-1 rounded-full bg-neon-purple/20 text-neon-purple text-xs font-semibold hover:bg-neon-purple/30 transition-colors truncate max-w-[150px]"
                title={brandName}
              >
                {brandName}
              </Link>
            )}
            {/* Expiring Soon Badge */}
            {expiringSoon && !isExpired && (
              <span 
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium animate-pulse w-fit"
                data-testid="expiring-soon-badge"
              >
                <Flame className="w-3 h-3" />
                Son 24 Saat
              </span>
            )}
          </div>

          {/* Right: Expiry Date */}
          <div className="flex flex-col items-end gap-1">
            {/* Time remaining or Status */}
            {timeLeft && (
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                isExpired 
                  ? 'bg-destructive/20 text-destructive' 
                  : 'bg-void-subtle text-muted-foreground'
              }`}>
                <Clock className="w-3 h-3" />
                {timeLeft.text}
              </span>
            )}
            
            {/* Active/Expired Status Badge */}
            {showActiveStatus && (
              isExpired ? (
                <span className="px-2 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-medium">
                  Süresi Doldu
                </span>
              ) : (
                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                  Aktif
                </span>
              )
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-heading font-bold mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
          )}
          
          {discountText && (
            <div className="text-2xl font-heading font-bold text-gradient mb-4">
              {discountText}
            </div>
          )}
          
          {/* Custom children content */}
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div className="mt-4 pt-4 border-t border-white/5">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export { BaseCard, isExpiringSoon, getTimeRemaining };
export default BaseCard;
