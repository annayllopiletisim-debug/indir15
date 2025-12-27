import React, { useState } from 'react';
import { Copy, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCard } from './BaseCard';
import ShareButtons from './ShareButtons';
import { trackClick, buildUTMLink } from '../utils/helpers';

const CouponCard = ({ coupon, brand, compact = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get brand info - either from passed brand object or from coupon itself
  const brandName = brand?.name || coupon.brand_name;
  const brandSlug = brand?.slug || coupon.brand_slug;
  const brandLogoUrl = brand?.logo_url || coupon.brand_logo_url; // #5

  const handleGetCode = async () => {
    trackClick('coupon_view', coupon.id, coupon.brand_id, brand?.category_id);
    setShowModal(true);
    
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
      trackClick('coupon_copy', coupon.id, coupon.brand_id, brand?.category_id);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isExpired = coupon.expiry_date && new Date(coupon.expiry_date) < new Date();

  const actions = compact ? (
    <button
      onClick={handleGetCode}
      disabled={isExpired || !coupon.is_active}
      className="w-full px-4 py-2 bg-primary/90 hover:bg-primary rounded-lg text-sm font-medium transition-all disabled:opacity-50"
    >
      Kodu Göster
    </button>
  ) : (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleGetCode}
        disabled={isExpired || !coupon.is_active}
        className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-pink-500 rounded-lg font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="coupon-get-code-btn"
      >
        Kodu Göster
      </button>
      <ShareButtons title={coupon.title} size="md" />
    </div>
  );

  return (
    <>
      <BaseCard
        title={coupon.title}
        description={compact ? null : coupon.description}
        discountText={coupon.discount_text}
        expiryDate={coupon.expiry_date}
        isActive={coupon.is_active}
        showActiveStatus={!compact}
        brandName={brandName}
        brandSlug={brandSlug}
        brandLogoUrl={brandLogoUrl}
        actions={actions}
        testId={`coupon-card-${coupon.id}`}
        compact={compact}
      />

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
                <p className="text-muted-foreground mb-6">İşte kupon kodunuz:</p>

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
                      <><Check className="w-5 h-5" /><span>Kopyalandı!</span></>
                    ) : (
                      <><Copy className="w-5 h-5" /><span>Kodu Kopyala</span></>
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
