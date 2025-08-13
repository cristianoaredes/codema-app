import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  useReuniao, 
  useConvocacoes, 
  usePresencas, 
  useMarcarPresenca,
  useEnviarConvocacoes,
  useGerarProtocoloAta,
  useGerarProtocoloConvocacao
} from "@/hooks/useReunioes";
import { useConselheirosNames } from "@/hooks/useConselheiros";
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
  Calendar, 
  MapPin, 
  Users, 
  FileText, 
  ArrowLeft, 
  Clock,
  AlertCircle,
  X,
  Check,
  Mail,
  UserCheck
} from "lucide-react";
import { DetailPageHeader } from "@/components/common/DetailPageHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface PautaItem {
  numero: number;
  titulo: string;
  descricao: string;
  responsavel: string;
  detalhes?: string;
}

interface PautaData {
  horario_inicio?: string;
  tipo_reuniao?: string;
  presenca_obrigatoria?: boolean;
  itens?: PautaItem[];
  observacoes?: string[];
}

const getStatusVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
  switch (status) {
    case 'agendada':
      return 'default';
    case 'realizada':
      return 'secondary';
    case 'cancelada':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'agendada': 'Agendada',
    'realizada': 'Realizada',
    'cancelada': 'Cancelada',
  };
  return statusMap[status] || status;
};

