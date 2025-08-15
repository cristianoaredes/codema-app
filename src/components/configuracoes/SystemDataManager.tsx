import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useConselheiros } from "@/hooks/useConselheiros";
import { useReunioes } from "@/hooks/useReunioes";
import { toast } from "sonner";
import { 
  Database, 
  Download, 
  RefreshCw, 
  HardDrive,
  Users,
  Calendar,
  FileText,
  AlertTriangle,
  Loader2
} from "lucide-react";

interface SystemDataManagerProps {
  children: React.ReactNode;
}

interface SystemStats {
  conselheiros: number;
  reunioes: number;
  atas: number;
  storageUsed: number;
  lastBackup: string | null;
}

export function SystemDataManager({ children }: SystemDataManagerProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<SystemStats>({
    conselheiros: 0,
    reunioes: 0,
    atas: 0,
    storageUsed: 0,
    lastBackup: null,
  });
  
  const { hasAdminAccess } = useAuth();
  const { data: conselheiros = [] } = useConselheiros();
  const { data: reunioes = [] } = useReunioes();

  const loadSystemStats = async () => {
    setIsLoading(true);
    try {
      // Count basic entities
      const basicStats = {
        conselheiros: conselheiros.length,
        reunioes: reunioes.length,
        atas: 0, // Will be calculated from reunioes with atas
        storageUsed: 0, // Placeholder - could be calculated from file uploads
        lastBackup: localStorage.getItem('last-backup-date'),
      };

      // Count atas from reunioes
      const atasCount = reunioes.filter(r => r.protocolo_ata).length;
      basicStats.atas = atasCount;

      setStats(basicStats);
    } catch (error) {
      console.error('Error loading system stats:', error);
      toast.error('Erro ao carregar estatísticas do sistema');
    } finally {
      setIsLoading(false);
    }
  };

  const exportSystemData = async () => {
    if (!hasAdminAccess) {
      toast.error('Apenas administradores podem exportar dados');
      return;
    }

    try {
      toast.info('Preparando exportação de dados...');
      
      // Prepare data export
      const exportData = {
        timestamp: new Date().toISOString(),
        system_info: {
          version: '1.0.0',
          environment: 'development',
          municipality: 'Itanhomi-MG',
        },
        data: {
          conselheiros: conselheiros,
          reunioes: reunioes,
          stats: stats,
        }
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `codema-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Update last backup date
      const backupDate = new Date().toISOString();
      localStorage.setItem('last-backup-date', backupDate);
      setStats(prev => ({ ...prev, lastBackup: backupDate }));

      toast.success('Dados exportados com sucesso!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Erro ao exportar dados do sistema');
    }
  };

  const clearSystemCache = async () => {
    if (!hasAdminAccess) {
      toast.error('Apenas administradores podem limpar o cache');
      return;
    }

    try {
      // Clear local storage cache (except essential items)
      const essentialKeys = ['supabase.auth.token', 'codema-ui-theme', 'last-backup-date'];
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !essentialKeys.includes(key)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear React Query cache by refreshing queries
      window.location.reload();

      toast.success('Cache do sistema limpo com sucesso!');
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Erro ao limpar cache do sistema');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      loadSystemStats();
    }
    setOpen(newOpen);
  };

  // Check admin access
  if (!hasAdminAccess) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Dados do Sistema
            </DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Apenas administradores podem acessar o gerenciamento de dados do sistema.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gerenciamento de Dados do Sistema
          </DialogTitle>
          <DialogDescription>
            Visualize estatísticas, exporte dados e gerencie o armazenamento do sistema.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando estatísticas...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Statistics Overview */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Estatísticas do Sistema</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Conselheiros</p>
                    <p className="text-lg font-semibold">{stats.conselheiros}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Reuniões</p>
                    <p className="text-lg font-semibold">{stats.reunioes}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Atas</p>
                    <p className="text-lg font-semibold">{stats.atas}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <HardDrive className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Armazenamento</p>
                    <p className="text-sm font-semibold">
                      <Badge variant="secondary">Otimizado</Badge>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Backup Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Backup e Exportação</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Último backup</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.lastBackup 
                        ? new Date(stats.lastBackup).toLocaleString('pt-BR')
                        : 'Nenhum backup realizado'
                      }
                    </p>
                  </div>
                  <Badge variant={stats.lastBackup ? "default" : "secondary"}>
                    {stats.lastBackup ? "Disponível" : "Pendente"}
                  </Badge>
                </div>
                
                <Button
                  onClick={exportSystemData}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Download className="h-4 w-4" />
                  Exportar Dados do Sistema
                </Button>
              </div>
            </div>

            <Separator />

            {/* System Maintenance */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Manutenção do Sistema</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Cache do sistema</p>
                    <p className="text-xs text-muted-foreground">
                      Limpar dados temporários para melhorar performance
                    </p>
                  </div>
                  <Button
                    onClick={clearSystemCache}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Limpar Cache
                  </Button>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm text-green-700 dark:text-green-300">
                Sistema funcionando normalmente
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setOpen(false)}
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}