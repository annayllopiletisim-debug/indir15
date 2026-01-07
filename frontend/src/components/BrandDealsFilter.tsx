'use client';

import { useState, useMemo } from 'react';
import { Tag, Ticket, Gift, Clock, TrendingUp, Sparkles } from 'lucide-react';
import DealCard from '@/components/DealCard';
import CouponCard from '@/components/CouponCard';
import { getShortId, generateSlug } from '@/lib/utils';

interface BrandDealsFilterProps {
  discounts: any[];
  coupons: any[];
  giveaways: any[];
  brand: any;
}

type FilterType = 'all' | 'new' | 'expiring' | 'popular';
type TabType = 'discounts' | 'coupons' | 'giveaways';

export default function BrandDealsFilter({ discounts, coupons, giveaways, brand }: BrandDealsFilterProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [activeTab, setActiveTab] = useState<TabType>('discounts');

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

  const tabs = [
    { id: 'discounts', label: 'İndirimler', count: filteredDiscounts.length, icon: Tag },
    { id: 'coupons', label: 'Kuponlar', count: filteredCoupons.length, icon: Ticket },
    { id: 'giveaways', label: 'Çekilişler', count: giveaways.length, icon: Gift },
  ];

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

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'discounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDiscounts.map((discount: any) => {
            const shortId = getShortId(discount.id);
            const dealSlug = generateSlug(discount.title);
            const href = `/magaza/${brand.slug}/indirim/${dealSlug}-${shortId}`;
            return (
              <DealCard key={discount.id} deal={discount} brand={brand} href={href} />
            );
          })}
          {filteredDiscounts.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              Bu filtreye uygun indirim bulunamadı.
            </div>
          )}
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((coupon: any) => (
            <CouponCard key={coupon.id} coupon={coupon} brand={brand} />
          ))}
          {filteredCoupons.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              Bu filtreye uygun kupon bulunamadı.
            </div>
          )}
        </div>
      )}

      {activeTab === 'giveaways' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {giveaways.map((giveaway: any) => {
            const shortId = getShortId(giveaway.id);
            const dealSlug = generateSlug(giveaway.title);
            const href = `/magaza/${brand.slug}/cekilis/${dealSlug}-${shortId}`;
            return (
              <DealCard key={giveaway.id} deal={giveaway} brand={brand} href={href} />
            );
          })}
          {giveaways.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              Bu mağazada çekiliş bulunamadı.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
