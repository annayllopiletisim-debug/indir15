import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../utils/api';
import { TrendingUp, MousePointer, Store } from 'lucide-react';

const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/analytics/dashboard');
        setAnalytics(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

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
        <h1 className="text-3xl font-heading font-bold mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass-effect p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-neon-purple/20 flex items-center justify-center">
                <MousePointer className="w-6 h-6 text-neon-purple" />
              </div>
            </div>
            <div className="text-3xl font-heading font-bold mb-1">{analytics?.total_clicks || 0}</div>
            <div className="text-sm text-muted-foreground">Toplam Tıklama</div>
          </div>

          <div className="glass-effect p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-neon-blue/20 flex items-center justify-center">
                <Store className="w-6 h-6 text-neon-blue" />
              </div>
            </div>
            <div className="text-3xl font-heading font-bold mb-1">{analytics?.brand_clicks?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Aktif Mağaza</div>
          </div>

          <div className="glass-effect p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-neon-pink/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-neon-pink" />
              </div>
            </div>
            <div className="text-3xl font-heading font-bold mb-1">{analytics?.popular_discounts?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Popüler İndirim</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-effect p-6 rounded-2xl">
            <h2 className="text-xl font-heading font-bold mb-6">En Çok Tıklanan Mağazalar</h2>
            <div className="space-y-4">
              {analytics?.brand_clicks?.slice(0, 5).map((item, index) => (
                <div key={item.brand_id} className="flex items-center justify-between p-4 bg-void-subtle rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{item.brand_name}</span>
                  </div>
                  <span className="text-muted-foreground">{item.count} tıklama</span>
                </div>
              )) || <p className="text-muted-foreground">Henüz veri yok</p>}
            </div>
          </div>

          <div className="glass-effect p-6 rounded-2xl">
            <h2 className="text-xl font-heading font-bold mb-6">En Popüler İndirimler</h2>
            <div className="space-y-4">
              {analytics?.popular_discounts?.slice(0, 5).map((item, index) => (
                <div key={item.discount_id} className="p-4 bg-void-subtle rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-cyan flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <span className="font-medium block">{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.brand_name}</span>
                      </div>
                    </div>
                    <span className="text-muted-foreground">{item.count} tıklama</span>
                  </div>
                  <div className="flex space-x-2 mt-2">
                    {item.brand_slug && (
                      <a
                        href={`/magaza/${item.brand_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1 rounded-lg bg-void-dark hover:bg-neon-purple/20 transition-colors"
                        data-testid={`view-brand-${item.discount_id}`}
                      >
                        Mağazaya Git →
                      </a>
                    )}
                  </div>
                </div>
              )) || <p className="text-muted-foreground">Henüz veri yok</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;