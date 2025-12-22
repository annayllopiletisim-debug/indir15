import React, { useState, useEffect } from 'react';
import { Copy, Check, Clock, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTimeRemaining, trackClick, buildUTMLink, shareOnWhatsApp, shareOnFacebook } from '../utils/helpers';
import { Share2 } from 'lucide-react';

const CouponCard = ({ coupon, brand }) => {
  const [showModal, setShowModal] = useState(false);
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

  const handleGetCode = async () => {
    trackClick('coupon', coupon.id, coupon.brand_id);
    
    // First show modal
    setShowModal(true);
    
    // Then redirect after a small delay
    if (coupon.destination_url) {
      setTimeout(() => {
        const finalUrl = buildUTMLink(coupon.destination_url, coupon.utm_template, coupon.id);
        window.open(finalUrl, '_blank');
      }, 500);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isExpired = timeLeft?.expired || !coupon.is_active;
  const currentUrl = window.location.href;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative group ${
          isExpired ? 'opacity-60' : ''
        }`}
        data-testid={`coupon-card-${coupon.id}`}
      >
        <div className="glass-effect rounded-2xl p-6 hover:border-neon-purple/50 transition-all duration-300">
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
          
          <div className="flex items-center justify-between mb-4">
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
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleGetCode}
              disabled={isExpired}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg font-medium hover:shadow-lg hover:shadow-neon-purple/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="coupon-get-code-btn"
            >
              Kodu Göster
            </button>
            
            <button
              onClick={() => shareOnWhatsApp(coupon.title, currentUrl)}
              className="p-3 rounded-lg hover:bg-white/5 transition-colors"
              data-testid="coupon-whatsapp-share"
              aria-label="WhatsApp'ta paylaş"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => shareOnFacebook(currentUrl)}
              className="p-3 rounded-lg hover:bg-white/5 transition-colors"
              data-testid="coupon-facebook-share"
              aria-label="Facebook'ta paylaş"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-md w-full glass-effect rounded-3xl p-8"
              onClick={(e) => e.stopPropagation()}
              data-testid="coupon-modal"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                data-testid="modal-close-btn"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-heading font-bold mb-2">Mağazaya Yönlendirildiniz!</h3>
                <p className="text-muted-foreground mb-6">
                  İşte kupon kodunuz:
                </p>

                <div className="mb-6">
                  <div className="font-mono text-3xl font-bold mb-4 px-6 py-4 rounded-xl bg-void-subtle border-2 border-neon-purple/50">
                    {coupon.code}
                  </div>
                  
                  <button
                    onClick={handleCopyCode}
                    className="w-full px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg font-medium hover:shadow-lg hover:shadow-neon-purple/50 transition-all flex items-center justify-center space-x-2"
                    data-testid="modal-copy-btn"
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

                <p className="text-sm text-muted-foreground">
                  {coupon.discount_text} indiriminizden yararlanmak için kodu sepette uygulayın.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CouponCard;