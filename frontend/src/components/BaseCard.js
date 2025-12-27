import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

// Helper to check if expiring within 24 hours
const isExpiringSoon = (expiryDate) => {
  if (!expiryDate) return false;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry - now;
  return diff > 0 && diff <= 24 * 60 * 60 * 1000;
};

// Helper to get time remaining with color coding
const getTimeRemaining = (expiryDate) => {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry - now;

  if (diff <= 0) {
    return { expired: true, text: 'Süresi Doldu', days: 0, color: '#ef4444' };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  // Color coding based on days remaining
  let color = '#22c55e'; // green - more than 7 days
  if (days < 3) {
    color = '#ef4444'; // red - less than 3 days
  } else if (days <= 7) {
    color = '#f59e0b'; // orange - 3-7 days
  }

  let text;
  if (days > 0) {
    text = `${days}g ${hours}s`;
  } else if (hours > 0) {
    text = `${hours}s ${minutes}dk`;
  } else {
    text = `${minutes}dk`;
  }

  return { expired: false, text, days, color };
};

const BaseCard = ({
  type = 'coupon',
  title,
  description,
  discountText,
  expiryDate,
  imageUrl,
  destinationUrl,
  isActive = true,
  brandName,
  brandSlug,
  brandLogoUrl,
  children,
  actions,
  testId,
  className = '',
  compact = false,
  onCtaClick
}) => {
  const timeLeft = getTimeRemaining(expiryDate);
  const isExpired = timeLeft?.expired || !isActive;

  // Get proper logo URL
  const getLogoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('/uploads/')) {
      return `${process.env.REACT_APP_BACKEND_URL}/api${url}`;
    }
    if (url.startsWith('/api/uploads/')) {
      return `${process.env.REACT_APP_BACKEND_URL}${url}`;
    }
    return url;
  };

  // Compact version for horizontal scrolling lists
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className={`${isExpired ? 'opacity-60' : ''} ${className}`}
        data-testid={testId}
      >
        <div className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex gap-3">
          {/* Image */}
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <ImageIcon className="w-6 h-6 text-violet-400 opacity-50" />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {discountText && (
              <span className="inline-flex self-start px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-bold rounded-full mb-1">
                {discountText}
              </span>
            )}
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{title}</h3>
          </div>
        </div>
      </motion.div>
    );
  }

  // Full card - New Design
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`relative ${isExpired ? 'opacity-60' : ''} ${className}`}
      data-testid={testId}
    >
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
        {/* Main Content Area */}
        <div className="p-0">
          <div className="flex gap-4">
            {/* Left: Large Square Image - flush to left edge */}
            <div className="flex-shrink-0">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-r-xl overflow-hidden bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={title} 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-violet-400 opacity-50" />
                )}
              </div>
            </div>

            {/* Right: Content */}
            <div className="flex-1 min-w-0 flex flex-col py-4 pr-4">
              {/* Brand Logo + Name */}
              {brandName && (
                <Link 
                  to={brandSlug ? `/magaza/${brandSlug}` : '#'}
                  className="inline-flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity self-start"
                >
                  {brandLogoUrl && (
                    <div className="w-7 h-7 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center p-1 flex-shrink-0">
                      <img 
                        src={getLogoUrl(brandLogoUrl)} 
                        alt={brandName} 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                  <span className="text-lg sm:text-xl font-bold text-gray-900">{brandName}</span>
                </Link>
              )}

              {/* Discount Badge - Soft purple style */}
              {discountText && (
                <span className="inline-flex self-start px-3 py-1 bg-violet-100 text-violet-700 text-sm font-bold rounded-full mb-2">
                  {discountText}
                </span>
              )}

              {/* Campaign Title */}
              <h3 className="text-base font-semibold text-gray-800 line-clamp-2 leading-snug">
                {title}
              </h3>
              
              {children}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Bottom Row: Time (left) + CTA Button (right) */}
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Time Remaining - Now on the left */}
          {timeLeft ? (
            <span 
              className="inline-flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: timeLeft.color }}
            >
              <Clock className="w-4 h-4" />
              {timeLeft.text}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-500">
              <Clock className="w-4 h-4" />
              Süresiz
            </span>
          )}

          {/* Actions / CTA Button */}
          {actions}
        </div>
      </div>
    </motion.div>
  );
};

export { BaseCard, isExpiringSoon, getTimeRemaining };
export default BaseCard;
