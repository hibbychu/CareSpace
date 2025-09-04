'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { BrandLogo } from '@/components/brand-logo';
import { 
  BarChart3, 
  Calendar, 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  Search
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActiveRoute = (route: string) => {
    if (route === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(route);
  };

  const getNavLinkClass = (route: string) => {
    const baseClass = "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105";
    if (isActiveRoute(route)) {
      return `${baseClass} bg-[#7C4DFF] text-white shadow-lg`;
    }
    return `${baseClass} text-gray-700 hover:bg-[#7C4DFF]/10 hover:text-[#7C4DFF]`;
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#7C4DFF] mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-[#7C4DFF]/30 animate-pulse mx-auto"></div>
          </div>
          <p className="text-gray-600 animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <BrandLogo variant="icon" size="sm" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                CareSpace Admin
              </h1>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Development Mode
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C4DFF] focus:border-[#7C4DFF] w-64"
              />
            </div>
            
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-[#7C4DFF] hover:bg-[#7C4DFF]/10 rounded-lg transition-all duration-200 transform hover:scale-110 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            
            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'admin@carespace.com'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            <Link
              href="/dashboard"
              className={getNavLinkClass('/dashboard')}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/dashboard/events"
              className={getNavLinkClass('/dashboard/events')}
            >
              <Calendar className="h-5 w-5" />
              <span>Events</span>
            </Link>
            <Link
              href="/dashboard/forums"
              className={getNavLinkClass('/dashboard/forums')}
            >
              <MessageSquare className="h-5 w-5" />
              <span>Forums</span>
            </Link>
            <Link
              href="/dashboard/users"
              className={getNavLinkClass('/dashboard/users')}
            >
              <Users className="h-5 w-5" />
              <span>Users</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className={getNavLinkClass('/dashboard/settings')}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
