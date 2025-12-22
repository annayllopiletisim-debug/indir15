import React from 'react';
import { BaseCard } from './BaseCard';
import ShareButtons from './ShareButtons';
import { trackClick, buildUTMLink } from '../utils/helpers';

const DiscountCard = ({ discount, brand }) => {
  const handleClick = () => {
    trackClick('discount_click', discount.id, discount.brand_id, brand?.category_id);
    if (discount.destination_url) {
      const finalUrl = buildUTMLink(discount.destination_url, discount.utm_template, discount.id);
      window.open(finalUrl, '_blank');
    }
  };

  const isExpired = discount.expiry_date && new Date(discount.expiry_date) < new Date();

  // Get brand info - either from passed brand object or from discount itself
  const brandName = brand?.name || discount.brand_name;
  const brandSlug = brand?.slug || discount.brand_slug;

  const actions = (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleClick}
        disabled={isExpired}
        className="flex-1 px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg font-medium hover:shadow-lg hover:shadow-neon-purple/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="discount-get-deal-btn"
      >
        Mağazaya Git
      </button>
      
      <ShareButtons title={discount.title} size="md" />
    </div>
  );

  return (
    <BaseCard
      title={discount.title}
      description={discount.description}
      discountText={discount.discount_text}
      expiryDate={discount.expiry_date}
      isActive={true}
      showActiveStatus={false}
      brandName={brandName}
      brandSlug={brandSlug}
      actions={actions}
      testId={`discount-card-${discount.id}`}
    />
  );
};

export default DiscountCard;
