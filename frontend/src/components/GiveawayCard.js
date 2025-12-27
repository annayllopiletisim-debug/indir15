import React from 'react';
import { Gift, ChevronRight } from 'lucide-react';
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

  // Generate detail page URL
  const giveawaySlug = generateSlug(giveaway.title);
  const detailUrl = `/magaza/${brandSlug}/cekilis/${giveawaySlug}-${giveaway.id}`;

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
      detailUrl={detailUrl}
      actions={actions}
      compact={compact}
    />
  );
};

export default GiveawayCard;
