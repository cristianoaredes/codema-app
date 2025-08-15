/**
 * Mobile Bottom Navigation Component
 * Provides quick access to main features on mobile devices
 */

import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/utils/responsive';
import {
  Home,
  FileText,
  Calendar,
  Users,
  Plus,
  BarChart3,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  requireAuth?: boolean;
  requireCODEMA?: boolean;
  isAction?: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'Início',
    icon: Home,
    path: '/dashboard',
    requireAuth: true,
  },
  {
    label: 'Reuniões',
    icon: Calendar,
    path: '/reunioes',
    requireCODEMA: true,
  },
  {
    label: 'Criar',
    icon: Plus,
    path: '/criar-relatorio',
    requireAuth: true,
    isAction: true,
  },
  {
    label: 'Relatórios',
    icon: FileText,
    path: '/relatorios',
  },
  {
    label: 'Mais',
    icon: Menu,
    path: '#menu',
    isAction: true,
  },
];

// Improved active state detection for mobile nav
const isActiveRoute = (itemPath: string, currentPath: string): boolean => {
  if (itemPath === currentPath) return true;
  
  // For nested routes
  if (currentPath.startsWith(itemPath + '/')) {
    return true;
  }
  
  // Special cases for main sections
  if (itemPath === '/dashboard' && currentPath === '/') return true;
  if (itemPath === '/relatorios' && currentPath.startsWith('/criar-relatorio')) return false;
  
  return false;
};

export function MobileNavigation() {
  const location = useLocation();
  const { profile, hasCODEMAAccess } = useAuth();
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = React.useState(false);

  // Only show on mobile
  if (!isMobile) return null;

  // Filter items based on permissions
  const visibleItems = navItems.filter(item => {
    if (item.requireAuth && !profile) return false;
    if (item.requireCODEMA && !hasCODEMAAccess) return false;
    return true;
  });

  const handleItemClick = (item: NavItem) => {
    if (item.path === '#menu') {
      setSheetOpen(true);
    }
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 border-t pb-safe">
        <div className="grid grid-cols-5 h-16">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path, location.pathname);
            const isCreateButton = item.path === '/criar-relatorio';

            if (item.path === '#menu') {
              return (
                <Sheet key={item.path} open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <button
                      className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-[10px]">{item.label}</span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[50vh]">
                    <MobileMenuContent onClose={() => setSheetOpen(false)} />
                  </SheetContent>
                </Sheet>
              );
            }

            if (isCreateButton) {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="flex items-center justify-center"
                >
                  <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow">
                    <Icon className="h-6 w-6" />
                  </div>
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => handleItemClick(item)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px]">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Add padding to main content to account for bottom nav */}
      <style>{`
        @media (max-width: 640px) {
          main {
            padding-bottom: calc(64px + env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </>
  );
}

// Mobile Menu Content (Sheet)
function MobileMenuContent({ onClose }: { onClose: () => void }) {
  const { profile, hasCODEMAAccess } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      label: 'Dashboard',
      icon: BarChart3,
      path: '/dashboard',
      requireAuth: true,
    },
    {
      label: 'Conselheiros',
      icon: Users,
      path: '/codema/conselheiros',
      requireCODEMA: true,
    },
    {
      label: 'Atas',
      icon: FileText,
      path: '/codema/atas',
      requireCODEMA: true,
    },
    {
      label: 'Resoluções',
      icon: FileText,
      path: '/codema/resolucoes',
      requireCODEMA: true,
    },
    {
      label: 'Documentos',
      icon: FileText,
      path: '/documentos',
      requireCODEMA: true,
    },
    {
      label: 'FMA',
      icon: BarChart3,
      path: '/fma',
      requireCODEMA: true,
    },
    {
      label: 'Ouvidoria',
      icon: FileText,
      path: '/ouvidoria',
    },
    {
      label: 'Perfil',
      icon: Users,
      path: '/perfil',
      requireAuth: true,
    },
  ].filter(item => {
    if (item.requireAuth && !profile) return false;
    if (item.requireCODEMA && !hasCODEMAAccess) return false;
    return true;
  });

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="px-4 py-6">
      <h3 className="text-lg font-semibold mb-4">Menu</h3>
      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.path}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleNavigate(item.path)}
            >
              <Icon className="h-4 w-4 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}