import * as React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Briefcase,
  BarChart3,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Dropdown } from '@/components/ui/Dropdown';
import { Button } from '@/components/ui/Button';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: 'My Resumes',
    href: '/resumes',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: 'AI Analysis',
    href: '/ai-analysis',
    icon: <Sparkles className="h-5 w-5 text-indigo-400" />,
  },
  {
    title: 'Job Tracker',
    href: '/jobs',
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: <Bell className="h-5 w-5" />,
    badge: 2,
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: <User className="h-5 w-5" />,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    sidebarCollapsed,
    toggleSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useUIStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      id: 'profile',
      label: 'My Profile',
      icon: <User className="h-4 w-4" />,
      onClick: () => navigate('/profile'),
    },
    {
      id: 'settings',
      label: 'Account Settings',
      icon: <Settings className="h-4 w-4" />,
      onClick: () => navigate('/settings'),
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: <LogOut className="h-4 w-4" />,
      destructive: true,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 relative z-30',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-lg tracking-tight truncate">
                ResumeATS<span className="text-primary font-black">.ai</span>
              </span>
            )}
          </Link>
          <button
            onClick={toggleSidebarCollapsed}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none transition-colors"
            aria-label="Toggle sidebar width"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  sidebarCollapsed && 'justify-center px-0'
                )}
                title={sidebarCollapsed ? item.title : undefined}
              >
                <div className="shrink-0">{item.icon}</div>
                {!sidebarCollapsed && <span className="flex-1 truncate">{item.title}</span>}
                {!sidebarCollapsed && item.badge !== undefined && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-semibold',
                      isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Card in Sidebar Bottom */}
        <div className="border-t border-border p-3">
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg p-2 bg-muted/40',
              sidebarCollapsed && 'justify-center p-1'
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {user?.fullName || 'Candidate'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {user?.email || 'user@ats.ai'}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden rounded-md p-2 text-muted-foreground hover:bg-muted focus:outline-none"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="hidden sm:inline">Encrypted AI Workspace</span>
            </div>
          </div>

          {/* Right Header Icons */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link to="/notifications">
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
              </Button>
            </Link>

            {/* User Profile Dropdown */}
            <Dropdown
              trigger={
                <div className="flex items-center gap-2 cursor-pointer select-none">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-xs shadow-sm">
                    {user?.fullName?.charAt(0) || 'C'}
                  </div>
                </div>
              }
              items={userMenuItems}
              align="right"
            />
          </div>
        </header>

        {/* Page Content Rendered Here */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-xs bg-card border-r border-border p-4 shadow-xl z-10">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2 font-bold text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                <span>ResumeATS.ai</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
                className="h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-border">
              <Button
                variant="destructive"
                className="w-full gap-2"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
