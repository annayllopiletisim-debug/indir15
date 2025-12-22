import React, { useState, useEffect } from 'react';
import { Clock, ExternalLink, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTimeRemaining, trackClick, buildUTMLink, shareOnWhatsApp, shareOnFacebook } from '../utils/helpers';

const DiscountCard = ({ discount, brand }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (discount.expiry_date) {
      const updateTime = () => {
        setTimeLeft(getTimeRemaining(discount.expiry_date));
      };
      updateTime();
      const interval = setInterval(updateTime, 60000);
      return () => clearInterval(interval);
    }
  }, [discount.expiry_date]);

  const handleClick = () => {
    trackClick('discount', discount.id, discount.brand_id);
    const finalUrl = buildUTMLink(discount.destination_url, discount.utm_template, discount.id);
    window.open(finalUrl, '_blank');
  };

  const isExpired = timeLeft?.expired;
  const currentUrl = window.location.href;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative group ${
        isExpired ? 'opacity-60' : ''
      }`}
      data-testid={`discount-card-${discount.id}`}
    >
      <div className="glass-effect rounded-2xl p-6 hover:border-neon-purple/50 transition-all duration-300">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-heading font-bold mb-2">{discount.title}</h3>
            <p className="text-sm text-muted-foreground">{discount.description}</p>
          </div>
        </div>
        
        <div className="text-3xl font-heading font-bold text-gradient mb-4">
          {discount.discount_text}
        </div>
        
        {timeLeft && (
          <div className="flex items-center space-x-2 text-sm mb-4" data-testid="discount-countdown">
            <Clock className="w-4 h-4" />
            <span className={`font-mono ${
              isExpired ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              {timeLeft.text}
            </span>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleClick}
            disabled={isExpired}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg font-medium hover:shadow-lg hover:shadow-neon-purple/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="discount-get-deal-btn"
          >
            İndirimi Gör
          </button>
          
          <button
            onClick={() => shareOnWhatsApp(discount.title, currentUrl)}
            className="p-3 rounded-lg hover:bg-white/5 transition-colors"
            data-testid="discount-whatsapp-share"
            aria-label="WhatsApp'ta paylaş"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => shareOnFacebook(currentUrl)}
            className="p-3 rounded-lg hover:bg-white/5 transition-colors"
            data-testid="discount-facebook-share"
            aria-label="Facebook'ta paylaş"
          >
            <ExternalLink className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DiscountCard;