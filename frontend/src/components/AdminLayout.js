import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Tag, Package, Percent, Image, FolderTree, LogOut, Search, Settings } from 'lucide-react';
import { removeAuthToken, removeAuthUser } from '../utils/auth';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Debug: v2
  console.log('AdminLayout loaded - version 2');

  const handleLogout = () => {
    removeAuthToken();
    removeAuthUser();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/categories', label: 'Kategoriler', icon: FolderTree },
    { path: '/admin/brands', label: 'Mağazalar', icon: Package },
    { path: '/admin/coupons', label: 'Kuponlar', icon: Tag },
    { path: '/admin/discounts', label: 'İndirimler', icon: Percent },
    { path: '/admin/keywords', label: 'Anahtar Kelimeler', icon: Search },
    { path: '/admin/hero-slides', label: 'Hero Slaytlar', icon: Image },
    { path: '/admin/settings', label: 'Site Ayarları', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex" data-testid="admin-layout">
      <aside className="w-64 bg-void-paper border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
              <span className="text-white font-heading font-bold text-xl">SS</span>
            </div>
            <span className="text-lg font-heading font-bold text-gradient">İndirim Keşfet</span>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-neon-purple to-neon-pink'
                        : 'hover:bg-white/5'
                    }`}
                    data-testid={`nav-${item.path.split('/').pop()}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-destructive/20 text-destructive transition-all"
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;