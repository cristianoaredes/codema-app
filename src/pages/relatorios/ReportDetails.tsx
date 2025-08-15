import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  AlertCircle,
  Clock,
  FileText,
  Flag,
  Edit,
  Trash2
} from "lucide-react";
import { DetailPageHeader } from "@/components/common/DetailPageHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  location: string;
  user_id: string;
  category_id: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
  service_categories: {
    name: string;
    icon: string;
    description: string;
  } | null;
}

const getStatusVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
  switch (status) {
    case 'open':
      return 'default';
    case 'in_progress':
      return 'secondary';
    case 'resolved':
      return 'outline';
    case 'closed':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'open': 'Aberto',
    'in_progress': 'Em Andamento',
    'resolved': 'Resolvido',
    'closed': 'Fechado',
  };
  return statusMap[status] || status;
};

const getPriorityVariant = (priority: string): "default" | "destructive" | "secondary" | "outline" => {
  switch (priority) {
    case 'urgent':
      return 'destructive';
    case 'high':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getPriorityLabel = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    'urgent': 'Urgente',
    'high': 'Alta',
    'medium': 'Média',
    'low': 'Baixa',
  };
  return priorityMap[priority] || priority;
};

export default function ReportDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  const { data: report, isLoading, error } = useQuery({
    queryKey: ['report', id],
    queryFn: async (): Promise<Report> => {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          profiles!reports_user_id_fkey(full_name, email),
          service_categories!reports_category_id_fkey(name, icon, description)
        `)
        .eq('id', id!)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Compute values that will be used in useMemo before any early returns
  const isOwner = profile?.id === report?.user_id;
  const isAdmin = profile?.role === 'admin';
  const canEdit = isOwner || isAdmin;

  // Definir ações disponíveis
  const headerActions = React.useMemo(() => {
    if (!report) return [];
    
    const actions = [];
    
    if (canEdit) {
      actions.push({
        label: 'Editar',
        icon: <Edit className="h-4 w-4" />,
        onClick: () => navigate(`/relatorios/${id}/editar`),
        variant: 'outline' as const
      });
      
      if (isAdmin) {
        actions.push({
          label: 'Excluir',
          icon: <Trash2 className="h-4 w-4" />,
          onClick: async () => {
            if (window.confirm('Tem certeza que deseja excluir este relatório?')) {
              try {
                const { error } = await supabase
                  .from('relatorios')
                  .delete()
                  .eq('id', id);
                
                if (error) throw error;
                
                navigate('/relatorios');
              } catch (error) {
                console.error('Erro ao excluir relatório:', error);
              }
            }
          },
          variant: 'destructive' as const
        });
      }
    }
    
    return actions;
  }, [report, canEdit, isAdmin, id, navigate]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar relatório: {error.message}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/relatorios')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Relatórios
        </Button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Relatório não encontrado.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/relatorios')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Relatórios
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailPageHeader
        title={report.title}
        subtitle={`Relatório #${report.id.slice(0, 8)}`}
        backUrl="/relatorios"
        backLabel="Voltar para Relatórios"
        status={{
          label: getStatusLabel(report.status),
          variant: getStatusVariant(report.status)
        }}
        actions={headerActions}
      >
        {/* Priority badge as additional content */}
        <Badge variant={getPriorityVariant(report.priority)}>
          <Flag className="h-3 w-3 mr-1" />
          {getPriorityLabel(report.priority)}
        </Badge>
      </DetailPageHeader>

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informações do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Criado em: {new Date(report.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Atualizado em: {new Date(report.updated_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{report.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Por: {report.profiles?.full_name || 'Usuário não encontrado'}
              </span>
            </div>
          </div>
          
          {report.service_categories && (
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Categoria</h4>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="text-lg">{report.service_categories.icon}</span>
                </div>
                <div>
                  <p className="font-medium">{report.service_categories.name}</p>
                  {report.service_categories.description && (
                    <p className="text-sm text-muted-foreground">
                      {report.service_categories.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Descrição Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Descrição do Problema</CardTitle>
          <CardDescription>
            Detalhes relatados pelo solicitante
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-foreground">
              {report.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
            <CardDescription>
              {isOwner ? 'Gerencie seu relatório' : 'Ações administrativas'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/relatorios/editar/${report.id}`)}
              >
                Editar Relatório
              </Button>
              {isAdmin && report.status === 'open' && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('reports')
                        .update({ status: 'in_progress' })
                        .eq('id', report.id);
                      
                      if (error) throw error;
                      
                      toast.success('Status atualizado para "Em Andamento"');
                      // Refresh page to show updated status
                      window.location.reload();
                    } catch (error) {
                      console.error('Erro ao atualizar status:', error);
                      toast.error('Erro ao atualizar status do relatório');
                    }
                  }}
                >
                  Marcar como Em Andamento
                </Button>
              )}
              {isAdmin && report.status === 'in_progress' && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('reports')
                        .update({ status: 'resolved' })
                        .eq('id', report.id);
                      
                      if (error) throw error;
                      
                      toast.success('Relatório marcado como resolvido');
                      // Refresh page to show updated status
                      window.location.reload();
                    } catch (error) {
                      console.error('Erro ao atualizar status:', error);
                      toast.error('Erro ao marcar relatório como resolvido');
                    }
                  }}
                >
                  Marcar como Resolvido
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações de Contato */}
      {report.profiles && (isAdmin || isOwner) && (
        <Card>
          <CardHeader>
            <CardTitle>Contato do Solicitante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{report.profiles.full_name || 'Nome não informado'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="text-sm">{report.profiles.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}