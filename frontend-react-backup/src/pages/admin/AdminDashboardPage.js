import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../utils/api';
import { TrendingUp, MousePointer, Store, Clock, Copy, Eye, BarChart3, Tag } from 'lucide-react';
import { Button } from '../../components/ui/button';

const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/analytics/dashboard?period=${period}`);
        setAnalytics(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  const periodLabels = {
    '24h': 'Son 24 Saat',
    '7d': 'Son 7 Gün',
    '30d': 'Son 30 Gün'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-pulse text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - Admin Panel</title>
      </Helmet>

      <div data-testid="admin-dashboard">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
          
          {/* Period Filter */}
          <div className="flex items-center gap-2 bg-void-subtle p-1 rounded-lg">
            {['24h', '7d', '30d'].map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPeriod(p)}
                className={period === p ? 'bg-neon-purple hover:bg-neon-purple/90' : ''}
              >
                {periodLabels[p]}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-void-paper border border-white/5 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-neon-purple/20 flex items-center justify-center">
                <MousePointer className="w-5 h-5 text-neon-purple" />
              </div>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-heading font-bold text-white mb-1">{analytics?.total_clicks || 0}</div>
            <div className="text-xs text-gray-400">Toplam Tıklama ({periodLabels[period]})</div>
          </div>

          <div className="bg-void-paper border border-white/5 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-neon-blue/20 flex items-center justify-center">
                <Store className="w-5 h-5 text-neon-blue" />
              </div>
            </div>
            <div className="text-2xl font-heading font-bold text-white mb-1">{analytics?.brand_clicks?.length || 0}</div>
            <div className="text-xs text-gray-400">Aktif Mağaza</div>
          </div>

          <div className="bg-void-paper border border-white/5 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-neon-pink/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-neon-pink" />
              </div>
            </div>
            <div className="text-2xl font-heading font-bold text-white mb-1">{analytics?.popular_discounts?.length || 0}</div>
            <div className="text-xs text-gray-400">Popüler İndirim</div>
          </div>

          <div className="bg-void-paper border border-white/5 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Tag className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <div className="text-2xl font-heading font-bold text-white mb-1">{analytics?.category_performance?.length || 0}</div>
            <div className="text-xs text-gray-400">Aktif Kategori</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top 10 Brands */}
          <div className="bg-void-paper border border-white/5 p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Store className="w-5 h-5 text-neon-purple" />
              <h2 className="text-lg font-heading font-bold text-white">Top 10 Mağaza</h2>
            </div>
            <div className="space-y-3">
              {analytics?.brand_clicks?.slice(0, 10).map((item, index) => (
                <div key={item.brand_id} className="flex items-center justify-between p-3 bg-void-subtle rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <span className="font-medium text-sm text-white">{item.brand_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">{item.count}</span>
                    {item.brand_slug && (
                      <a
                        href={`/magaza/${item.brand_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 rounded bg-void-dark hover:bg-neon-purple/20 transition-colors text-white"
                      >
                        →
                      </a>
                    )}
                  </div>
                </div>
              )) || <p className="text-gray-400 text-sm">Henüz veri yok</p>}
            </div>
          </div>

          {/* Coupon Conversions */}
          <div className="bg-void-paper border border-white/5 p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-neon-blue" />
              <h2 className="text-lg font-heading font-bold text-white">Kupon Dönüşümleri</h2>
            </div>
            <div className="space-y-3">
              {analytics?.coupon_conversions?.slice(0, 10).map((item, index) => (
                <div key={item.coupon_id} className="p-3 bg-void-subtle rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-blue to-neon-cyan flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <span className="font-medium text-sm text-white block line-clamp-1">{item.title}</span>
                        <span className="text-xs text-gray-400">{item.brand_name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Eye className="w-3 h-3" />
                      <span>{item.views} görüntüleme</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Copy className="w-3 h-3" />
                      <span>{item.copies} kopyalama</span>
                    </div>
                    <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      item.conversion_rate >= 50 ? 'bg-green-500/20 text-green-400' :
                      item.conversion_rate >= 25 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      %{item.conversion_rate} dönüşüm
                    </div>
                  </div>
                </div>
              )) || <p className="text-gray-400 text-sm">Henüz veri yok</p>}
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Performance */}
          <div className="bg-void-paper border border-white/5 p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Tag className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-heading font-bold text-white">Kategori Performansı</h2>
            </div>
            <div className="space-y-3">
              {analytics?.category_performance?.slice(0, 8).map((item, index) => (
                <div key={item.category_id} className="flex items-center justify-between p-3 bg-void-subtle rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <span className="font-medium text-sm text-white">{item.category_name}</span>
                  </div>
                  <span className="text-gray-400 text-sm">{item.count} tıklama</span>
                </div>
              )) || <p className="text-gray-400 text-sm">Henüz veri yok</p>}
            </div>
          </div>

          {/* Popular Discounts */}
          <div className="bg-void-paper border border-white/5 p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-neon-pink" />
              <h2 className="text-lg font-heading font-bold text-white">Top 10 İndirim</h2>
            </div>
            <div className="space-y-3">
              {analytics?.popular_discounts?.slice(0, 10).map((item, index) => (
                <div key={item.discount_id} className="flex items-center justify-between p-3 bg-void-subtle rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-pink to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <span className="font-medium text-sm text-white block line-clamp-1">{item.title}</span>
                      <span className="text-xs text-gray-400">{item.brand_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">{item.count}</span>
                    {item.brand_slug && (
                      <a
                        href={`/magaza/${item.brand_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 rounded bg-void-dark hover:bg-neon-pink/20 transition-colors text-white"
                      >
                        →
                      </a>
                    )}
                  </div>
                </div>
              )) || <p className="text-gray-400 text-sm">Henüz veri yok</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
