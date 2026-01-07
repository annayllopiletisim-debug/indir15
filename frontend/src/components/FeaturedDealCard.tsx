'use client';

import Link from 'next/link';
import { Calendar, ChevronRight } from 'lucide-react';
import { getImageUrl } from '@/lib/image';
import { addUtmParams } from '@/lib/utm';

interface FeaturedDealCardProps {
  deal: any;
  detailHref: string;
}

export default function FeaturedDealCard({ deal, detailHref }: FeaturedDealCardProps) {
  const brand = deal.brand;
  const destinationUrl = deal.destination_url || brand?.affiliate_url || brand?.website_url;

  const handleCtaClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (destinationUrl) {
      // Track click
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
      <article className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group-hover:border-purple-200">
        <div className="p-4">
          {/* Image with rounded corners and padding */}
          <div className="w-full h-48 rounded-xl overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 mb-4">
            {deal.image_url ? (
              <img
                src={getImageUrl(deal.image_url)}
                alt={deal.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : brand?.logo_url ? (
              <div className="w-full h-full flex items-center justify-center p-8">
                <img
                  src={getImageUrl(brand.logo_url)}
                  alt={brand.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl text-purple-300">🏷️</span>
              </div>
            )}
          </div>

          {/* Brand Info */}
          {brand && (
            <div className="flex items-center gap-3 mb-3">
              {brand.logo_url && (
                <div className="w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
                  <img 
                    src={getImageUrl(brand.logo_url)} 
                    alt={brand.name} 
                    className="max-w-full max-h-full object-contain" 
                  />
                </div>
              )}
              <span className="text-base font-bold text-gray-800">{brand.name}</span>
            </div>
          )}

          {/* Discount Badge */}
          {deal.discount_text && (
            <span className="inline-flex px-3 py-1.5 text-sm font-bold rounded-full bg-green-100 text-green-700 mb-3">
              {deal.discount_text}
            </span>
          )}

          {/* Title/Description */}
          <h3 className="font-semibold text-gray-800 line-clamp-2 mb-4 text-base group-hover:text-purple-600 transition-colors">
            {deal.title}
          </h3>

          {/* Divider */}
          <div className="border-t border-gray-100 pt-4">
            {/* Footer: Date + CTA */}
            <div className="flex items-center justify-between">
              {deal.expiry_date ? (
                <div className="text-sm text-gray-500">
                  <span className="text-xs text-gray-400 block">BİTİŞ TARİHİ</span>
                  <div className="flex items-center gap-1.5 font-semibold text-gray-700">
                    <Calendar className="w-4 h-4" />
                    {new Date(deal.expiry_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Süresiz</span>
              )}
              
              {destinationUrl && (
                <button 
                  onClick={handleCtaClick}
                  className="flex items-center gap-1 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full font-semibold hover:from-purple-700 hover:to-purple-800 transition-all text-sm z-10 relative shadow-md hover:shadow-lg"
                >
                  Kodu Göster
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
