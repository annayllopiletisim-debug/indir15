import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ImageIcon, MapPin } from 'lucide-react';
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
  type = 'coupon', // 'coupon', 'discount', or 'giveaway'
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

  // Extract domain from destination URL
  const getDomain = (url) => {
    if (!url) return null;
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return null;
    }
  };
  const domain = getDomain(destinationUrl);

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
          {/* Image with brand logo */}
          <div className="relative flex-shrink-0 w-16 h-16">
            <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
              {imageUrl ? (
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <ImageIcon className="w-6 h-6 text-violet-400 opacity-50" />
              )}
            </div>
            {/* Brand logo overlay */}
            {brandLogoUrl && (
              <div className="absolute -top-1 -left-1 w-6 h-6 bg-white rounded-md shadow-md flex items-center justify-center p-0.5">
                <img src={brandLogoUrl} alt={brandName} className="w-full h-full object-contain" />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {discountText && (
              <span className="inline-flex self-start px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold rounded-full mb-1">
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
        <div className="p-4">
          <div className="flex gap-4">
            {/* Left: Square Image with Brand Logo */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
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
              {/* Brand logo - top left corner of image */}
              {brandName && (
                <div className="absolute -top-2 -left-2 bg-white rounded-lg shadow-md p-1 min-w-[28px] h-7 flex items-center justify-center">
                  {brandLogoUrl ? (
                    <img 
                      src={brandLogoUrl.startsWith('/uploads/') ? `${process.env.REACT_APP_BACKEND_URL}/api${brandLogoUrl}` : brandLogoUrl} 
                      alt={brandName} 
                      className="max-w-[40px] max-h-5 object-contain"
                    />
                  ) : (
                    <span className="text-xs font-bold text-gray-700 px-1">{brandName.substring(0, 6)}</span>
                  )}
                </div>
              )}
            </div>

            {/* Right: Content */}
            <div className="flex-1 min-w-0 flex flex-col">
              {/* Top Row: Discount Badge + Time */}
              <div className="flex items-start justify-between gap-2 mb-2 flex-wrap sm:flex-nowrap">
                {/* Discount Badge */}
                {discountText && (
                  <span className="inline-flex px-3 py-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs sm:text-sm font-bold rounded-[20px] uppercase tracking-wide whitespace-nowrap">
                    {discountText}
                  </span>
                )}
                
                {/* Time Remaining */}
                {timeLeft ? (
                  <span 
                    className="flex-shrink-0 inline-flex items-center gap-1 text-sm font-semibold whitespace-nowrap"
                    style={{ color: timeLeft.color }}
                  >
                    <Clock className="w-4 h-4" />
                    {timeLeft.text}
                  </span>
                ) : (
                  <span className="flex-shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-green-500 whitespace-nowrap">
                    <Clock className="w-4 h-4" />
                    Süresiz
                  </span>
                )}
              </div>

              {/* Campaign Title */}
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 leading-snug">
                {title}
              </h3>
              
              {children}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Bottom Row: Domain + CTA Button */}
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Domain/Website */}
          {domain && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{domain}</span>
            </div>
          )}
          {!domain && brandSlug && (
            <Link 
              to={`/magaza/${brandSlug}`}
              className="flex items-center gap-1.5 text-gray-500 hover:text-violet-600 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{brandName}</span>
            </Link>
          )}
          {!domain && !brandSlug && <div />}

          {/* Actions / CTA Button */}
          {actions}
        </div>
      </div>
    </motion.div>
  );
};

export { BaseCard, isExpiringSoon, getTimeRemaining };
export default BaseCard;
