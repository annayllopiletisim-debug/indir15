'use client';

import { useState, useMemo } from 'react';
import { Tag, Ticket, Clock, TrendingUp, Sparkles } from 'lucide-react';
import Link from 'next/link';
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
            {filteredDiscounts.map((discount: any) => (
              <DealCard key={discount.id} deal={discount} type="indirim" />
            ))}
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

function DealCard({ deal, type }: { deal: any; type: string }) {
  const brand = deal.brand;
  if (!brand) return null;
  
  const shortId = getShortId(deal.id);
  const slug = generateSlug(deal.title);
  const href = `/magaza/${brand.slug}/${type}/${slug}-${shortId}`;

  return (
    <Link href={href} className="block">
      <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-4 border h-full">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-violet-50 flex-shrink-0">
            {deal.image_url || brand.default_deal_image ? (
              <img src={getImageUrl(deal.image_url || brand.default_deal_image)} alt={deal.title} loading="lazy" className="w-full h-full object-cover" />
            ) : brand.logo_url ? (
              <img src={getImageUrl(brand.logo_url)} alt={brand.name} loading="lazy" className="w-full h-full object-contain p-2" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-violet-300">
                <Tag className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {brand.logo_url && (
                <img src={getImageUrl(brand.logo_url)} alt={brand.name} loading="lazy" className="w-5 h-5 rounded object-contain" />
              )}
              <span className="text-xs font-medium truncate text-muted-foreground">{brand.name}</span>
            </div>
            {deal.discount_text && (
              <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700 mb-1">
                {deal.discount_text}
              </span>
            )}
            <h3 className="font-semibold text-sm line-clamp-2">{deal.title}</h3>
            {deal.expiry_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                <Clock className="w-3 h-3" />
                {new Date(deal.expiry_date).toLocaleDateString('tr-TR')}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function CouponCard({ coupon }: { coupon: any }) {
  const brand = coupon.brand;
  
  const copyCode = () => {
    navigator.clipboard.writeText(coupon.code);
  };
  
  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-4 border">
      <div className="flex items-center gap-2 mb-2">
        {brand?.logo_url && (
          <img src={getImageUrl(brand.logo_url)} alt={brand.name || 'Marka'} loading="lazy" className="w-6 h-6 rounded object-contain" />
        )}
        <span className="text-sm font-medium">{brand?.name}</span>
      </div>
      {coupon.discount_text && (
        <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700 mb-2">
          {coupon.discount_text}
        </span>
      )}
      <h3 className="font-semibold text-sm mb-3 line-clamp-2">{coupon.title}</h3>
      <div className="flex items-center gap-2">
        <code className="flex-1 px-3 py-2 bg-violet-50 border border-dashed border-violet-300 rounded-lg text-center font-mono font-bold text-violet-700 text-sm">
          {coupon.code}
        </code>
        <button 
          onClick={copyCode}
          className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          Kopyala
        </button>
      </div>
    </article>
  );
}
