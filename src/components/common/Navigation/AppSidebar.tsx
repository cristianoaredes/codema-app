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
  Bell,
  Calendar,
  FolderOpen,
  DollarSign,
  Gavel,
  Eye,
  UserCog,
  Archive,
  ClipboardCheck,
  MessageSquare,
  LogOut
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
  const { profile, hasAdminAccess, hasCODEMAAccess, signOut } = useAuth();
  const { toast } = useToast();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta.",
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro",
        description: "Não foi possível desconectar. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium" 
      : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground transition-colors";

  // Public navigation items
  const publicItems = [
    { title: "Início", url: "/", icon: Home },
    { title: "Relatórios Públicos", url: "/relatorios", icon: FileText },
  ];

  // Main CODEMA navigation items
  const mainItems = [
    { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
    { title: "Criar Relatório", url: "/criar-relatorio", icon: PlusCircle },
  ];

  // Core CODEMA functions - requires CODEMA access
  const codemaItems = [
    { title: "Reuniões", url: "/reunioes", icon: Calendar, requireCODEMA: true },
    { title: "Atas", url: "/codema/atas", icon: FileText, requireCODEMA: true },
    { title: "Resoluções", url: "/codema/resolucoes", icon: Gavel, requireCODEMA: true },
    { title: "Processos", url: "/processos", icon: ClipboardCheck, requireCODEMA: true },
    { title: "Documentos", url: "/documentos", icon: FolderOpen, requireCODEMA: true },
    { title: "FMA", url: "/fma", icon: DollarSign, requireCODEMA: true },
  ];

  // General access items
  const generalItems = [
    { title: "Ouvidoria", url: "/ouvidoria", icon: MessageSquare },
  ];

  // Administrative functions - requires admin access
  const adminItems = [
    { title: "Painel Admin", url: "/admin", icon: Shield, requireAdmin: true },
    { title: "Conselheiros", url: "/codema/conselheiros", icon: Users, requireAdmin: true },
    { title: "Auditoria", url: "/codema/auditoria", icon: Eye, requireAdmin: true },
    { title: "Usuários", url: "/admin/users", icon: UserCog, requireAdmin: true },
  ];

  // User profile
  const profileItems = [
    { title: "Meu Perfil", url: "/perfil", icon: User },
  ];

  // Filter items based on access permissions
  const filterItemsByAccess = (items: any[]) => {
    return items.filter(item => {
      if (item.requireAdmin && !hasAdminAccess) return false;
      if (item.requireCODEMA && !hasCODEMAAccess) return false;
      return true;
    });
  };

  // Determine which items to show based on user status and role
  const getNavigationItems = () => {
    if (!profile) {
      return { public: publicItems };
    }

    const items = {
      main: mainItems,
      codema: filterItemsByAccess(codemaItems),
      general: generalItems,
      admin: filterItemsByAccess(adminItems),
      profile: profileItems
    };

    return items;
  };

  const navigationGroups = getNavigationItems();

  const renderMenuItems = (items: any[]) => (
    <SidebarMenu>
      {items.map((item) => (
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
  );

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        {/* Public Items (when not logged in) */}
        {!profile && navigationGroups.public && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/80 font-semibold">Portal Municipal</SidebarGroupLabel>
            <SidebarGroupContent>
              {renderMenuItems(navigationGroups.public)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Main Dashboard (when logged in) */}
        {profile && navigationGroups.main && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/80 font-semibold">Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              {renderMenuItems(navigationGroups.main)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* CODEMA Core Functions */}
        {profile && navigationGroups.codema && navigationGroups.codema.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/80 font-semibold">CODEMA</SidebarGroupLabel>
            <SidebarGroupContent>
              {renderMenuItems(navigationGroups.codema)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* General Functions */}
        {profile && navigationGroups.general && navigationGroups.general.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/80 font-semibold">Serviços</SidebarGroupLabel>
            <SidebarGroupContent>
              {renderMenuItems(navigationGroups.general)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Administrative Functions */}
        {profile && navigationGroups.admin && navigationGroups.admin.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/80 font-semibold">Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              {renderMenuItems(navigationGroups.admin)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* User Profile */}
        {profile && navigationGroups.profile && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/80 font-semibold">Conta</SidebarGroupLabel>
            <SidebarGroupContent>
              {renderMenuItems(navigationGroups.profile)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* User Info and Logout at Bottom */}
        {profile && (
          <SidebarGroup className="mt-auto border-t border-sidebar-border pt-2">
            <SidebarGroupContent>
              {!collapsed ? (
                <div className="space-y-3">
                  {/* User Info */}
                  <div className="px-3 py-3 text-sm bg-sidebar-accent/30 rounded-lg mx-2">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                        {(profile.full_name || profile.email || "U")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sidebar-foreground truncate text-sm">
                          {profile.full_name || "Usuário"}
                        </div>
                        <div className="text-xs text-sidebar-foreground/60 truncate">
                          {profile.email}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-sidebar-foreground/70 capitalize px-2 py-1 bg-primary/10 rounded-md text-center">
                      {profile.role === 'admin' ? 'Administrador' : 
                       profile.role === 'secretario' ? 'Secretário' :
                       profile.role === 'presidente' ? 'Presidente' :
                       profile.role === 'conselheiro_titular' ? 'Conselheiro Titular' :
                       profile.role === 'conselheiro_suplente' ? 'Conselheiro Suplente' :
                       profile.role === 'moderator' ? 'Moderador' : 'Cidadão'}
                    </div>
                  </div>
                  
                  {/* Logout Button */}
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={handleSignOut}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive hover-lift transition-smooth w-full justify-start mx-2 font-medium"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair da Conta</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* User Avatar */}
                  <div className="px-2 py-2 flex justify-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {(profile.full_name || profile.email || "U")[0].toUpperCase()}
                    </div>
                  </div>
                  
                  {/* Logout Icon */}
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={handleSignOut}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive hover-lift transition-smooth w-full justify-center"
                        title="Sair da Conta"
                      >
                        <LogOut className="h-4 w-4" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}