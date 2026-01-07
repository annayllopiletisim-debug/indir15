'use client';

import { Copy, Clock, ExternalLink } from 'lucide-react';
import { getImageUrl } from '@/lib/image';
import { addUtmParams } from '@/lib/utm';

interface CouponCardProps {
  coupon: any;
  brand: any;
}

export default function CouponCard({ coupon, brand }: CouponCardProps) {
  const destinationUrl = coupon.destination_url || brand?.affiliate_url || brand?.website_url;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      alert('Kod kopyalandı!');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleCtaClick = async () => {
    if (destinationUrl) {
      // Track click
      try {
        await fetch('/api/track/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'coupon', id: coupon.id }),
        });
      } catch (err) {
        console.error('Track click error:', err);
      }
      window.open(addUtmParams(destinationUrl), '_blank');
    }
  };

  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-4 border border-gray-100">
      {coupon.discount_text && (
        <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700 mb-2">
          {coupon.discount_text}
        </span>
      )}
      <h3 className="font-semibold text-sm mb-3 line-clamp-2">{coupon.title}</h3>
      <div className="flex items-center gap-2 mb-3">
        <code className="flex-1 px-3 py-2 bg-purple-50 border border-dashed border-purple-300 rounded-lg text-center font-mono font-bold text-purple-700 text-sm">
          {coupon.code}
        </code>
        <button 
          onClick={handleCopy}
          className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors" 
          title="Kopyala"
        >
          <Copy className="w-5 h-5" />
        </button>
      </div>
      
      {/* CTA Button */}
      {destinationUrl && (
        <button
          onClick={handleCtaClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors text-sm"
        >
          Mağazaya Git
          <ExternalLink className="w-4 h-4" />
        </button>
      )}
      
      {coupon.expiry_date && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-3">
          <Clock className="w-3 h-3" />
          Son: {new Date(coupon.expiry_date).toLocaleDateString('tr-TR')}
        </div>
      )}
    </article>
  );
}
