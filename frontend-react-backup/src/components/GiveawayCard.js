import React from 'react';
import { Gift, ChevronRight } from 'lucide-react';
import { BaseCard } from './BaseCard';
import { trackClick, buildUTMLink, generateSlug, getShortId } from '../utils/helpers';

const GiveawayCard = ({ giveaway, brand, compact = false }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    trackClick('giveaway_click', giveaway.id, giveaway.brand_id, brand?.category_id);
    if (giveaway.destination_url) {
      const finalUrl = buildUTMLink(giveaway.destination_url, giveaway.utm_template, giveaway.id);
      window.open(finalUrl, '_blank');
    }
  };

  const isExpired = giveaway.expiry_date && new Date(giveaway.expiry_date) < new Date();

  // Get brand info
  const brandName = brand?.name || giveaway.brand_name;
  const brandSlug = brand?.slug || giveaway.brand_slug;
  const brandLogoUrl = brand?.logo_url || giveaway.brand_logo_url;
  const brandDefaultDealImage = brand?.default_deal_image || giveaway.brand_default_deal_image;

  // Generate SEO-friendly detail page URL with short ID
  const giveawaySlug = generateSlug(giveaway.title);
  const shortId = getShortId(giveaway.id);
  const detailUrl = `/magaza/${brandSlug}/cekilis/${giveawaySlug}-${shortId}`;

  const actions = (
    <button
      onClick={handleClick}
      disabled={isExpired}
      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
      data-testid="giveaway-join-btn"
    >
      <Gift className="w-4 h-4" />
      Çekilişe Katıl
      <ChevronRight className="w-4 h-4" />
    </button>
  );

  return (
    <BaseCard
      type="giveaway"
      title={giveaway.title}
      description={giveaway.description}
      discountText={giveaway.prize_text}
      expiryDate={giveaway.expiry_date}
      imageUrl={giveaway.image_url}
      destinationUrl={giveaway.destination_url}
      brandName={brandName}
      brandSlug={brandSlug}
      brandLogoUrl={brandLogoUrl}
      brandDefaultDealImage={brandDefaultDealImage}
      detailUrl={detailUrl}
      actions={actions}
      compact={compact}
    />
  );
};

export default GiveawayCard;
