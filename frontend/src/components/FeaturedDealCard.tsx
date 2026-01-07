'use client';

import Link from 'next/link';
import { Calendar, ExternalLink } from 'lucide-react';
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
      <article className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group-hover:border-purple-200">
        <div className="flex">
          {/* Left Image */}
          <div className="w-40 h-48 flex-shrink-0 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
            {deal.image_url ? (
              <img
                src={getImageUrl(deal.image_url)}
                alt={deal.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : brand?.logo_url ? (
              <div className="w-full h-full flex items-center justify-center p-6">
                <img
                  src={getImageUrl(brand.logo_url)}
                  alt={brand.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-5xl text-purple-300">🏷️</span>
              </div>
            )}
          </div>

          {/* Right Content */}
          <div className="flex-1 p-5 flex flex-col">
            {/* Brand Info */}
            {brand && (
              <div className="flex items-center gap-3 mb-3">
                {brand.logo_url && (
                  <div className="w-12 h-12 rounded-xl border border-gray-200 bg-white flex items-center justify-center p-1 overflow-hidden">
                    <img 
                      src={getImageUrl(brand.logo_url)} 
                      alt={brand.name} 
                      className="max-w-full max-h-full object-contain" 
                    />
                  </div>
                )}
                <span className="text-lg font-bold text-gray-800">{brand.name}</span>
              </div>
            )}

            {/* Discount Badge */}
            {deal.discount_text && (
              <span className="inline-flex self-start px-3 py-1 text-sm font-bold rounded-full bg-green-100 text-green-700 mb-3">
                {deal.discount_text}
              </span>
            )}

            {/* Title */}
            <h3 className="font-bold text-gray-800 line-clamp-2 mb-auto text-base group-hover:text-purple-600 transition-colors">
              {deal.title}
            </h3>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              {deal.expiry_date ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">BİTİŞ</span>
                  <span className="font-semibold text-gray-700">
                    {new Date(deal.expiry_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Süresiz</span>
              )}
              
              {destinationUrl && (
                <button 
                  onClick={handleCtaClick}
                  className="flex items-center gap-1 px-5 py-2.5 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-colors text-sm z-10 relative"
                >
                  Mağazaya Git
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
