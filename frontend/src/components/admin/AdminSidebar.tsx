'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Store, 
  Tag, 
  Ticket, 
  Gift, 
  FolderOpen, 
  FileText, 
  LogOut,
  Settings,
  Mail
} from 'lucide-react';

const menuItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/magazalar', icon: Store, label: 'Mağazalar' },
  { href: '/admin/indirimler', icon: Tag, label: 'İndirimler' },
  { href: '/admin/kuponlar', icon: Ticket, label: 'Kuponlar' },
  { href: '/admin/cekilisler', icon: Gift, label: 'Çekilişler' },
  { href: '/admin/kategoriler', icon: FolderOpen, label: 'Kategoriler' },
  { href: '/admin/blog', icon: FileText, label: 'Blog' },
  { href: '/admin/mesajlar', icon: Mail, label: 'Mesajlar' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <Link href="/admin" className="text-xl font-bold text-white">
          📊 Admin Panel
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-slate-700 hover:text-white transition-all"
        >
          <Settings className="w-5 h-5" />
          Siteyi Gör
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/20 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
