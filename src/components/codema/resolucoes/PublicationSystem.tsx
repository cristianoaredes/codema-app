import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Globe, Calendar, Upload, Download, CheckCircle, AlertCircle, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logAction } from "@/utils/monitoring";

interface Resolucao {
  id: string;
  numero: string;
  titulo: string;
  conteudo: string;
  status: string;
  data_aprovacao?: string;
  tipo: string;
  [key: string]: unknown;
}

interface PublicationSystemProps {
  resolucaoId: string;
  resolucao: Resolucao;
}

interface Publicacao {
  id: string;
  veiculo_publicacao: string;
  data_publicacao: string;
  pagina: string;
  edicao: string;
  url_publicacao: string;
  publicado_por: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

export function PublicationSystem({ resolucaoId, resolucao }: PublicationSystemProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [novaPublicacao, setNovaPublicacao] = useState({
    veiculo_publicacao: 'portal_oficial',
    data_publicacao: format(new Date(), 'yyyy-MM-dd'),
    pagina: '',
    edicao: '',
    url_publicacao: '',
  });

  const canPublish = profile?.role && ['admin', 'secretario'].includes(profile.role);
  const isApproved = resolucao?.status === 'aprovada';

  // Buscar publicações existentes
  const { data: publicacoes = [] } = useQuery({
    queryKey: ['resolucao-publicacoes', resolucaoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resolucoes_publicacao')
        .select(`
          *,
          profiles:publicado_por(full_name)
        `)
        .eq('resolucao_id', resolucaoId)
        .order('data_publicacao', { ascending: false });

      if (error) throw error;
      return data as Publicacao[];
    },
  });

  // Publicar resolução
  const publicarMutation = useMutation({
    mutationFn: async () => {
      // 1. Registrar publicação
      const { data: publicacao, error: pubError } = await supabase
        .from('resolucoes_publicacao')
        .insert({
          resolucao_id: resolucaoId,
          ...novaPublicacao,
          publicado_por: profile?.id,
        })
        .select()
        .single();

      if (pubError) throw pubError;

      // 2. Atualizar status da resolução para publicada
      const { error: resError } = await supabase
        .from('resolucoes')
        .update({ 
          status: 'publicada',
          data_publicacao: novaPublicacao.data_publicacao,
          updated_by: profile?.id 
        })
        .eq('id', resolucaoId);

      if (resError) throw resError;

      // 3. Log da ação
      await logAction(
        'publicar_resolucao',
        'resolucoes',
        resolucaoId,
        { 
          numero: resolucao.numero,
          veiculo: novaPublicacao.veiculo_publicacao,
          data_publicacao: novaPublicacao.data_publicacao
        }
      );

      return publicacao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resolucao', resolucaoId] });
      queryClient.invalidateQueries({ queryKey: ['resolucoes'] });
      queryClient.invalidateQueries({ queryKey: ['resolucao-publicacoes', resolucaoId] });
      
      toast({
        title: "Sucesso",
        description: "Resolução publicada com sucesso",
      });

      // Reset form
      setNovaPublicacao({
        veiculo_publicacao: 'portal_oficial',
        data_publicacao: format(new Date(), 'yyyy-MM-dd'),
        pagina: '',
        edicao: '',
        url_publicacao: '',
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao publicar resolução: " + error.message,
        variant: "destructive",
      });
    },
  });

  const getVeiculoLabel = (veiculo: string) => {
    const veiculos: Record<string, string> = {
      portal_oficial: 'Portal Oficial',
      diario_oficial: 'Diário Oficial',
      jornal_local: 'Jornal Local',
      site_prefeitura: 'Site da Prefeitura',
    };
    return veiculos[veiculo] || veiculo;
  };

  const getVeiculoBadge = (veiculo: string) => {
    switch (veiculo) {
      case 'portal_oficial':
        return <Badge variant="default" className="bg-blue-600">Portal Oficial</Badge>;
      case 'diario_oficial':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Diário Oficial</Badge>;
      case 'jornal_local':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Jornal Local</Badge>;
      case 'site_prefeitura':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700">Site Prefeitura</Badge>;
      default:
        return <Badge variant="outline">{veiculo}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Sistema de Publicação
        </h3>
        <p className="text-sm text-muted-foreground">
          Controle de publicação oficial da resolução {resolucao?.numero}
        </p>
      </div>

      {/* Status da Resolução */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Status:</strong> {resolucao?.status}
          {!isApproved && (
            <span className="text-orange-600 ml-2">
              A resolução precisa estar aprovada para ser publicada
            </span>
          )}
          {isApproved && publicacoes.length === 0 && (
            <span className="text-green-600 ml-2">
              Resolução pronta para publicação
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Nova Publicação */}
      {canPublish && isApproved && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Publicação</CardTitle>
            <CardDescription>
              Registrar publicação da resolução em veículo oficial
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Veículo de Publicação</Label>
                <Select 
                  value={novaPublicacao.veiculo_publicacao} 
                  onValueChange={(value) => setNovaPublicacao({...novaPublicacao, veiculo_publicacao: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portal_oficial">Portal Oficial</SelectItem>
                    <SelectItem value="diario_oficial">Diário Oficial</SelectItem>
                    <SelectItem value="jornal_local">Jornal Local</SelectItem>
                    <SelectItem value="site_prefeitura">Site da Prefeitura</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Data de Publicação</Label>
                <Input
                  type="date"
                  value={novaPublicacao.data_publicacao}
                  onChange={(e) => setNovaPublicacao({...novaPublicacao, data_publicacao: e.target.value})}
                />
              </div>

              {novaPublicacao.veiculo_publicacao === 'diario_oficial' && (
                <>
                  <div>
                    <Label>Página</Label>
                    <Input
                      value={novaPublicacao.pagina}
                      onChange={(e) => setNovaPublicacao({...novaPublicacao, pagina: e.target.value})}
                      placeholder="Ex: 15"
                    />
                  </div>
                  <div>
                    <Label>Edição</Label>
                    <Input
                      value={novaPublicacao.edicao}
                      onChange={(e) => setNovaPublicacao({...novaPublicacao, edicao: e.target.value})}
                      placeholder="Ex: Nº 1234"
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <Label>URL da Publicação (Opcional)</Label>
                <Input
                  value={novaPublicacao.url_publicacao}
                  onChange={(e) => setNovaPublicacao({...novaPublicacao, url_publicacao: e.target.value})}
                  placeholder="https://..."
                />
              </div>
            </div>

            <Button
              onClick={() => publicarMutation.mutate()}
              disabled={publicarMutation.isPending}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {publicarMutation.isPending ? "Publicando..." : "Registrar Publicação"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lista de Publicações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Publicações</CardTitle>
          <CardDescription>
            Registro de todas as publicações desta resolução
          </CardDescription>
        </CardHeader>
        <CardContent>
          {publicacoes.length > 0 ? (
            <div className="space-y-4">
              {publicacoes.map((publicacao) => (
                <div key={publicacao.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getVeiculoBadge(publicacao.veiculo_publicacao)}
                      <div className="text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {format(new Date(publicacao.data_publicacao), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {publicacao.url_publicacao && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={publicacao.url_publicacao} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  {(publicacao.pagina || publicacao.edicao) && (
                    <div className="text-sm text-muted-foreground">
                      {publicacao.edicao && <span>Edição: {publicacao.edicao}</span>}
                      {publicacao.pagina && publicacao.edicao && <span> • </span>}
                      {publicacao.pagina && <span>Página: {publicacao.pagina}</span>}
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    Publicado por: {publicacao.profiles?.full_name} em{' '}
                    {format(new Date(publicacao.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>

                  {publicacao.url_publicacao && (
                    <div className="text-sm">
                      <strong>URL:</strong>{' '}
                      <a 
                        href={publicacao.url_publicacao} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {publicacao.url_publicacao}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Globe className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500">Nenhuma publicação registrada</p>
              <p className="text-sm text-gray-400">
                {!isApproved 
                  ? "A resolução precisa ser aprovada antes da publicação"
                  : canPublish 
                    ? "Registre a primeira publicação desta resolução"
                    : "Aguardando publicação pela secretaria"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portal da Transparência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Portal da Transparência
          </CardTitle>
          <CardDescription>
            Disponibilização automática para consulta pública
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resolucao?.status === 'publicada' ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Esta resolução está disponível publicamente no Portal da Transparência.
                <br />
                <a 
                  href={`/transparencia/codema/resolucoes/${resolucao.numero}`}
                  className="text-blue-600 hover:underline mt-2 inline-block"
                  target="_blank"
                >
                  Ver no Portal da Transparência →
                </a>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                A resolução será automaticamente disponibilizada no Portal da Transparência 
                após ser publicada oficialmente.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Informações Legais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Legais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• As resoluções devem ser publicadas em veículo oficial conforme Lei de Acesso à Informação</p>
          <p>• O prazo de vigência inicia-se na data de publicação, salvo disposição em contrário</p>
          <p>• A publicação no Portal da Transparência é obrigatória para todos os atos normativos</p>
          <p>• Resoluções normativas requerem publicação em Diário Oficial</p>
        </CardContent>
      </Card>
    </div>
  );
}