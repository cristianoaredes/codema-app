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
  Calendar, 
  User, 
  AlertCircle,
  Clock,
  Users,
  Mail,
  Phone,
  MapPin,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  UserCheck,
  UserX,
  Building,
  Edit,
  Ban
} from "lucide-react";
import { DetailPageHeader } from "@/components/common/DetailPageHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Conselheiro {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  endereco: string | null;
  tipo: 'titular' | 'suplente';
  categoria: string;
  instituicao: string | null;
  data_posse: string;
  data_fim_mandato: string;
  situacao: 'ativo' | 'inativo' | 'licenciado' | 'afastado';
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

interface Presenca {
  id: string;
  reuniao_id: string;
  presente: boolean;
  justificativa: string | null;
  created_at: string;
  reuniao: {
    numero_reuniao: string;
    data_hora: string;
    tipo: string;
  };
}

interface Impedimento {
  id: string;
  tipo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string | null;
  ativo: boolean;
  created_at: string;
}

const getSituacaoVariant = (situacao: string): "default" | "destructive" | "secondary" | "outline" => {
  switch (situacao) {
    case 'ativo':
      return 'default';
    case 'inativo':
      return 'destructive';
    case 'licenciado':
      return 'secondary';
    case 'afastado':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getSituacaoLabel = (situacao: string): string => {
  const situacaoMap: Record<string, string> = {
    'ativo': 'Ativo',
    'inativo': 'Inativo',
    'licenciado': 'Licenciado',
    'afastado': 'Afastado',
  };
  return situacaoMap[situacao] || situacao;
};

const getTipoVariant = (tipo: string): "default" | "secondary" => {
  return tipo === 'titular' ? 'default' : 'secondary';
};

export default function ConselheiroDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const { data: conselheiro, isLoading, error } = useQuery({
    queryKey: ['conselheiro', id],
    queryFn: async (): Promise<Conselheiro> => {
      const { data, error } = await supabase
        .from('conselheiros')
        .select('*')
        .eq('id', id!)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: presencas = [] } = useQuery({
    queryKey: ['conselheiro-presencas', id],
    queryFn: async (): Promise<Presenca[]> => {
      const { data, error } = await supabase
        .from('presencas')
        .select(`
          *,
          reuniao:reunioes(numero_reuniao, data_hora, tipo)
        `)
        .eq('conselheiro_id', id!)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!id
  });

  const { data: impedimentos = [] } = useQuery({
    queryKey: ['conselheiro-impedimentos', id],
    queryFn: async (): Promise<Impedimento[]> => {
      const { data, error } = await supabase
        .from('impedimentos')
        .select('*')
        .eq('conselheiro_id', id!)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!id
  });

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
            Erro ao carregar conselheiro: {error.message}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/codema/conselheiros')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Conselheiros
        </Button>
      </div>
    );
  }

  if (!conselheiro) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Conselheiro não encontrado.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/codema/conselheiros')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Conselheiros
        </Button>
      </div>
    );
  }

  const canEdit = profile?.role && ['admin', 'secretario', 'presidente'].includes(profile.role);
  const isAdmin = profile?.role === 'admin';
  const diasParaFimMandato = differenceInDays(new Date(conselheiro.data_fim_mandato), new Date());
  const mandatoProximoVencimento = diasParaFimMandato <= 30 && diasParaFimMandato > 0;
  const mandatoVencido = diasParaFimMandato <= 0;

  // Calcular estatísticas de presença
  const totalReunioes = presencas.length;
  const presencasCount = presencas.filter(p => p.presente).length;
  const ausenciasCount = presencas.filter(p => !p.presente).length;
  const percentualPresenca = totalReunioes > 0 ? (presencasCount / totalReunioes) * 100 : 0;

  // Definir ações disponíveis
  const headerActions = [];
  
  if (isAdmin) {
    headerActions.push({
      label: 'Editar',
      icon: <Edit className="h-4 w-4" />,
      onClick: () => navigate(`/codema/conselheiros/${id}/editar`),
      variant: 'outline' as const
    });
    
    if (conselheiro.situacao === 'ativo') {
      headerActions.push({
        label: 'Criar Impedimento',
        icon: <Ban className="h-4 w-4" />,
        onClick: () => navigate(`/codema/conselheiros/${id}/impedimento`),
        variant: 'destructive' as const
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailPageHeader
        title={conselheiro.nome}
        subtitle={`Conselheiro #${conselheiro.id.slice(0, 8)}`}
        backUrl="/codema/conselheiros"
        backLabel="Voltar para Conselheiros"
        status={{
          label: getSituacaoLabel(conselheiro.situacao),
          variant: getSituacaoVariant(conselheiro.situacao)
        }}
        actions={headerActions}
      >
        {/* Type badge as additional content */}
        <Badge variant={getTipoVariant(conselheiro.tipo)}>
          {conselheiro.tipo === 'titular' ? 'Titular' : 'Suplente'}
        </Badge>
      </DetailPageHeader>

      {/* Alertas */}
      {mandatoVencido && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Mandato Vencido:</strong> O mandato deste conselheiro venceu em {format(new Date(conselheiro.data_fim_mandato), "dd/MM/yyyy", { locale: ptBR })}.
          </AlertDescription>
        </Alert>
      )}

      {mandatoProximoVencimento && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <strong>Mandato próximo ao vencimento:</strong> Faltam {diasParaFimMandato} dias para o fim do mandato ({format(new Date(conselheiro.data_fim_mandato), "dd/MM/yyyy", { locale: ptBR })}).
          </AlertDescription>
        </Alert>
      )}

      {percentualPresenca < 70 && totalReunioes >= 3 && (
        <Alert variant="destructive">
          <UserX className="h-4 w-4" />
          <AlertDescription>
            <strong>Baixo percentual de presença:</strong> O conselheiro possui apenas {percentualPresenca.toFixed(1)}% de presença nas reuniões.
          </AlertDescription>
        </Alert>
      )}

      {/* Informações Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{conselheiro.email}</span>
            </div>
            {conselheiro.telefone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{conselheiro.telefone}</span>
              </div>
            )}
            {conselheiro.endereco && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{conselheiro.endereco}</span>
              </div>
            )}
            {conselheiro.instituicao && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{conselheiro.instituicao}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações do Mandato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Informações do Mandato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Categoria</p>
              <p className="text-sm text-muted-foreground">{conselheiro.categoria}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Tipo</p>
              <p className="text-sm text-muted-foreground">
                {conselheiro.tipo === 'titular' ? 'Conselheiro Titular' : 'Conselheiro Suplente'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Data de Posse</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(conselheiro.data_posse), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Fim do Mandato</p>
                <p className={`text-sm ${mandatoVencido ? 'text-red-600' : mandatoProximoVencimento ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                  {format(new Date(conselheiro.data_fim_mandato), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>

          {conselheiro.observacoes && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Observações</p>
              <p className="text-sm text-muted-foreground">{conselheiro.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas de Participação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Participação em Reuniões
          </CardTitle>
          <CardDescription>
            Histórico de presença nas últimas reuniões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalReunioes}</div>
              <div className="text-sm text-blue-600">Total de Reuniões</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{presencasCount}</div>
              <div className="text-sm text-green-600">Presenças</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{ausenciasCount}</div>
              <div className="text-sm text-red-600">Ausências</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{percentualPresenca.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Percentual</div>
            </div>
          </div>

          {presencas.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Últimas Reuniões</h4>
              {presencas.slice(0, 5).map((presenca) => (
                <div key={presenca.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {presenca.presente ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <UserX className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{presenca.reuniao.numero_reuniao}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(presenca.reuniao.data_hora), "dd/MM/yyyy", { locale: ptBR })} - 
                        {presenca.reuniao.tipo === 'ordinaria' ? ' Ordinária' : ' Extraordinária'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={presenca.presente ? "default" : "destructive"}>
                    {presenca.presente ? "Presente" : "Ausente"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Impedimentos */}
      {impedimentos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Impedimentos
            </CardTitle>
            <CardDescription>
              Histórico de impedimentos do conselheiro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {impedimentos.map((impedimento) => (
                <div key={impedimento.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{impedimento.tipo}</p>
                    <Badge variant={impedimento.ativo ? "destructive" : "outline"}>
                      {impedimento.ativo ? "Ativo" : "Resolvido"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{impedimento.descricao}</p>
                  <div className="text-xs text-muted-foreground">
                    Início: {format(new Date(impedimento.data_inicio), "dd/MM/yyyy", { locale: ptBR })}
                    {impedimento.data_fim && (
                      <> - Fim: {format(new Date(impedimento.data_fim), "dd/MM/yyyy", { locale: ptBR })}</>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
            <CardDescription>
              Gerenciar conselheiro e mandato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/conselheiros/editar/${conselheiro.id}`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Dados
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate(`/impedimentos/novo?conselheiro=${conselheiro.id}`)}
              >
                <Ban className="h-4 w-4 mr-2" />
                Registrar Impedimento
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate(`/conselheiros/renovar/${conselheiro.id}`)}
              >
                <Shield className="h-4 w-4 mr-2" />
                Renovar Mandato
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate(`/relatorios/conselheiro/${conselheiro.id}`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Relatório
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}