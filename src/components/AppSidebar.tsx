import { useState } from "react";
import { 
  Home, 
  FileText, 
  PlusCircle, 
  User, 
  Settings,
  Shield,
  BarChart3,
  Users,
  Bell
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { profile } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-accent hover:text-accent-foreground";

  // Public navigation items
  const publicItems = [
    { title: "Início", url: "/", icon: Home },
    { title: "Relatórios Públicos", url: "/relatorios", icon: FileText },
  ];

  // CODEMA navigation items (when logged in)
  const codemaItems = [
    { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
    { title: "Reuniões", url: "/reunioes", icon: Users },
    { title: "Documentos", url: "/documentos", icon: FileText },
    { title: "Processos", url: "/processos", icon: FileText },
    { title: "FMA", url: "/fma", icon: Shield },
    { title: "Ouvidoria", url: "/ouvidoria", icon: Bell },
    { title: "Meu Perfil", url: "/perfil", icon: User },
  ];

  // Secretary/Admin navigation items
  const adminItems = [
    { title: "Painel Admin", url: "/admin", icon: Shield },
    { title: "Gerenciar Reuniões", url: "/admin/reunioes", icon: Users },
    { title: "Gerenciar Usuários", url: "/admin/usuarios", icon: Users },
    { title: "Configurações", url: "/admin/configuracoes", icon: Settings },
  ];

  // Determine which items to show based on user status and role
  const getNavigationItems = () => {
    if (!profile) {
      return publicItems;
    }

    let items = [...codemaItems];
    
    // Add admin items for secretários, presidentes e admins
    if (profile.role && ['admin', 'secretario', 'presidente'].includes(profile.role)) {
      items = [...items, ...adminItems];
    }

    return items;
  };

  const navigationItems = getNavigationItems();
  const isExpanded = navigationItems.some((i) => isActive(i.url));

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {profile ? "CODEMA Itanhemi" : "Portal Municipal"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Show user info when sidebar is expanded and user is logged in */}
        {!collapsed && profile && (
          <SidebarGroup>
            <SidebarGroupLabel>Usuário</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 py-2 text-sm">
                <div className="font-medium text-sidebar-foreground">
                  {profile.full_name || "Usuário"}
                </div>
                <div className="text-xs text-sidebar-foreground/70">
                  {profile.email}
                </div>
                <div className="text-xs text-sidebar-foreground/70 capitalize">
                  {profile.role === 'admin' ? 'Administrador' : 
                   profile.role === 'secretario' ? 'Secretário' :
                   profile.role === 'presidente' ? 'Presidente' :
                   profile.role === 'conselheiro_titular' ? 'Conselheiro Titular' :
                   profile.role === 'conselheiro_suplente' ? 'Conselheiro Suplente' :
                   profile.role === 'moderator' ? 'Moderador' : 'Cidadão'}
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}