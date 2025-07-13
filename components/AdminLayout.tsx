'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Users,
  Building2,
  ShoppingCart,
  Menu,
  X,
  LogOut,
  User,
  UserCheck,
  Package,
  Banknote,
  ChevronDown,
  ChevronRight,
  FileText,
  DollarSign,
  RefreshCw,
  Settings,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavigationItem {
  name: string;
  href?: string;
  icon: any;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3
  },
  {
    name: 'Freelancer',
    icon: Users,
    children: [
      { name: 'Verification', href: '/consultant-verification', icon: UserCheck },
      { name: 'Detail', href: '/freelancer-details', icon: Eye },
      { name: 'Withdrawal', href: '/withdrawal-requests', icon: Banknote },
    ]
  },
  {
    name: 'Consumer',
    icon: User,
    children: [
      { name: 'Detail', href: '/consumer-details', icon: Eye },
      { name: 'Refund', href: '/cancelled-orders', icon: RefreshCw },
    ]
  },
  {
    name: 'Order',
    icon: ShoppingCart,
    children: [
      { name: 'Order', href: '/order-details', icon: Package },
    ]
  },
  {
    name: 'Master',
    icon: Settings,
    children: [
      { name: 'Manage Items', href: '/service-items', icon: Package },
      { name: 'Manage Prices', href: '/tier-pricing', icon: DollarSign },
    ]
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Auto-expand parent menu if child is active
  useState(() => {
    navigation.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => child.href === pathname);
        if (hasActiveChild && !expandedMenus.includes(item.name)) {
          setExpandedMenus(prev => [...prev, item.name]);
        }
      }
    });
  });

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const isMenuExpanded = (menuName: string) => expandedMenus.includes(menuName);

  const isActiveRoute = (href?: string) => {
    if (!href) return false;
    return pathname === href;
  };

  const hasActiveChild = (children?: NavigationItem[]) => {
    if (!children) return false;
    return children.some(child => child.href === pathname);
  };

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isParent = !!item.children;
    const isExpanded = isMenuExpanded(item.name);
    const isActive = isActiveRoute(item.href);
    const hasActiveChildItem = hasActiveChild(item.children);

    if (isParent) {
      return (
        <div key={item.name}>
          {/* Parent Menu Item */}
          <button
            onClick={() => toggleMenu(item.name)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              hasActiveChildItem
                ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200"
                : "text-gray-700 hover:bg-gray-100/70 hover:text-blue-600"
            )}
          >
            <div className="flex items-center">
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            ) : (
              <ChevronRight className="h-4 w-4 transition-transform duration-200" />
            )}
          </button>

          {/* Child Menu Items */}
          <div className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
              {item.children?.map(child => renderNavigationItem(child, level + 1))}
            </div>
          </div>
        </div>
      );
    }

    // Child Menu Item or Single Item
    return (
      <Link
        key={item.name}
        href={item.href!}
        className={cn(
          "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
          level > 0 ? "ml-2" : "",
          isActive
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-[1.02]"
            : "text-gray-600 hover:bg-gray-100/70 hover:text-blue-600 hover:transform hover:scale-[1.01]"
        )}
        onClick={() => setSidebarOpen(false)}
      >
        <item.icon className={cn("mr-3 h-4 w-4", level > 0 ? "h-4 w-4" : "h-5 w-5")} />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200/50">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Portal
            </h1>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map(item => renderNavigationItem(item))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200/50">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}