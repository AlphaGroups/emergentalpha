import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { usePartnerAuth } from '@/context/PartnerAuthContext';
import { LayoutDashboard, Users, FileText, LogOut, Menu, X, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LOGO_URL } from '@/config/constants';

const PartnerLayout = () => {
  const { partner, token, logout, loading } = usePartnerAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2a4599] border-t-transparent"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/partner/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/partner/dashboard', icon: LayoutDashboard },
    { name: 'Add Lead', path: '/partner/add-lead', icon: UserPlus },
    { name: 'My Referrals', path: '/partner/leads', icon: Users },
    { name: 'Materials', path: '/partner/materials', icon: FileText },
  ];

  const isActive = (path) => location.pathname === path || (path === '/partner/dashboard' && location.pathname === '/partner');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar toggle */}
      <button
        data-testid="partner-sidebar-toggle"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#2a4599] text-white rounded-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-slate-200">
          <Link to="/">
            <img 
              src={LOGO_URL} 
              alt="Alpha Groups" 
              className="h-12 w-auto object-contain"
            />
          </Link>
          <div className="mt-4 text-sm text-slate-500">Partner Portal</div>
        </div>

        <nav className="px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`partner-nav-${item.name.toLowerCase().replace(' ', '-')}`}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-[#2a4599] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <div className="px-4 py-2 mb-2">
            <p className="font-medium text-[#010822] text-sm">{partner?.name}</p>
            <p className="text-slate-500 text-xs">{partner?.referral_code}</p>
          </div>
          <Button
            data-testid="partner-logout"
            onClick={logout}
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-600 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 min-h-screen">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default PartnerLayout;
