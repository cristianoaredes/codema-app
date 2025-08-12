import { LucideIcon } from "lucide-react";
import { 
  BarChart3,
  PlusCircle,
  Calendar,
  FileText,
  Gavel,
  Hash,
  ClipboardCheck,
  FolderOpen,
  DollarSign,
  MessageSquare,
  Users,
  Eye,
  UserCog,
  Database,
  Settings,
  LogOut,
  Shield
} from "lucide-react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  requireAdmin?: boolean;
  requireCODEMA?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, hasAdminAccess, hasCODEMAAccess, signOut } = useAuth();
  const { toast } = useToast();
  const collapsed = state === "collapsed";

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com segurança.",
      });
      navigate('/auth');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro",
        description: "Não foi possível desconectar. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Simplified menu structure
  const menuSections: MenuSection[] = [
    {
      title: "Principal",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
        { title: "Criar Relatório", url: "/criar-relatorio", icon: PlusCircle },
      ]
    },
    {
      title: "CODEMA",
      items: [
        { title: "Reuniões", url: "/reunioes", icon: Calendar, requireCODEMA: true },
        { title: "Atas", url: "/codema/atas", icon: FileText, requireCODEMA: true },
        { title: "Resoluções", url: "/codema/resolucoes", icon: Gavel, requireCODEMA: true },
        { title: "Protocolos", url: "/codema/protocolos", icon: Hash, requireCODEMA: true },
        { title: "Processos", url: "/processos", icon: ClipboardCheck, requireCODEMA: true },
        { title: "Documentos", url: "/documentos", icon: FolderOpen, requireCODEMA: true },
        { title: "FMA", url: "/fma", icon: DollarSign, requireCODEMA: true },
      ]
    },
    {
      title: "Serviços",
      items: [
        { title: "Ouvidoria", url: "/ouvidoria", icon: MessageSquare },
      ]
    },
    {
      title: "Administração",
      items: [
        { title: "Conselheiros", url: "/codema/conselheiros", icon: Users, requireAdmin: true },
        { title: "Auditoria", url: "/codema/auditoria", icon: Eye, requireAdmin: true },
        { title: "Usuários", url: "/admin/users", icon: UserCog, requireAdmin: true },
        { title: "Dados de Teste", url: "/admin/data-seeder", icon: Database, requireAdmin: true },
      ]
    }
  ];

  // Filter items based on access permissions
  const filterItemsByAccess = (items: MenuItem[]) => {
    return items.filter(item => {
      if (item.requireAdmin && !hasAdminAccess) return false;
      if (item.requireCODEMA && !hasCODEMAAccess) return false;
      return true;
    });
  };

  // Check if route is active
  const isActive = (url: string) => {
    return location.pathname === url || location.pathname.startsWith(url + '/');
  };

  return (
    <Sidebar className="border-r bg-white" collapsible="icon">
      {/* Header with Logo */}
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 p-6">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground">
            C
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-foreground">CODEMA</span>
              <span className="text-sm text-muted-foreground">Itanhomi-MG</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="flex-1">
        <ScrollArea className="h-full px-4 py-6">
          <nav className="space-y-8">
            {menuSections.map((section) => {
              const filteredItems = filterItemsByAccess(section.items);
              
              if (filteredItems.length === 0) return null;

              return (
                <div key={section.title}>
                  {/* Section Title */}
                  {!collapsed && (
                    <div className="px-3 mb-3">
                      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {section.title}
                      </h2>
                    </div>
                  )}

                  {/* Section Items */}
                  <div className="space-y-1">
                    {filteredItems.map((item) => {
                      const active = isActive(item.url);
                      
                      return (
                        <NavLink
                          key={item.title}
                          to={item.url}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            "hover:bg-accent",
                            active 
                              ? "bg-primary/10 text-primary border-r-2 border-primary" 
                              : "text-foreground hover:text-primary"
                          )}
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      );
                    })}
                  </div>

                  {/* Separator between sections */}
                  {!collapsed && <Separator className="my-6" />}
                </div>
              );
            })}
          </nav>
        </ScrollArea>
      </SidebarContent>

      {/* Footer with User Info */}
      <SidebarFooter className="border-t">
        {profile && (
          <div className="p-4">
            {!collapsed ? (
              <div className="space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                      {(profile.full_name || profile.email || "U")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {profile.full_name || "Usuário"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {profile.email}
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 justify-start text-muted-foreground hover:text-foreground"
                    onClick={() => navigate('/perfil')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                    {(profile.full_name || profile.email || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}