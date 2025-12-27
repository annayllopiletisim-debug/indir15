import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCard } from './BaseCard';
import { trackClick, buildUTMLink } from '../utils/helpers';

// Helper to generate URL slug
const generateSlug = (title) => {
  if (!title) return '';
  const trMap = {'ı': 'i', 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ö': 'o', 'ç': 'c',
                 'İ': 'i', 'Ğ': 'g', 'Ü': 'u', 'Ş': 's', 'Ö': 'o', 'Ç': 'c'};
  let slug = title.toLowerCase();
  Object.entries(trMap).forEach(([tr, en]) => {
    slug = slug.split(tr).join(en);
  });
  slug = slug.replace(/[^a-z0-9\s-]/g, '');
  slug = slug.replace(/[\s_]+/g, '-');
  slug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '');
  return slug.substring(0, 50);
};

const CouponCard = ({ coupon, brand, compact = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get brand info
  const brandName = brand?.name || coupon.brand_name;
  const brandSlug = brand?.slug || coupon.brand_slug;
  const brandLogoUrl = brand?.logo_url || coupon.brand_logo_url;

  // Generate detail page URL
  const couponSlug = generateSlug(coupon.title);
  const detailUrl = `/magaza/${brandSlug}/kupon/${couponSlug}-${coupon.id}`;

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

  const actions = (
    <button
      onClick={handleGetCode}
      disabled={isExpired || !coupon.is_active}
      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
      data-testid="coupon-get-code-btn"
    >
      Kodu Göster
      <ChevronRight className="w-4 h-4" />
    </button>
  );

  return (
    <>
      <BaseCard
        type="coupon"
        title={coupon.title}
        description={coupon.description}
        discountText={coupon.discount_text}
        expiryDate={coupon.expiry_date}
        imageUrl={coupon.image_url}
        destinationUrl={coupon.destination_url}
        isActive={coupon.is_active}
        brandName={brandName}
        brandSlug={brandSlug}
        brandLogoUrl={brandLogoUrl}
        actions={actions}
        testId={`coupon-card-${coupon.id}`}
        compact={compact}
      />

      {/* Code Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-md w-full bg-white rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              data-testid="coupon-modal"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                data-testid="modal-close-btn"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Check className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mağazaya Yönlendirildiniz!</h3>
                <p className="text-gray-500 mb-6">İşte kupon kodunuz:</p>

                <div className="mb-6">
                  <div className="font-mono text-2xl font-bold text-gray-900 mb-4 px-6 py-4 rounded-xl bg-gray-50 border-2 border-violet-200">
                    {coupon.code}
                  </div>
                  
                  <button
                    onClick={handleCopyCode}
                    className="w-full px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-md"
                    data-testid="modal-copy-btn"
                  >
                    {copied ? (
                      <><Check className="w-5 h-5" /><span>Kopyalandı!</span></>
                    ) : (
                      <><Copy className="w-5 h-5" /><span>Kodu Kopyala</span></>
                    )}
                  </button>
                </div>

                <p className="text-sm text-gray-500">
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
