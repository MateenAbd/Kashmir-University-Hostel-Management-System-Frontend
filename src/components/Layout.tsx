import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  FileText, 
  DollarSign, 
  Settings, 
  LogOut, 
  Menu,
  Home,
  ClipboardList,
  Calendar,
  CreditCard,
  Shield,
  Trash2,
  Clock,
  LucideIcon
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import Logo from '@/components/ui/logo';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: string[];
  requireMonitor?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/app/dashboard', icon: Home, roles: ['ADMIN', 'WARDEN', 'STUDENT'] },
  
  // Admin routes
  { label: 'Registration Requests', href: '/app/admin/registrations', icon: FileText, roles: ['ADMIN'] },
  { label: 'Form Numbers', href: '/app/admin/form-numbers', icon: ClipboardList, roles: ['ADMIN'] },
  { label: 'Student Management', href: '/app/admin/students', icon: Users, roles: ['ADMIN'] },
  { label: 'Payments', href: '/app/admin/payments', icon: CreditCard, roles: ['ADMIN'] },
  { label: 'Monthly Expenses', href: '/app/admin/expenses', icon: DollarSign, roles: ['ADMIN'] },
  { label: 'Deletion Requests', href: '/app/admin/deletion-requests', icon: Trash2, roles: ['ADMIN'] },
  
  // Warden routes
  { label: 'Approve Deletions', href: '/app/warden/deletions', icon: Trash2, roles: ['WARDEN'] },
  { label: 'Late Absence Requests', href: '/app/warden/absence-requests', icon: Clock, roles: ['WARDEN'] },
  { label: 'Expense Reports', href: '/app/warden/expenses', icon: DollarSign, roles: ['WARDEN'] },
  { label: 'System Settings', href: '/app/warden/settings', icon: Settings, roles: ['WARDEN'] },
  
  // Student routes
  { label: 'Attendance History', href: '/app/student/attendance', icon: Calendar, roles: ['STUDENT'] },
  { label: 'Absence Requests', href: '/app/student/absence-requests', icon: ClipboardList, roles: ['STUDENT'] },
  
  // Monitor routes
  { label: 'Early Absence Requests', href: '/app/monitor/absence-requests', icon: UserCheck, roles: ['STUDENT'], requireMonitor: true },
];

const Layout = () => {
  const { user, logout, hasRole, isMonitor } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(item => {
    const hasRequiredRole = item.roles.some(role => hasRole(role));
    const hasMonitorAccess = !item.requireMonitor || isMonitor;
    return hasRequiredRole && hasMonitorAccess;
  });

  const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-sidebar-border">
        <Logo size="md" />
        <div className="mt-4">
          <p className="text-sm font-medium text-sidebar-foreground">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
              {user?.role}
            </span>
            {isMonitor && (
              <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full">
                MONITOR
              </span>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredNavItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => {
              navigate(item.href);
              onItemClick?.();
            }}
          >
            <item.icon size={18} className="mr-3" />
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut size={18} className="mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-sidebar border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between">
          <Logo size="sm" />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar">
              <SidebarContent onItemClick={() => {}} />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;