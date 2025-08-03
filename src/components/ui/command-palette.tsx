import * as React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { 
  Home, 
  FileText, 
  Calendar, 
  Users, 
  FolderOpen,
  DollarSign,
  Gavel,
  MessageSquare,
  Settings as _Settings,
  LogOut,
  Search,
  PlusCircle,
  Clock,
  Star as _Star
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CommandItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  shortcut?: string;
  keywords?: string[];
  requireAuth?: boolean;
  requireRole?: string[];
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { user, profile: _profile, hasAdminAccess, hasCODEMAAccess, signOut } = useAuth();
  const [search, setSearch] = React.useState("");

  // Comandos disponíveis baseados no role do usuário
  const allCommands: CommandItem[] = React.useMemo(() => {
    const commands: CommandItem[] = [
      // Navegação pública
      {
        id: "home",
        title: "Página Inicial",
        icon: Home,
        action: () => navigate("/"),
        shortcut: "⌘H",
        keywords: ["home", "início", "principal"]
      },
      {
        id: "reports",
        title: "Relatórios Públicos",
        icon: FileText,
        action: () => navigate("/relatorios"),
        keywords: ["relatórios", "reports", "public"]
      }
    ];

    // Comandos autenticados
    if (user) {
      commands.push(
        {
          id: "dashboard",
          title: "Dashboard",
          icon: Home,
          action: () => navigate("/dashboard"),
          shortcut: "⌘D",
          keywords: ["painel", "dashboard"],
          requireAuth: true
        },
        {
          id: "create-report",
          title: "Criar Relatório",
          icon: PlusCircle,
          action: () => navigate("/criar-relatorio"),
          shortcut: "⌘N",
          keywords: ["novo", "criar", "relatório"],
          requireAuth: true
        },
        {
          id: "profile",
          title: "Meu Perfil",
          icon: Users,
          action: () => navigate("/perfil"),
          keywords: ["perfil", "conta", "usuário"],
          requireAuth: true
        }
      );
    }

    // Comandos CODEMA
    if (hasCODEMAAccess) {
      commands.push(
        {
          id: "meetings",
          title: "Reuniões",
          icon: Calendar,
          action: () => navigate("/reunioes"),
          shortcut: "⌘R",
          keywords: ["reunião", "meeting", "agenda"],
          requireRole: ["codema"]
        },
        {
          id: "minutes",
          title: "Atas",
          icon: FileText,
          action: () => navigate("/codema/atas"),
          shortcut: "⌘A",
          keywords: ["ata", "minutes", "registro"],
          requireRole: ["codema"]
        },
        {
          id: "resolutions",
          title: "Resoluções",
          icon: Gavel,
          action: () => navigate("/codema/resolucoes"),
          keywords: ["resolução", "resolution", "decisão"],
          requireRole: ["codema"]
        },
        {
          id: "documents",
          title: "Documentos",
          icon: FolderOpen,
          action: () => navigate("/documentos"),
          keywords: ["documento", "arquivo", "file"],
          requireRole: ["codema"]
        },
        {
          id: "fma",
          title: "FMA - Fundo Municipal",
          icon: DollarSign,
          action: () => navigate("/fma"),
          keywords: ["fundo", "financeiro", "fma"],
          requireRole: ["codema"]
        }
      );
    }

    // Comandos administrativos
    if (hasAdminAccess) {
      commands.push(
        {
          id: "counselors",
          title: "Gerenciar Conselheiros",
          icon: Users,
          action: () => navigate("/codema/conselheiros"),
          keywords: ["conselheiro", "membro", "usuário"],
          requireRole: ["admin"]
        },
        {
          id: "audit",
          title: "Auditoria",
          icon: Search,
          action: () => navigate("/codema/auditoria"),
          keywords: ["auditoria", "log", "histórico"],
          requireRole: ["admin"]
        }
      );
    }

    // Comandos gerais
    commands.push(
      {
        id: "complaints",
        title: "Ouvidoria",
        icon: MessageSquare,
        action: () => navigate("/ouvidoria"),
        keywords: ["ouvidoria", "denúncia", "reclamação"]
      }
    );

    // Logout
    if (user) {
      commands.push({
        id: "logout",
        title: "Sair",
        icon: LogOut,
        action: async () => {
          await signOut();
          onOpenChange(false);
        },
        shortcut: "⌘Q",
        keywords: ["sair", "logout", "desconectar"],
        requireAuth: true
      });
    }

    return commands;
  }, [user, hasAdminAccess, hasCODEMAAccess, navigate, signOut, onOpenChange]);

  // Filtrar comandos baseado na busca
  const filteredCommands = React.useMemo(() => {
    if (!search) return allCommands;

    const searchLower = search.toLowerCase();
    return allCommands.filter(cmd => 
      cmd.title.toLowerCase().includes(searchLower) ||
      cmd.keywords?.some(k => k.toLowerCase().includes(searchLower))
    );
  }, [allCommands, search]);

  // Comandos recentes (mockado por enquanto)
  const recentCommands = filteredCommands.slice(0, 3);

  // Atalhos de teclado
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="rounded-lg border shadow-md">
        <CommandInput 
          placeholder="Digite um comando ou pesquise..." 
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>
            Nenhum resultado encontrado para "{search}"
          </CommandEmpty>

          {/* Comandos recentes */}
          {recentCommands.length > 0 && !search && (
            <>
              <CommandGroup heading="Recentes">
                {recentCommands.map((cmd) => (
                  <CommandItem
                    key={cmd.id}
                    onSelect={() => {
                      cmd.action();
                      onOpenChange(false);
                    }}
                  >
                    <cmd.icon className="mr-2 h-4 w-4" />
                    <span>{cmd.title}</span>
                    <Clock className="ml-auto h-3 w-3 text-muted-foreground" />
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Todos os comandos agrupados */}
          <CommandGroup heading="Navegação">
            {filteredCommands
              .filter(cmd => ["home", "dashboard", "reports", "profile"].includes(cmd.id))
              .map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  onSelect={() => {
                    cmd.action();
                    onOpenChange(false);
                  }}
                  className="flex items-center"
                >
                  <cmd.icon className="mr-2 h-4 w-4" />
                  <span>{cmd.title}</span>
                  {cmd.shortcut && (
                    <CommandShortcut>{cmd.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
          </CommandGroup>

          {hasCODEMAAccess && (
            <CommandGroup heading="CODEMA">
              {filteredCommands
                .filter(cmd => ["meetings", "minutes", "resolutions", "documents", "fma"].includes(cmd.id))
                .map((cmd) => (
                  <CommandItem
                    key={cmd.id}
                    onSelect={() => {
                      cmd.action();
                      onOpenChange(false);
                    }}
                  >
                    <cmd.icon className="mr-2 h-4 w-4" />
                    <span>{cmd.title}</span>
                    {cmd.shortcut && (
                      <CommandShortcut>{cmd.shortcut}</CommandShortcut>
                    )}
                  </CommandItem>
                ))}
            </CommandGroup>
          )}

          {hasAdminAccess && (
            <CommandGroup heading="Administração">
              {filteredCommands
                .filter(cmd => ["counselors", "audit"].includes(cmd.id))
                .map((cmd) => (
                  <CommandItem
                    key={cmd.id}
                    onSelect={() => {
                      cmd.action();
                      onOpenChange(false);
                    }}
                  >
                    <cmd.icon className="mr-2 h-4 w-4" />
                    <span>{cmd.title}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          )}

          <CommandGroup heading="Ações">
            {filteredCommands
              .filter(cmd => ["create-report", "complaints", "logout"].includes(cmd.id))
              .map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  onSelect={() => {
                    cmd.action();
                    onOpenChange(false);
                  }}
                  className={cn(
                    cmd.id === "logout" && "text-destructive"
                  )}
                >
                  <cmd.icon className="mr-2 h-4 w-4" />
                  <span>{cmd.title}</span>
                  {cmd.shortcut && (
                    <CommandShortcut>{cmd.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

// Hook para usar o Command Palette
export function useCommandPalette() {
  const [open, setOpen] = React.useState(false);

  return {
    open,
    setOpen,
    toggle: () => setOpen(!open)
  };
}