import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
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

const DiscountCard = ({ discount, brand, compact = false }) => {
  const handleGoToStore = (e) => {
    e.preventDefault();
    e.stopPropagation();
    trackClick('discount_click', discount.id, discount.brand_id, brand?.category_id);
    if (discount.destination_url) {
      const finalUrl = buildUTMLink(discount.destination_url, discount.utm_template, discount.id);
      window.open(finalUrl, '_blank');
    }
  };

  const isExpired = discount.expiry_date && new Date(discount.expiry_date) < new Date();

  // Get brand info
  const brandName = brand?.name || discount.brand_name;
  const brandSlug = brand?.slug || discount.brand_slug;
  const brandLogoUrl = brand?.logo_url || discount.brand_logo_url;
  const brandDefaultDealImage = brand?.default_deal_image || discount.brand_default_deal_image;

  // Generate detail page URL
  const discountSlug = generateSlug(discount.title);
  const detailUrl = `/magaza/${brandSlug}/indirim/${discountSlug}-${discount.id}`;

  const actions = (
    <button
      onClick={handleGoToStore}
      disabled={isExpired}
      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
      data-testid="discount-get-deal-btn"
    >
      Mağazaya Git
      <ChevronRight className="w-4 h-4" />
    </button>
  );

  return (
    <BaseCard
      type="discount"
      title={discount.title}
      description={discount.description}
      discountText={discount.discount_text}
      expiryDate={discount.expiry_date}
      imageUrl={discount.image_url}
      destinationUrl={discount.destination_url}
      isActive={true}
      brandName={brandName}
      brandSlug={brandSlug}
      brandLogoUrl={brandLogoUrl}
      brandDefaultDealImage={brandDefaultDealImage}
      detailUrl={detailUrl}
      actions={actions}
      testId={`discount-card-${discount.id}`}
      compact={compact}
    />
  );
};

export default DiscountCard;
