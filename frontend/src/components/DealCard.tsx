'use client';

import Link from 'next/link';
import { Tag, Clock, ExternalLink } from 'lucide-react';
import { getImageUrl } from '@/lib/image';
import { addUtmParams } from '@/lib/utm';

interface DealCardProps {
  deal: any;
  brand: any;
  href: string;
}

export default function DealCard({ deal, brand, href }: DealCardProps) {
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
    <Link href={href} className="block group">
      <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-4 border border-gray-100 h-full group-hover:border-purple-200">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-purple-50 flex-shrink-0">
            {deal.image_url || brand?.default_deal_image ? (
              <img src={getImageUrl(deal.image_url || brand?.default_deal_image)} alt={deal.title} className="w-full h-full object-cover" />
            ) : brand?.logo_url ? (
              <img src={getImageUrl(brand.logo_url)} alt={brand.name} className="w-full h-full object-contain p-2" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-purple-300">
                <Tag className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col">
            {deal.discount_text && (
              <span className="inline-block self-start px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700 mb-1">
                {deal.discount_text}
              </span>
            )}
            <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors">{deal.title}</h3>
            {deal.expiry_date && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-auto">
                <Clock className="w-3 h-3" />
                {new Date(deal.expiry_date).toLocaleDateString('tr-TR')}
              </div>
            )}
          </div>
        </div>
        
        {/* CTA Button */}
        {destinationUrl && (
          <button 
            onClick={handleCtaClick}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors text-sm"
          >
            Mağazaya Git
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
      </article>
    </Link>
  );
}
