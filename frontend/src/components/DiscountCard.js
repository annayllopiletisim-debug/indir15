import React from 'react';
import { ArrowRight } from 'lucide-react';
import { BaseCard } from './BaseCard';
import { trackClick, buildUTMLink } from '../utils/helpers';

const DiscountCard = ({ discount, brand, compact = false }) => {
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
  const brandLogoUrl = brand?.logo_url || discount.brand_logo_url;

  const actions = compact ? (
    <button
      onClick={handleClick}
      disabled={isExpired}
      className="w-full px-4 py-2 bg-primary/90 hover:bg-primary rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
    >
      Mağazaya Git
      <ArrowRight className="w-4 h-4" />
    </button>
  ) : (
    <button
      onClick={handleClick}
      disabled={isExpired}
      className="w-full px-6 py-3 bg-gradient-to-r from-primary to-pink-500 rounded-lg font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      data-testid="discount-get-deal-btn"
    >
      Mağazaya Git
      <ArrowRight className="w-5 h-5" />
    </button>
  );

  return (
    <BaseCard
      title={discount.title}
      description={compact ? null : discount.description}
      discountText={discount.discount_text}
      expiryDate={discount.expiry_date}
      isActive={true}
      showActiveStatus={false}
      brandName={brandName}
      brandSlug={brandSlug}
      brandLogoUrl={brandLogoUrl}
      actions={actions}
      testId={`discount-card-${discount.id}`}
      compact={compact}
    />
  );
};

export default DiscountCard;
