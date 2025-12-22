import React, { useState, useEffect } from 'react';
import { Copy, Check, Clock, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTimeRemaining, trackClick, buildUTMLink, shareOnWhatsApp, shareOnFacebook } from '../utils/helpers';
import { Share2 } from 'lucide-react';

const CouponCard = ({ coupon, brand }) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (coupon.expiry_date) {
      const updateTime = () => {
        setTimeLeft(getTimeRemaining(coupon.expiry_date));
      };
      updateTime();
      const interval = setInterval(updateTime, 60000);
      return () => clearInterval(interval);
    }
  }, [coupon.expiry_date]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      trackClick('coupon', coupon.id, coupon.brand_id);
      
      if (coupon.destination_url) {
        const finalUrl = buildUTMLink(coupon.destination_url, coupon.utm_template, coupon.id);
        setTimeout(() => {
          window.open(finalUrl, '_blank');
        }, 500);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isExpired = timeLeft?.expired || !coupon.is_active;
  const currentUrl = window.location.href;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative group ${
        isExpired ? 'opacity-60' : ''
      }`}
      data-testid={`coupon-card-${coupon.id}`}
    >
      <div className="glass-effect rounded-2xl overflow-hidden hover:border-neon-purple/50 transition-all duration-300">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-heading font-bold mb-1">{coupon.title}</h3>
                <p className="text-sm text-muted-foreground">{coupon.description}</p>
              </div>
              {isExpired && (
                <span className="px-3 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-medium" data-testid="coupon-expired-badge">
                  Süresi Doldu
                </span>
              )}
              {!isExpired && coupon.is_active && (
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium" data-testid="coupon-active-badge">
                  Aktif
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4 mt-4">
              <div className="text-2xl font-heading font-bold text-gradient">
                {coupon.discount_text}
              </div>
              
              {timeLeft && !isExpired && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">{timeLeft.text}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 mt-4">
              <button
                onClick={() => shareOnWhatsApp(coupon.title, currentUrl)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                data-testid="coupon-whatsapp-share"
                aria-label="WhatsApp'ta paylaş"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => shareOnFacebook(currentUrl)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                data-testid="coupon-facebook-share"
                aria-label="Facebook'ta paylaş"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="relative flex items-center justify-center p-6 md:w-64">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-void-dark -ml-3 hidden md:block" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-void-dark -mr-3 hidden md:block" />
            
            <div className="w-full border-l border-dashed border-white/20 md:border-l pl-6 md:pl-0">
              <div className="text-center">
                <div className="mb-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Kupon Kodu</span>
                </div>
                <div className="font-mono text-lg font-bold mb-4 px-4 py-2 rounded-lg bg-void-subtle border border-white/10">
                  {coupon.code}
                </div>
                <button
                  onClick={handleCopyCode}
                  disabled={isExpired}
                  className="w-full px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg font-medium hover:shadow-lg hover:shadow-neon-purple/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  data-testid="coupon-copy-btn"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span>Kodu Kopyala</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CouponCard;