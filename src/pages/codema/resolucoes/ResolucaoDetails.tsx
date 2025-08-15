import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  Gavel,
  FileText,
  Vote,
  CheckCircle,
  XCircle,
  Scale,
  Hash
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { logAction } from "@/utils/monitoring";
import { useToast } from "@/hooks/use-toast";

interface Resolucao {
  id: string;
  numero: string;
  titulo: string;
  ementa: string;
  texto_completo: string;
  status: 'em_elaboracao' | 'em_votacao' | 'aprovada' | 'rejeitada' | 'publicada';
  data_criacao: string;
  data_votacao: string | null;
  data_publicacao: string | null;
  votos_favor: number;
  votos_contra: number;
  abstencoes: number;
  quorum_minimo: number;
  created_at: string;
  updated_at: string;
  autor_id: string;
  reuniao_id: string | null;
  autor?: {
    full_name: string;
  };
  reuniao?: {
    numero_reuniao: string;
    data_hora: string;
  };
}

const getStatusVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
  switch (status) {
    case 'em_elaboracao':
      return 'outline';
    case 'em_votacao':
      return 'secondary';
    case 'aprovada':
      return 'default';
    case 'rejeitada':
      return 'destructive';
    case 'publicada':
      return 'default';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'em_elaboracao': 'Em Elaboração',
    'em_votacao': 'Em Votação',
    'aprovada': 'Aprovada',
    'rejeitada': 'Rejeitada',
    'publicada': 'Publicada',
  };
  return statusMap[status] || status;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'em_elaboracao':
      return <FileText className="h-3 w-3 mr-1" />;
    case 'em_votacao':
      return <Vote className="h-3 w-3 mr-1" />;
    case 'aprovada':
      return <CheckCircle className="h-3 w-3 mr-1" />;
    case 'rejeitada':
      return <XCircle className="h-3 w-3 mr-1" />;
    case 'publicada':
      return <Gavel className="h-3 w-3 mr-1" />;
    default:
      return null;
  }
};

export default function ResolucaoDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  const { data: resolucao, isLoading, error } = useQuery({
    queryKey: ['resolucao', id],
    queryFn: async (): Promise<Resolucao> => {
      const { data, error } = await supabase
        .from('resolucoes')
        .select(`
          *,
          autor:profiles!resolucoes_autor_id_fkey(full_name),
          reuniao:reunioes(numero_reuniao, data_hora)
        `)
        .eq('id', id!)
        .single();
      
      if (error) throw error;
      return data;
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
            Erro ao carregar resolução: {error.message}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/codema/resolucoes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Resoluções
        </Button>
      </div>
    );
  }

  if (!resolucao) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Resolução não encontrada.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/codema/resolucoes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Resoluções
        </Button>
      </div>
    );
  }

  const canEdit = profile?.role && ['admin', 'secretario', 'presidente'].includes(profile.role);
  const totalVotos = resolucao.votos_favor + resolucao.votos_contra + resolucao.abstencoes;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/codema/resolucoes')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">Resolução {resolucao.numero}</h1>
            <Badge variant={getStatusVariant(resolucao.status)}>
              {getStatusIcon(resolucao.status)}
              {getStatusLabel(resolucao.status)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Resolução #{resolucao.id.slice(0, 8)}
          </p>
        </div>
      </div>

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Informações da Resolução
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{resolucao.titulo}</h3>
            <p className="text-muted-foreground">{resolucao.ementa}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Número: {resolucao.numero}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Autor: {resolucao.autor?.full_name || 'Não informado'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Criada em: {format(new Date(resolucao.data_criacao), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>
            {resolucao.data_votacao && (
              <div className="flex items-center gap-2">
                <Vote className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Votada em: {format(new Date(resolucao.data_votacao), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            )}
            {resolucao.data_publicacao && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Publicada em: {format(new Date(resolucao.data_publicacao), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            )}
            {resolucao.reuniao && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Reunião: {resolucao.reuniao.numero_reuniao} - {format(new Date(resolucao.reuniao.data_hora), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultado da Votação */}
      {(resolucao.status === 'aprovada' || resolucao.status === 'rejeitada' || totalVotos > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Resultado da Votação
            </CardTitle>
            <CardDescription>
              Resumo dos votos e quorum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{resolucao.votos_favor}</div>
                <div className="text-sm text-green-600">Votos Favoráveis</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{resolucao.votos_contra}</div>
                <div className="text-sm text-red-600">Votos Contrários</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{resolucao.abstencoes}</div>
                <div className="text-sm text-gray-600">Abstenções</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{totalVotos}</div>
                <div className="text-sm text-blue-600">Total de Votos</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Quorum Mínimo Necessário:</span>
                <span className="font-medium">{resolucao.quorum_minimo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Quorum Atingido:</span>
                <span className={`font-medium ${totalVotos >= resolucao.quorum_minimo ? 'text-green-600' : 'text-red-600'}`}>
                  {totalVotos >= resolucao.quorum_minimo ? 'Sim' : 'Não'}
                </span>
              </div>
              {totalVotos > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Percentual de Aprovação:</span>
                  <span className="font-medium">
                    {((resolucao.votos_favor / totalVotos) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Texto Completo */}
      <Card>
        <CardHeader>
          <CardTitle>Texto Completo da Resolução</CardTitle>
          <CardDescription>
            Conteúdo integral da resolução
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-foreground">
              {resolucao.texto_completo}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
            <CardDescription>
              Gerenciar resolução e status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {resolucao.status === 'em_elaboracao' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/resolucoes/editar/${resolucao.id}`)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const { error } = await supabase
                          .from('resolucoes')
                          .update({ 
                            status: 'em_votacao',
                            data_envio_votacao: new Date().toISOString()
                          })
                          .eq('id', resolucao.id);
                        
                        if (error) throw error;
                        
                        toast.success('Resolução enviada para votação!');
                        // Refresh data
                        window.location.reload();
                      } catch (error) {
                        console.error('Erro ao enviar para votação:', error);
                        toast.error('Erro ao enviar resolução para votação');
                      }
                    }}
                  >
                    <Vote className="h-4 w-4 mr-2" />
                    Enviar para Votação
                  </Button>
                </>
              )}

              {resolucao.status === 'em_votacao' && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/resolucoes/votacao/${resolucao.id}`)}
                >
                  <Scale className="h-4 w-4 mr-2" />
                  Registrar Votação
                </Button>
              )}

              {resolucao.status === 'aprovada' && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('resolucoes')
                        .update({ status: 'publicada', data_publicacao: new Date().toISOString(), updated_by: profile?.id })
                        .eq('id', resolucao.id);
                      if (error) throw error;
                      await logAction('publicar_resolucao', 'resolucoes', resolucao.id, { numero: resolucao.numero });
                      toast({ title: 'Resolução publicada', description: 'A resolução foi publicada com sucesso.' });
                    } catch (err: any) {
                      toast({ title: 'Erro ao publicar', description: err?.message || 'Tente novamente.', variant: 'destructive' });
                    }
                  }}
                >
                  <Gavel className="h-4 w-4 mr-2" />
                  Publicar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}