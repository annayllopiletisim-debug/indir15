import connectDB from '@/lib/db';
import { Brand, Discount, Coupon, Giveaway, Category } from '@/lib/models';
import { Store, Tag, Ticket, Gift, FolderOpen, TrendingUp } from 'lucide-react';

async function getDashboardStats() {
  await connectDB();
  
  const [brandCount, discountCount, couponCount, giveawayCount, categoryCount] = await Promise.all([
    Brand.countDocuments(),
    Discount.countDocuments(),
    Coupon.countDocuments({ is_active: true }),
    Giveaway.countDocuments(),
    Category.countDocuments(),
  ]);

  const recentDiscounts = await Discount.find({}).sort({ created_at: -1 }).limit(5).lean();
  const brands = await Brand.find({}).lean();
  const brandMap = new Map(brands.map((b: any) => [b.id, b]));

  return {
    stats: {
      brands: brandCount,
      discounts: discountCount,
      coupons: couponCount,
      giveaways: giveawayCount,
      categories: categoryCount,
      total: discountCount + couponCount + giveawayCount,
    },
    recentDiscounts: recentDiscounts.map((d: any) => ({
      ...d,
      _id: d._id?.toString(),
      brand: brandMap.get(d.brand_id),
    })),
  };
}

export default async function AdminDashboardPage() {
  const { stats, recentDiscounts } = await getDashboardStats();

  const statCards = [
    { label: 'Mağazalar', value: stats.brands, icon: Store, color: 'bg-blue-500' },
    { label: 'İndirimler', value: stats.discounts, icon: Tag, color: 'bg-green-500' },
    { label: 'Kuponlar', value: stats.coupons, icon: Ticket, color: 'bg-purple-500' },
    { label: 'Çekilişler', value: stats.giveaways, icon: Gift, color: 'bg-pink-500' },
    { label: 'Kategoriler', value: stats.categories, icon: FolderOpen, color: 'bg-orange-500' },
    { label: 'Toplam Fırsat', value: stats.total, icon: TrendingUp, color: 'bg-violet-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Discounts */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Son Eklenen İndirimler</h2>
        <div className="space-y-3">
          {recentDiscounts.map((discount: any) => (
            <div key={discount.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div>
                <p className="text-white font-medium">{discount.title}</p>
                <p className="text-sm text-gray-400">{discount.brand?.name || 'Bilinmiyor'}</p>
              </div>
              {discount.discount_text && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                  {discount.discount_text}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
