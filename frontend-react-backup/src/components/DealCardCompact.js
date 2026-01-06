import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

/**
 * DealCardCompact - Ana sayfa için optimize edilmiş indirim kartı
 * 
 * Ölçüler:
 * - Mobil: 248px × 140px
 * - Desktop: 290px × 160px
 * 
 * Hiyerarşi:
 * 1. İndirim oranı (ana mesaj)
 * 2. Marka logosu (görsel kimlik)
 * 3. Kalan süre
 * 4. CTA (sessiz)
 */

// Helper to get time remaining
const getTimeRemaining = (expiryDate) => {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry - now;

  if (diff <= 0) return { expired: true, text: 'Bitti' };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return { expired: false, text: `${days}g ${hours}s`, urgent: false };
  if (hours > 0) return { expired: false, text: `${hours}s ${minutes}dk`, urgent: hours < 24 };
  return { expired: false, text: `${minutes}dk`, urgent: true };
};

const DealCardCompact = ({ 
  item, 
  brand, 
  type = 'coupon', // 'coupon' or 'discount'
  onClick 
}) => {
  const timeLeft = getTimeRemaining(item.expiry_date);
  const isExpired = timeLeft?.expired;
  const isUrgent = timeLeft?.urgent;

  const brandName = brand?.name || item.brand_name;
  const brandSlug = brand?.slug || item.brand_slug;
  const brandLogo = brand?.logo_url || item.brand_logo_url;

  const handleClick = () => {
    if (onClick) onClick(item);
  };

  return (
    <div 
      className={`
        w-[248px] h-[140px] md:w-[290px] md:h-[155px]
        flex-shrink-0 snap-start
        bg-card border border-border
        rounded-xl
        shadow-card hover:shadow-card-hover
        p-3
        flex flex-col
        transition-shadow duration-200
        cursor-pointer
        ${isExpired ? 'opacity-50' : ''}
      `}
      onClick={handleClick}
      data-testid={`deal-card-${item.id}`}
    >
      {/* ═══ ÜST BAR: Logo + Marka Adı + Süre ═══ */}
      <div className="flex items-center justify-between h-6 mb-1.5">
        {/* Sol: Marka Logosu + İsim */}
        <Link 
          to={brandSlug ? `/magaza/${brandSlug}` : '#'}
          className="flex items-center gap-1.5 min-w-0 max-w-[55%]"
          onClick={(e) => e.stopPropagation()}
        >
          {brandLogo ? (
            <div className="w-5 h-5 flex-shrink-0 rounded bg-white flex items-center justify-center overflow-hidden">
              <img 
                src={brandLogo} 
                alt={brandName}
                className="w-full h-full object-contain p-0.5"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-full items-center justify-center text-[9px] font-bold text-gray-500 hidden">
                {brandName?.charAt(0)}
              </div>
            </div>
          ) : (
            <div className="w-5 h-5 flex-shrink-0 rounded bg-white flex items-center justify-center">
              <span className="text-[9px] font-bold text-gray-500">
                {brandName?.charAt(0)}
              </span>
            </div>
          )}
          <span className="text-[11px] text-muted-foreground truncate">
            {brandName}
          </span>
        </Link>

        {/* Sağ: Kalan Süre */}
        {timeLeft && !isExpired && (
          <span className={`
            flex items-center gap-1 flex-shrink-0
            text-[10px]
            ${isUrgent ? 'text-orange-500' : 'text-muted-foreground/70'}
          `}>
            <Clock className="w-3 h-3" />
            {timeLeft.text}
          </span>
        )}
      </div>

      {/* ═══ ORTA ALAN: İndirim + Başlık ═══ */}
      <div className="flex-1 flex flex-col justify-center min-h-0">
        {/* İndirim Oranı - ANA MESAJ */}
        {item.discount_text && (
          <div className="text-lg md:text-xl text-primary font-heading font-bold leading-tight">
            {item.discount_text}
          </div>
        )}
        
        {/* Başlık - Tek satır */}
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
          {item.title}
        </p>
      </div>

      {/* ═══ ALT BAR: CTA ═══ */}
      <div className="h-5 flex items-center mt-1">
        <span className="text-xs text-primary hover:underline">
          {type === 'coupon' ? 'Kodu Gör →' : 'Fırsata Git →'}
        </span>
      </div>
    </div>
  );
};

export default DealCardCompact;
