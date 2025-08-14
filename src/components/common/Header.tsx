import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuTrigger
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
  Settings,
  HelpCircle,
  Calendar,
  ClipboardCheck,
  Hash,
  ChevronRight,
  BarChart3,
  Archive
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
    hasCODEMAAccess: _hasCODEMAAccess,
    hasAdminAccess: _hasAdminAccess
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
  const _getPageTitle = () => {
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

  const _breadcrumbs = getBreadcrumbs();

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
    <header className="w-full border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
                <div className="h-5 w-5 text-white">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-gray-900">CODEMA</span>
                <div className="text-xs text-gray-500">Gestão Municipal Inteligente</div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden lg:flex items-center space-x-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                    Soluções
                    <ChevronRight className="ml-1 h-4 w-4 rotate-90" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/fma')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Fundo Municipal Ambiental
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/ouvidoria')}>
                    <Bell className="mr-2 h-4 w-4" />
                    Ouvidoria
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/reunioes')}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Reuniões
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/codema/conselheiros')}>
                    <User className="mr-2 h-4 w-4" />
                    Conselheiros
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/arquivo-digital')}>
                    <Archive className="mr-2 h-4 w-4" />
                    Arquivo Digital
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/mobile')}>
                    <Smartphone className="mr-2 h-4 w-4" />
                    Mobile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                    Recursos
                    <ChevronRight className="ml-1 h-4 w-4 rotate-90" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/documentacao')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Documentação
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/ajuda')}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Central de Ajuda
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/relatorios')}>
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Relatórios
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard-executivo')}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Dashboard Executivo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="ghost" 
                className="text-gray-700 hover:text-gray-900"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>
            </nav>
          </div>

          {/* Right Section - Actions and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden md:block">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="absolute right-0 top-0 z-50">
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
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Buscar</span>
                </Button>
              )}
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-700">
                  <Bell className="h-5 w-5" />
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

            {/* User Menu or Login */}
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
                      <AvatarFallback className="bg-emerald-500 text-white">
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
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/auth')}
                  className="text-gray-700 hover:text-gray-900"
                >
                  Entrar
                </Button>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Começar Agora →
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;