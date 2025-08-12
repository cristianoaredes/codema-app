import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuTrigger,
  DropdownMenuShortcut
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  LogOut, 
  User, 
  FileText, 
  Search, 
  Bell, 
  Plus,
  Settings,
  HelpCircle,
  Command,
  Calendar,
  ClipboardCheck,
  Hash,
  ChevronRight,
  Keyboard,
  Moon,
  Sun
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function Header() {
  const {
    user,
    profile,
    signOut,
    hasCODEMAAccess,
    hasAdminAccess
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock notifications for demo
  const notifications = [
    { id: 1, title: "Nova reunião agendada", description: "Reunião ordinária marcada para amanhã", time: "5 min", unread: true, type: "meeting" },
    { id: 2, title: "Ata aprovada", description: "Ata da reunião 145/2024 foi aprovada", time: "1 hora", unread: true, type: "document" },
    { id: 3, title: "Protocolo processado", description: "PROC-001/2024 finalizado", time: "2 horas", unread: false, type: "protocol" },
    { id: 4, title: "Novo conselheiro", description: "João Silva foi adicionado como conselheiro", time: "1 dia", unread: false, type: "user" },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // Get current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path.includes('/reunioes')) return 'Reuniões';
    if (path.includes('/conselheiros')) return 'Conselheiros';
    if (path.includes('/atas')) return 'Atas';
    if (path.includes('/protocolos')) return 'Protocolos';
    if (path.includes('/fma')) return 'FMA - Fundo Municipal';
    if (path.includes('/auditoria')) return 'Auditoria';
    return 'CODEMA';
  };

  // Get breadcrumb parts
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const parts = path.split('/').filter(Boolean);
    return parts.map((part, index) => {
      const url = '/' + parts.slice(0, index + 1).join('/');
      const label = part.charAt(0).toUpperCase() + part.slice(1).replace('-', ' ');
      return { label, url };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com segurança.",
      });
      navigate('/auth');
    } catch (error: unknown) {
      toast({
        title: "Erro no logout",
        description: error instanceof Error ? error.message : "Não foi possível fazer o logout.",
        variant: "destructive",
      });
    }
  };

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'protocol': return <Hash className="h-4 w-4" />;
      case 'user': return <User className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <header className="w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 lg:px-6">
        {/* Left Section - Breadcrumbs and Page Title */}
        <div className="flex items-center flex-1 min-w-0">
          <div className="hidden lg:flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.url} className="flex items-center">
                {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
                <button
                  onClick={() => navigate(crumb.url)}
                  className={cn(
                    "hover:text-primary transition-colors",
                    index === breadcrumbs.length - 1 ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {crumb.label}
                </button>
              </div>
            ))}
          </div>
          <h1 className="lg:hidden text-xl font-semibold truncate">{getPageTitle()}</h1>
        </div>

        {/* Right Section - Actions and User Menu */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Global Search */}
          <div className="relative">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="absolute right-0 top-0">
                <Input
                  type="search"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                  className="w-64 pr-8"
                  autoFocus
                />
                <kbd className="absolute right-2 top-2.5 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ESC
                </kbd>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="relative"
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Buscar</span>
              </Button>
            )}
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                  >
                    {unreadCount}
                  </Badge>
                )}
                <span className="sr-only">Notificações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notificações</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex items-start space-x-2 p-3">
                  <div className={cn(
                    "mt-0.5",
                    notification.unread ? "text-primary" : "text-muted-foreground"
                  )}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={cn(
                      "text-sm",
                      notification.unread && "font-medium"
                    )}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.time} atrás
                    </p>
                  </div>
                  {notification.unread && (
                    <div className="h-2 w-2 bg-primary rounded-full mt-2" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center justify-center text-sm text-primary">
                Ver todas as notificações
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Actions */}
          {hasCODEMAAccess && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Ações rápidas</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Criar Novo</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/reunioes/nova')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Nova Reunião
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/codema/atas/nova')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Nova Ata
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/codema/protocolos/novo')}>
                  <Hash className="mr-2 h-4 w-4" />
                  Novo Protocolo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/processos/novo')}>
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Novo Processo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${user.email}.png`}
                      alt={profile?.full_name || user.email || ""}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {profile?.full_name
                        ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                        : user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-medium leading-none">
                      {profile?.full_name || 'Usuário'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    {profile?.role && (
                      <Badge variant="secondary" className="w-fit text-xs capitalize">
                        {profile.role.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate('/perfil')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/documentacao')}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Documentação</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/ajuda')}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Ajuda</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Keyboard className="mr-2 h-4 w-4" />
                  <span>Atalhos</span>
                  <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate('/auth')}>
              Acessar Plataforma
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;