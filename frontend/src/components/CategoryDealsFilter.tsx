'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Tag, Ticket, Clock, TrendingUp, Sparkles, Copy } from 'lucide-react';
import FeaturedDealCard from '@/components/FeaturedDealCard';
import { getImageUrl } from '@/lib/image';
import { getShortId, generateSlug } from '@/lib/utils';

interface CategoryDealsFilterProps {
  discounts: any[];
  coupons: any[];
  category: any;
}

type FilterType = 'all' | 'new' | 'expiring' | 'popular';

export default function CategoryDealsFilter({ discounts, coupons, category }: CategoryDealsFilterProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  const filterOptions = [
    { value: 'all', label: 'Tümü', icon: Tag },
    { value: 'new', label: 'Yeni Eklenen', icon: Sparkles },
    { value: 'expiring', label: 'Bitmek Üzere', icon: Clock },
    { value: 'popular', label: 'Popüler', icon: TrendingUp },
  ];

  const filteredDiscounts = useMemo(() => {
    let result = [...discounts];
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    switch (filter) {
      case 'new':
        result = result.filter(d => new Date(d.created_at) > weekAgo);
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'expiring':
        result = result.filter(d => d.expiry_date && new Date(d.expiry_date) <= weekLater && new Date(d.expiry_date) > now);
        result.sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
        break;
      case 'popular':
        result.sort((a, b) => (b.click_count || 0) - (a.click_count || 0));
        break;
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [discounts, filter]);

  const filteredCoupons = useMemo(() => {
    let result = [...coupons];
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    switch (filter) {
      case 'new':
        result = result.filter(c => new Date(c.created_at) > weekAgo);
        break;
      case 'expiring':
        result = result.filter(c => c.expiry_date && new Date(c.expiry_date) <= weekLater && new Date(c.expiry_date) > now);
        break;
      case 'popular':
        result.sort((a, b) => (b.click_count || 0) - (a.click_count || 0));
        break;
    }
    return result;
  }, [coupons, filter]);

  return (
    <div>
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value as FilterType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === opt.value
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600'
            }`}
          >
            <opt.icon className="w-4 h-4" />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Discounts */}
      {filteredDiscounts.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            İndirimler ({filteredDiscounts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDiscounts.map((discount: any) => {
              const brand = discount.brand;
              if (!brand) return null;
              const shortId = getShortId(discount.id);
              const slug = generateSlug(discount.title);
              const href = `/magaza/${brand.slug}/indirim/${slug}-${shortId}`;
              return (
                <FeaturedDealCard key={discount.id} deal={discount} detailHref={href} />
              );
            })}
          </div>
        </section>
      )}

      {/* Coupons */}
      {filteredCoupons.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            Kupon Kodları ({filteredCoupons.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCoupons.map((coupon: any) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        </section>
      )}

      {filteredDiscounts.length === 0 && filteredCoupons.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl">
          <p className="text-gray-500">Bu filtreye uygun fırsat bulunamadı.</p>
        </div>
      )}
    </div>
  );
}

function CouponCard({ coupon }: { coupon: any }) {
  const brand = coupon.brand;
  
  const copyCode = () => {
    navigator.clipboard.writeText(coupon.code);
  };
  
  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-4 border border-gray-100 group-hover:border-purple-200">
      <div className="flex items-center gap-2 mb-2">
        {brand?.logo_url && (
          <div className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center p-0.5 overflow-hidden flex-shrink-0 relative">
            <Image 
              src={getImageUrl(brand.logo_url)} 
              alt={brand.name || 'Marka'} 
              width={28}
              height={28}
              className="object-contain" 
            />
          </div>
        )}
        <span className="text-sm font-bold text-gray-800">{brand?.name}</span>
      </div>
      {coupon.discount_text && (
        <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700 mb-2">
          {coupon.discount_text}
        </span>
      )}
      <h3 className="font-medium text-gray-800 text-sm mb-3 line-clamp-2">{coupon.title}</h3>
      <div className="flex items-center gap-2">
        <code className="flex-1 px-3 py-2 bg-purple-50 border border-dashed border-purple-300 rounded-lg text-center font-mono font-bold text-purple-700 text-sm">
          {coupon.code}
        </code>
        <button 
          onClick={copyCode}
          className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-purple-800 transition-all"
        >
          <Copy className="w-4 h-4" />
          Kopyala
        </button>
      </div>
    </article>
  );
}