const getConfirmacaoVariant = (confirmacao?: string): "default" | "destructive" | "secondary" => {
  switch (confirmacao) {
    case 'confirmada':
      return 'default';
    case 'rejeitada':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getConfirmacaoLabel = (confirmacao?: string): string => {
  const confirmacaoMap: Record<string, string> = {
    'confirmada': 'Confirmada',
    'rejeitada': 'Rejeitada',
    'pendente': 'Pendente',
  };
  return confirmacaoMap[confirmacao || 'pendente'] || 'Pendente';
};

export default function ReuniaoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const { data: reuniao, isLoading, error } = useReuniao(id!);
  const { data: convocacoes } = useConvocacoes(id);
  const { data: presencas } = usePresencas(id!);
  
  // Collect all conselheiro IDs from convocacoes and presencas
  const conselheiroIds = React.useMemo(() => {
    const ids = new Set<string>();
    convocacoes?.forEach(c => c.conselheiro_id && ids.add(c.conselheiro_id));
    presencas?.forEach(p => p.conselheiro_id && ids.add(p.conselheiro_id));
    return Array.from(ids);
  }, [convocacoes, presencas]);

  // Get conselheiro names for displaying in tables
  const { data: conselheirosNames = {} } = useConselheirosNames(conselheiroIds);
  
  const marcarPresencaMutation = useMarcarPresenca();
  const enviarConvocacoesMutation = useEnviarConvocacoes();
  const gerarProtocoloAtaMutation = useGerarProtocoloAta();
  const gerarProtocoloConvocacaoMutation = useGerarProtocoloConvocacao();

  // Compute values before early returns
  const isAdmin = profile?.role === 'admin' || profile?.role === 'presidente' || profile?.role === 'secretario';

  // Parse da pauta JSON
  const pautaData: PautaData | null = React.useMemo(() => {
    if (!reuniao?.pauta) return null;
    try {
      return JSON.parse(reuniao.pauta);
    } catch (error) {
      console.error('Erro ao fazer parse da pauta:', error);
      return null;
    }
  }, [reuniao?.pauta]);

  // Handlers (definidos antes de usar no useMemo abaixo)
  const handleMarcarPresenca = (conselheiro_id: string, presente: boolean) => {
    marcarPresencaMutation.mutate({
      reuniao_id: id!,
      conselheiro_id,
      presente,
      horario_chegada: presente ? new Date().toISOString() : undefined
    });
  };

  const handleGerarProtocoloAta = () => {
    gerarProtocoloAtaMutation.mutate(id!);
  };

  const handleGerarProtocoloConvocacao = () => {
    gerarProtocoloConvocacaoMutation.mutate(id!);
  };

  const handleEnviarConvocacoes = async () => {
    if (!reuniao) return;
    
    try {
      // Get all active conselheiros
      const { data: conselheiros, error } = await supabase
        .from('conselheiros')
        .select('profile_id')
        .eq('status', 'ativo');
      
      if (error) {
        throw new Error('Erro ao buscar conselheiros');
      }
      
      if (!conselheiros || conselheiros.length === 0) {
        toast({
          title: 'Nenhum conselheiro encontrado',
          description: 'Não há conselheiros ativos para enviar convocações',
          variant: 'destructive',
        });
        return;
      }
      
      const conselheiroIds = conselheiros.map(c => c.profile_id);
      
      await enviarConvocacoesMutation.mutateAsync({
        reuniao_id: id!,
        conselheiros_ids: conselheiroIds,
        tipo_envio: 'email'
      });
      
      toast({
        title: 'Convocações enviadas com sucesso',
        description: `${conselheiroIds.length} convocações foram enviadas por email`,
      });
    } catch (err: unknown) {
      console.error('Erro ao enviar convocações:', err);
      toast({
        title: 'Erro ao enviar convocações',
        description: (err as Error)?.message || 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    }
  };

  // Definir ações disponíveis
  const headerActions = React.useMemo(() => {
    if (!reuniao) return [];
    
    const actions = [];
    
    if (isAdmin) {
      actions.push({
        label: 'Gerar Ata',
        icon: <FileText className="h-4 w-4" />,
        onClick: handleGerarProtocoloAta,
        disabled: gerarProtocoloAtaMutation.isPending
      });
      
      actions.push({
        label: 'Gerar Convocação',
        icon: <Mail className="h-4 w-4" />,
        onClick: handleGerarProtocoloConvocacao,
        disabled: gerarProtocoloConvocacaoMutation.isPending
      });
      
      if (reuniao.status === 'agendada') {
        actions.push({
          label: 'Enviar Convocações',
          icon: <Mail className="h-4 w-4" />,
          onClick: handleEnviarConvocacoes,
          disabled: enviarConvocacoesMutation.isPending
        });
      }
    }
    
    return actions;
  }, [reuniao, isAdmin, gerarProtocoloAtaMutation.isPending, gerarProtocoloConvocacaoMutation.isPending, enviarConvocacoesMutation.isPending, handleGerarProtocoloAta, handleGerarProtocoloConvocacao, enviarConvocacoesMutation, id]);

  // States para loading
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
            Erro ao carregar reunião: {error.message}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/reunioes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Reuniões
        </Button>
      </div>
    );
  }

  if (!reuniao) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Reunião não encontrada.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/reunioes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Reuniões
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailPageHeader
        title={reuniao.titulo}
        backUrl="/reunioes"
        backLabel="Voltar para Reuniões"
        status={{
          label: getStatusLabel(reuniao.status),
          variant: getStatusVariant(reuniao.status)
        }}
        protocol={reuniao.protocolo}
        actions={headerActions}
      />

      {/* Informações da Reunião */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 h-5" />
            Informações da Reunião
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {reuniao.data_reuniao 
                  ? new Date(reuniao.data_reuniao).toLocaleString('pt-BR', { 
                      dateStyle: 'long', 
                      timeStyle: 'short' 
                    })
                  : 'Data não definida'
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{reuniao.local || 'Local não definido'}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>Tipo: {reuniao.tipo}</span>
            </div>
            {pautaData?.horario_inicio && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Início: {pautaData.horario_inicio}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pauta da Reunião */}
      {pautaData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 h-5" />
              Pauta da Reunião
            </CardTitle>
            {pautaData.tipo_reuniao && (
              <CardDescription>{pautaData.tipo_reuniao}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {pautaData.presenca_obrigatoria && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Presença obrigatória de todos os conselheiros
                </AlertDescription>
              </Alert>
            )}
            
            {pautaData.itens && pautaData.itens.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">Itens da Pauta:</h4>
                {pautaData.itens.map((item) => (
                  <div key={item.numero} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline">{item.numero}</Badge>
                      <div className="flex-1">
                        <h5 className="font-medium">{item.titulo}</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.descricao}
                        </p>
                        {item.detalhes && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {item.detalhes}
                          </p>
                        )}
                        <p className="text-xs font-medium mt-2">
                          Responsável: {item.responsavel}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pautaData.observacoes && pautaData.observacoes.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Observações:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {pautaData.observacoes.map((obs, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {obs}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Convocações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 h-5" />
              Convocações
            </CardTitle>
            {isAdmin && (
              <Button 
                size="sm" 
                onClick={handleEnviarConvocacoes}
                disabled={enviarConvocacoesMutation.isPending}
              >
                Enviar Convocações
              </Button>
            )}
          </div>
          <CardDescription>
            Status das convocações enviadas aos conselheiros
          </CardDescription>
        </CardHeader>
        <CardContent>
          {convocacoes && convocacoes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Conselheiro</TableHead>
                  <TableHead>Status Envio</TableHead>
                  <TableHead>Confirmação</TableHead>
                  <TableHead>Data Confirmação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {convocacoes.map((convocacao) => (
                  <TableRow key={convocacao.id}>
                    <TableCell>
                      {conselheirosNames[convocacao.conselheiro_id] || 'Carregando...'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={convocacao.status === 'enviada' ? 'default' : 'secondary'}>
                        {convocacao.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getConfirmacaoVariant(convocacao.confirmacao_presenca)}>
                        {getConfirmacaoLabel(convocacao.confirmacao_presenca)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {convocacao.data_confirmacao 
                        ? new Date(convocacao.data_confirmacao).toLocaleDateString('pt-BR')
                        : '-'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma convocação enviada</h3>
              <p className="text-muted-foreground mb-4">
                Envie convocações para os conselheiros participarem da reunião.
              </p>
              {isAdmin && (
                <Button 
                  onClick={handleEnviarConvocacoes}
                  disabled={enviarConvocacoesMutation.isPending}
                >
                  {enviarConvocacoesMutation.isPending ? 'Enviando...' : 'Enviar Convocações'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controle de Presença */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 h-5" />
            Controle de Presença
          </CardTitle>
          <CardDescription>
            Registre a presença dos conselheiros na reunião
          </CardDescription>
        </CardHeader>
        <CardContent>
          {presencas && presencas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Conselheiro</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Horário Chegada</TableHead>
                  {isAdmin && <TableHead>Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {presencas.map((presenca) => (
                  <TableRow key={presenca.id}>
                    <TableCell>
                      {conselheirosNames[presenca.conselheiro_id] || 'Carregando...'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={presenca.presente ? 'default' : 'destructive'}>
                        {presenca.presente ? 'Presente' : 'Ausente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {presenca.horario_chegada 
                        ? new Date(presenca.horario_chegada).toLocaleTimeString('pt-BR')
                        : '-'
                      }
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarcarPresenca(presenca.conselheiro_id, true)}
                            disabled={marcarPresencaMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarcarPresenca(presenca.conselheiro_id, false)}
                            disabled={marcarPresencaMutation.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma presença registrada</h3>
              <p className="text-muted-foreground">
                O controle de presença será iniciado quando a reunião começar.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações Administrativas */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Ações Administrativas</CardTitle>
            <CardDescription>
              Gerencie protocolos e status da reunião
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={handleGerarProtocoloConvocacao}
                disabled={gerarProtocoloConvocacaoMutation.isPending}
              >
                <FileText className="h-4 w-4 mr-2" />
                Gerar Protocolo Convocação
              </Button>
              <Button
                variant="outline"
                onClick={handleGerarProtocoloAta}
                disabled={gerarProtocoloAtaMutation.isPending}
              >
                <FileText className="h-4 w-4 mr-2" />
                Gerar Protocolo Ata
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/reunioes/nova?edit=${id}`)}
              >
                Editar Reunião
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}