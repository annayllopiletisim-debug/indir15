import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, Info, ArrowRight } from 'lucide-react';
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
  const handleClick = () => {
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

  const actions = compact ? (
    <div className="flex items-center gap-2">
      <Link
        to={detailUrl}
        className="flex-1 px-3 py-2 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 rounded-lg text-sm font-medium transition-all text-center"
      >
        Detay
      </Link>
      <button
        onClick={handleClick}
        disabled={isExpired}
        className="flex-1 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-1"
      >
        <Gift className="w-3 h-3" />
        Katıl
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      {/* Devamını Gör butonu - solda */}
      <Link
        to={detailUrl}
        className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 rounded-lg text-sm font-medium transition-all"
      >
        <Info className="w-4 h-4" />
        Devamını Gör
      </Link>
      {/* Çekilişe Katıl butonu - sağda */}
      <button
        onClick={handleClick}
        disabled={isExpired}
        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        data-testid="giveaway-join-btn"
      >
        <Gift className="w-4 h-4" />
        Çekilişe Katıl
      </button>
    </div>
  );

  return (
    <BaseCard
      type="giveaway"
      title={giveaway.title}
      description={giveaway.description}
      discountText={giveaway.prize_text}
      expiryDate={giveaway.expiry_date}
      brandName={brandName}
      brandSlug={brandSlug}
      brandLogoUrl={brandLogoUrl}
      actions={actions}
      compact={compact}
    />
  );
};

export default GiveawayCard;
