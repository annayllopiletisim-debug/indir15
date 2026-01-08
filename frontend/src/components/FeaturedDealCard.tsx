'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ChevronRight } from 'lucide-react';
import { getImageUrl } from '@/lib/image';
import { addUtmParams } from '@/lib/utm';

interface FeaturedDealCardProps {
  deal: any;
  detailHref: string;
  type?: 'discount' | 'coupon';
}

export default function FeaturedDealCard({ deal, detailHref, type = 'discount' }: FeaturedDealCardProps) {
  const brand = deal.brand;
  const destinationUrl = deal.destination_url || brand?.affiliate_url || brand?.website_url;

  const handleCtaClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (destinationUrl) {
      try {
        await fetch('/api/track/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'discount', id: deal.id }),
        });
      } catch (err) {
        console.error('Track click error:', err);
      }
      window.open(addUtmParams(destinationUrl), '_blank');
    }
  };

  return (
    <Link href={detailHref} className="block group">
      <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group-hover:border-purple-200 p-4">
        <div className="flex gap-3">
          {/* Left - Square Image */}
          <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden rounded-xl relative">
            {deal.image_url ? (
              <Image
                src={getImageUrl(deal.image_url)}
                alt={deal.title}
                fill
                sizes="96px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : brand?.default_deal_image ? (
              <Image
                src={getImageUrl(brand.default_deal_image)}
                alt={deal.title}
                fill
                sizes="96px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : brand?.logo_url ? (
              <div className="w-full h-full flex items-center justify-center p-2">
                <Image
                  src={getImageUrl(brand.logo_url)}
                  alt={brand.name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl text-purple-300">🏷️</span>
              </div>
            )}
          </div>

          {/* Right - Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Brand Info - Bigger */}
            {brand && (
              <div className="flex items-center gap-2 mb-1.5">
                {brand.logo_url && (
                  <div className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center p-0.5 overflow-hidden flex-shrink-0 relative">
                    <Image 
                      src={getImageUrl(brand.logo_url)} 
                      alt={brand.name} 
                      width={28}
                      height={28}
                      className="object-contain" 
                    />
                  </div>
                )}
                <span className="text-sm font-bold text-gray-800">{brand.name}</span>
              </div>
            )}

            {/* Discount Badge */}
            {deal.discount_text && (
              <span className="inline-flex self-start px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700 mb-1">
                {deal.discount_text}
              </span>
            )}

            {/* Title */}
            <h3 className="font-medium text-gray-800 line-clamp-2 text-sm group-hover:text-purple-600 transition-colors">
              {deal.title}
            </h3>
          </div>
        </div>

        {/* Footer: Date left, CTA right */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          {deal.expiry_date ? (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>BİTİŞ TARİHİ</span>
              <span className="font-semibold text-gray-700">
                {new Date(deal.expiry_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">Süresiz</span>
          )}
          
          {destinationUrl && (
            <button 
              onClick={handleCtaClick}
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all text-xs z-10 relative"
            >
              {type === 'coupon' ? 'Kodu Göster' : 'Mağazaya Git'}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </article>
    </Link>
  );
}
