import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

// Helper to check if expiring within 24 hours
const isExpiringSoon = (expiryDate) => {
  if (!expiryDate) return false;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry - now;
  return diff > 0 && diff <= 24 * 60 * 60 * 1000;
};

// Helper to get time remaining (color will be determined in component based on theme)
const getTimeRemaining = (expiryDate) => {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry - now;

  if (diff <= 0) {
    return { expired: true, text: 'Süresi Doldu', days: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let text;
  if (days > 0) {
    text = `${days}g ${hours}s`;
  } else if (hours > 0) {
    text = `${hours}s ${minutes}dk`;
  } else {
    text = `${minutes}dk`;
  }

  return { expired: false, text, days };
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
  detailUrl,
  children,
  actions,
  testId,
  className = '',
  compact = false,
  onCtaClick
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const timeLeft = getTimeRemaining(expiryDate);
  const isExpired = timeLeft?.expired || !isActive;

  // Get time color - dark mode: always orange, light mode: color-coded based on days
  const getTimeColor = () => {
    // Dark mode: always orange
    if (isDark) return '#fb923c'; // orange-400
    
    // Light mode: color coded
    if (!timeLeft) return '#22c55e'; // green for "Süresiz"
    if (timeLeft.expired) return '#ef4444'; // red for expired
    
    const days = timeLeft.days;
    if (days < 3) return '#ef4444'; // red - less than 3 days
    if (days <= 7) return '#f59e0b'; // orange - 3-7 days
    return '#22c55e'; // green - more than 7 days
  };

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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex gap-3">
          {/* Image */}
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900/30 dark:to-violet-800/30 flex items-center justify-center">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <ImageIcon className="w-6 h-6 text-violet-400 opacity-50" />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {discountText && (
              <span className="inline-flex self-start px-2 py-0.5 bg-violet-100 dark:bg-green-900/50 text-violet-700 dark:text-green-400 text-xs font-bold rounded-full mb-1">
                {discountText}
              </span>
            )}
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{title}</h3>
          </div>
        </div>
      </motion.div>
    );
  }

  // Card content wrapper - clickable for detail page
  const CardContent = ({ children }) => {
    if (detailUrl) {
      return (
        <Link to={detailUrl} className="block">
          {children}
        </Link>
      );
    }
    return <>{children}</>;
  };

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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
        {/* Main Content Area - Clickable */}
        <CardContent>
          <div className="p-0 cursor-pointer">
            <div className="flex gap-4 items-start">
              {/* Left: Large Square Image - flush to left edge */}
              <div className="flex-shrink-0">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-r-xl overflow-hidden bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900/30 dark:to-violet-800/30 flex items-center justify-center">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={title} 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-violet-400 dark:text-violet-500 opacity-50" />
                  )}
                </div>
              </div>

              {/* Right: Content - aligned with image top */}
              <div className="flex-1 min-w-0 flex flex-col pt-0 pb-4 pr-4">
                {/* Brand Logo + Name */}
                {brandName && (
                  <div className="inline-flex items-center gap-2.5 mb-2 self-start">
                    {brandLogoUrl && (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 flex items-center justify-center p-1.5 flex-shrink-0">
                        <img 
                          src={getLogoUrl(brandLogoUrl)} 
                          alt={brandName} 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                    <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{brandName}</span>
                  </div>
                )}

                {/* Discount Badge - Mobile: green, Desktop Light: violet, Dark: green */}
                {discountText && (
                  <span className="inline-flex self-start px-3 py-1 bg-green-100 sm:bg-violet-100 dark:bg-green-900/50 text-green-700 sm:text-violet-700 dark:text-green-400 text-sm font-bold rounded-full mb-2">
                    {discountText}
                  </span>
                )}

                {/* Campaign Title */}
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug">
                  {title}
                </h3>
                
                {children}
              </div>
            </div>
          </div>
        </CardContent>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-gray-700" />

        {/* Bottom Row: Time (left) + CTA Button (right) */}
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Time Remaining */}
          <span 
            className="inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: getTimeColor() }}
          >
            <Clock className="w-4 h-4" />
            {timeLeft ? timeLeft.text : 'Süresiz'}
          </span>

          {/* Actions / CTA Button */}
          {actions}
        </div>
      </div>
    </motion.div>
  );
};

export { BaseCard, isExpiringSoon, getTimeRemaining };
export default BaseCard;
