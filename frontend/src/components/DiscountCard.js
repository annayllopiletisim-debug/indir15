import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Info } from 'lucide-react';
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

  // Generate detail page URL
  const discountSlug = generateSlug(discount.title);
  const detailUrl = `/magaza/${brandSlug}/indirim/${discountSlug}-${discount.id}`;

  const actions = compact ? (
    <div className="flex items-center gap-2">
      <Link
        to={detailUrl}
        className="flex-1 px-3 py-2 border border-primary/50 text-primary hover:bg-primary/10 rounded-lg text-sm font-medium transition-all text-center"
      >
        Detay
      </Link>
      <button
        onClick={handleClick}
        disabled={isExpired}
        className="flex-1 px-3 py-2 bg-primary/90 hover:bg-primary rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-1"
      >
        Git
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      {/* Devamını Gör butonu - solda */}
      <Link
        to={detailUrl}
        className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-primary/50 text-primary hover:bg-primary/10 rounded-lg text-sm font-medium transition-all"
      >
        <Info className="w-4 h-4" />
        Devamını Gör
      </Link>
      {/* Mağazaya Git butonu - sağda */}
      <button
        onClick={handleClick}
        disabled={isExpired}
        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-pink-500 rounded-lg font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        data-testid="discount-get-deal-btn"
      >
        Mağazaya Git
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
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
