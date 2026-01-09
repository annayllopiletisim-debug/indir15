export const dynamic = 'force-dynamic';

import connectDB from '@/lib/db';
import { Brand, Discount, Coupon, Giveaway, Category, BlogPost, ContactMessage } from '@/lib/models';
import { Store, Tag, Ticket, Gift, FolderOpen, TrendingUp, Eye, MousePointer, FileText, MessageSquare } from 'lucide-react';
import Link from 'next/link';

async function getDashboardStats() {
  await connectDB();
  
  const [brandCount, discountCount, couponCount, giveawayCount, categoryCount, blogCount, unreadMessages] = await Promise.all([
    Brand.countDocuments(),
    Discount.countDocuments(),
    Coupon.countDocuments({ is_active: true }),
    Giveaway.countDocuments(),
    Category.countDocuments(),
    BlogPost.countDocuments({ is_published: true }),
    ContactMessage.countDocuments({ is_read: false }),
  ]);

  // Get top clicked discounts
  const topClickedDiscounts = await Discount.find({ click_count: { $gt: 0 } })
    .sort({ click_count: -1 })
    .limit(5)
    .lean();

  // Get top clicked coupons
  const topClickedCoupons = await Coupon.find({ click_count: { $gt: 0 } })
    .sort({ click_count: -1 })
    .limit(5)
    .lean();

  // Get top viewed blog posts
  const topViewedBlogs = await BlogPost.find({ is_published: true, view_count: { $gt: 0 } })
    .sort({ view_count: -1 })
    .limit(5)
    .lean();

  // Get recent discounts
  const recentDiscounts = await Discount.find({}).sort({ created_at: -1 }).limit(5).lean();
  
  // Get brands map
  const brands = await Brand.find({}).lean();
  const brandMap = new Map(brands.map((b: any) => [b.id, b]));

  // Calculate total clicks
  const totalDiscountClicks = await Discount.aggregate([
    { $group: { _id: null, total: { $sum: '$click_count' } } }
  ]);
  const totalCouponClicks = await Coupon.aggregate([
    { $group: { _id: null, total: { $sum: '$click_count' } } }
  ]);
  const totalBlogViews = await BlogPost.aggregate([
    { $group: { _id: null, total: { $sum: '$view_count' } } }
  ]);

  return {
    stats: {
      brands: brandCount,
      discounts: discountCount,
      coupons: couponCount,
      giveaways: giveawayCount,
      categories: categoryCount,
      blogs: blogCount,
      unreadMessages: unreadMessages,
      total: discountCount + couponCount + giveawayCount,
      totalClicks: (totalDiscountClicks[0]?.total || 0) + (totalCouponClicks[0]?.total || 0),
      totalBlogViews: totalBlogViews[0]?.total || 0,
    },
    topClickedDiscounts: topClickedDiscounts.map((d: any) => ({
      ...d,
      _id: undefined,
      brand: brandMap.get(d.brand_id),
    })),
    topClickedCoupons: topClickedCoupons.map((c: any) => ({
      ...c,
      _id: undefined,
      brand: brandMap.get(c.brand_id),
    })),
    topViewedBlogs: topViewedBlogs.map((b: any) => ({
      ...b,
      _id: undefined,
    })),
    recentDiscounts: recentDiscounts.map((d: any) => ({
      ...d,
      _id: undefined,
      brand: brandMap.get(d.brand_id),
    })),
  };
}

export default async function AdminDashboardPage() {
  const { stats, topClickedDiscounts, topClickedCoupons, topViewedBlogs, recentDiscounts } = await getDashboardStats();

  const statCards = [
    { label: 'Mağazalar', value: stats.brands, icon: Store, color: 'bg-blue-500', href: '/admin/magazalar' },
    { label: 'İndirimler', value: stats.discounts, icon: Tag, color: 'bg-green-500', href: '/admin/indirimler' },
    { label: 'Kuponlar', value: stats.coupons, icon: Ticket, color: 'bg-purple-500', href: '/admin/kuponlar' },
    { label: 'Çekilişler', value: stats.giveaways, icon: Gift, color: 'bg-pink-500', href: '/admin/cekilisler' },
    { label: 'Blog Yazıları', value: stats.blogs, icon: FileText, color: 'bg-cyan-500', href: '/admin/blog' },
    { label: 'Toplam Fırsat', value: stats.total, icon: TrendingUp, color: 'bg-violet-500', href: '#' },
  ];

  const analyticsCards = [
    { label: 'Toplam Tıklama', value: stats.totalClicks, icon: MousePointer, color: 'bg-amber-500' },
    { label: 'Blog Görüntüleme', value: stats.totalBlogViews, icon: Eye, color: 'bg-teal-500' },
    { label: 'Okunmamış Mesaj', value: stats.unreadMessages, icon: MessageSquare, color: 'bg-red-500', href: '/admin/mesajlar' },
    { label: 'Kategoriler', value: stats.categories, icon: FolderOpen, color: 'bg-orange-500', href: '/admin/kategoriler' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href} className="block">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Analytics Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {analyticsCards.map((stat) => (
          stat.href ? (
            <Link key={stat.label} href={stat.href} className="block">
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{stat.value.toLocaleString('tr-TR')}</p>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div key={stat.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{stat.value.toLocaleString('tr-TR')}</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
              </div>
            </div>
          )
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Clicked Discounts */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MousePointer className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">En Çok Tıklanan İndirimler</h2>
          </div>
          <div className="space-y-3">
            {topClickedDiscounts.length > 0 ? (
              topClickedDiscounts.map((discount: any, index: number) => (
                <div key={discount.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-white font-medium text-sm">{discount.title}</p>
                      <p className="text-xs text-gray-400">{discount.brand?.name || 'Bilinmiyor'}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm font-medium">
                    {discount.click_count} tıklama
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Henüz tıklama verisi yok</p>
            )}
          </div>
        </div>

        {/* Top Clicked Coupons */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Ticket className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">En Çok Tıklanan Kuponlar</h2>
          </div>
          <div className="space-y-3">
            {topClickedCoupons.length > 0 ? (
              topClickedCoupons.map((coupon: any, index: number) => (
                <div key={coupon.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-white font-medium text-sm">{coupon.title}</p>
                      <p className="text-xs text-gray-400">{coupon.brand?.name || 'Bilinmiyor'} • {coupon.code}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm font-medium">
                    {coupon.click_count} tıklama
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Henüz tıklama verisi yok</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Viewed Blog Posts */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">En Çok Okunan Blog Yazıları</h2>
          </div>
          <div className="space-y-3">
            {topViewedBlogs.length > 0 ? (
              topViewedBlogs.map((blog: any, index: number) => (
                <div key={blog.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-white font-medium text-sm">{blog.title}</p>
                      <p className="text-xs text-gray-400">{blog.category || 'Genel'}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm font-medium">
                    {blog.view_count} görüntüleme
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Henüz görüntüleme verisi yok</p>
            )}
          </div>
        </div>

        {/* Recent Discounts */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Son Eklenen İndirimler</h2>
          </div>
          <div className="space-y-3">
            {recentDiscounts.map((discount: any) => (
              <div key={discount.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-white font-medium text-sm">{discount.title}</p>
                  <p className="text-xs text-gray-400">{discount.brand?.name || 'Bilinmiyor'}</p>
                </div>
                {discount.discount_text && (
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-sm font-medium">
                    {discount.discount_text}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
