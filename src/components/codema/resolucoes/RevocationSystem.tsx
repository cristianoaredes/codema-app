import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, Search, FileX, Calendar, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logAction } from "@/utils/monitoring";

interface RevocationSystemProps {
  resolucaoId: string;
  resolucao: {
    id: string;
    numero: string;
    titulo: string;
    conteudo: unknown;
    status: string;
  };
}

interface Revogacao {
  id: string;
  resolucao_original_id: string;
  resolucao_revogadora_id: string;
  tipo_revogacao: string;
  artigos_revogados: string[];
  motivo: string;
  data_revogacao: string;
  created_at: string;
  created_by: string;
  resolucao_original: {
    numero: string;
    titulo: string;
  };
  resolucao_revogadora: {
    numero: string;
    titulo: string;
  };
  profiles: {
    full_name: string;
  };
}

export function RevocationSystem({ resolucaoId, resolucao }: RevocationSystemProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showRevogacao, setShowRevogacao] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [revogacao, setRevogacao] = useState({
    resolucao_revogadora_id: '',
    tipo_revogacao: 'total',
    artigos_revogados: [] as string[],
    motivo: '',
    data_revogacao: format(new Date(), 'yyyy-MM-dd'),
  });

  const canRevoke = profile?.role && ['admin', 'secretario', 'presidente'].includes(profile.role);
  const isPublished = resolucao?.status === 'publicada';
  const isRevoked = resolucao?.status === 'revogada';

  // Buscar resoluções para revogar esta
  const { data: resolucoesRevogaroras = [] } = useQuery({
    queryKey: ['resolucoes-revogadoras', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('resolucoes')
        .select('id, numero, titulo, status')
        .neq('id', resolucaoId)
        .in('status', ['aprovada', 'publicada'])
        .order('numero', { ascending: false });

      if (searchTerm) {
        query = query.or(`numero.ilike.%${searchTerm}%,titulo.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(10);
      if (error) throw error;
      return data;
    },
    enabled: showRevogacao,
  });

  // Buscar revogações desta resolução
  const { data: revogacoes = [] } = useQuery({
    queryKey: ['resolucao-revogacoes', resolucaoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resolucoes_revogacoes')
        .select(`
          *,
          resolucao_original:resolucao_original_id(numero, titulo),
          resolucao_revogadora:resolucao_revogadora_id(numero, titulo)
        `)
        .eq('resolucao_original_id', resolucaoId)
        .order('data_revogacao', { ascending: false });

      if (error) throw error;
      return data as Revogacao[];
    },
  });

  // Buscar revogações feitas por esta resolução
  const { data: revogacoesFeitasPor = [] } = useQuery({
    queryKey: ['revogacoes-feitas-por', resolucaoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resolucoes_revogacoes')
        .select(`
          *,
          resolucao_original:resolucao_original_id(numero, titulo),
          resolucao_revogadora:resolucao_revogadora_id(numero, titulo)
        `)
        .eq('resolucao_revogadora_id', resolucaoId)
        .order('data_revogacao', { ascending: false });

      if (error) throw error;
      return data as Revogacao[];
    },
  });

  // Revogar resolução
  const revogarMutation = useMutation({
    mutationFn: async () => {
      // 1. Registrar revogação
      const { data: revogacaoData, error: revError } = await supabase
        .from('resolucoes_revogacoes')
        .insert({
          resolucao_original_id: resolucaoId,
          resolucao_revogadora_id: revogacao.resolucao_revogadora_id,
          tipo_revogacao: revogacao.tipo_revogacao,
          artigos_revogados: revogacao.tipo_revogacao === 'parcial' ? revogacao.artigos_revogados : null,
          motivo: revogacao.motivo,
          data_revogacao: revogacao.data_revogacao,
          created_by: profile?.id,
        })
        .select()
        .single();

      if (revError) throw revError;

      // 2. Atualizar status da resolução para revogada (se revogação total)
      if (revogacao.tipo_revogacao === 'total') {
        const { error: resError } = await supabase
          .from('resolucoes')
          .update({ 
            status: 'revogada',
            data_revogacao: revogacao.data_revogacao,
            revogada_por: revogacao.resolucao_revogadora_id,
            motivo_revogacao: revogacao.motivo,
            updated_by: profile?.id 
          })
          .eq('id', resolucaoId);

        if (resError) throw resError;
      }

      // 3. Log da ação
      await logAction(
        'revogar_resolucao',
        'resolucoes_revogacoes',
        revogacaoData.id,
        { 
          resolucao_original: resolucao.numero,
          tipo_revogacao: revogacao.tipo_revogacao,
          data_revogacao: revogacao.data_revogacao
        }
      );

      return revogacaoData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resolucao', resolucaoId] });
      queryClient.invalidateQueries({ queryKey: ['resolucoes'] });
      queryClient.invalidateQueries({ queryKey: ['resolucao-revogacoes', resolucaoId] });
      
      toast({
        title: "Sucesso",
        description: "Revogação registrada com sucesso",
      });

      setShowRevogacao(false);
      // Reset form
      setRevogacao({
        resolucao_revogadora_id: '',
        tipo_revogacao: 'total',
        artigos_revogados: [],
        motivo: '',
        data_revogacao: format(new Date(), 'yyyy-MM-dd'),
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao registrar revogação: " + error.message,
        variant: "destructive",
      });
    },
  });

  const adicionarArtigo = () => {
    setRevogacao({
      ...revogacao,
      artigos_revogados: [...revogacao.artigos_revogados, '']
    });
  };

  const removerArtigo = (index: number) => {
    setRevogacao({
      ...revogacao,
      artigos_revogados: revogacao.artigos_revogados.filter((_, i) => i !== index)
    });
  };

  const atualizarArtigo = (index: number, valor: string) => {
    const novosArtigos = [...revogacao.artigos_revogados];
    novosArtigos[index] = valor;
    setRevogacao({
      ...revogacao,
      artigos_revogados: novosArtigos
    });
  };

  const getTipoRevogacaoBadge = (tipo: string) => {
    switch (tipo) {
      case 'total':
        return <Badge variant="destructive">Revogação Total</Badge>;
      case 'parcial':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700">Revogação Parcial</Badge>;
      default:
        return <Badge variant="outline">{tipo}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <FileX className="w-5 h-5" />
            Sistema de Revogação
          </h3>
          <p className="text-sm text-muted-foreground">
            Controle de revogações da resolução {resolucao?.numero}
          </p>
        </div>

        {canRevoke && isPublished && !isRevoked && (
          <Dialog open={showRevogacao} onOpenChange={setShowRevogacao}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <FileX className="w-4 h-4 mr-2" />
                Revogar Resolução
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Revogar Resolução {resolucao?.numero}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Atenção:</strong> A revogação é um ato irreversível que afeta a vigência da resolução.
                  </AlertDescription>
                </Alert>

                <div>
                  <Label>Buscar Resolução Revogadora</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite número ou título da resolução..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="outline" size="icon">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {searchTerm && (
                  <div>
                    <Label>Resolução que revoga</Label>
                    <Select 
                      value={revogacao.resolucao_revogadora_id} 
                      onValueChange={(value) => setRevogacao({...revogacao, resolucao_revogadora_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a resolução revogadora" />
                      </SelectTrigger>
                      <SelectContent>
                        {resolucoesRevogaroras.map((res) => (
                          <SelectItem key={res.id} value={res.id}>
                            {res.numero} - {res.titulo.substring(0, 60)}...
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Revogação</Label>
                    <Select 
                      value={revogacao.tipo_revogacao} 
                      onValueChange={(value) => setRevogacao({...revogacao, tipo_revogacao: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="total">Revogação Total</SelectItem>
                        <SelectItem value="parcial">Revogação Parcial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Data da Revogação</Label>
                    <Input
                      type="date"
                      value={revogacao.data_revogacao}
                      onChange={(e) => setRevogacao({...revogacao, data_revogacao: e.target.value})}
                    />
                  </div>
                </div>

                {revogacao.tipo_revogacao === 'parcial' && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Artigos Revogados</Label>
                      <Button type="button" variant="outline" size="sm" onClick={adicionarArtigo}>
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {revogacao.artigos_revogados.map((artigo, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={artigo}
                            onChange={(e) => atualizarArtigo(index, e.target.value)}
                            placeholder="Ex: Art. 5º, § 2º"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon"
                            onClick={() => removerArtigo(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label>Motivo da Revogação</Label>
                  <Textarea
                    value={revogacao.motivo}
                    onChange={(e) => setRevogacao({...revogacao, motivo: e.target.value})}
                    placeholder="Descreva o motivo que justifica a revogação..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowRevogacao(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => revogarMutation.mutate()}
                    disabled={
                      revogarMutation.isPending || 
                      !revogacao.resolucao_revogadora_id || 
                      !revogacao.motivo.trim() ||
                      (revogacao.tipo_revogacao === 'parcial' && revogacao.artigos_revogados.length === 0)
                    }
                    variant="destructive"
                  >
                    <FileX className="w-4 h-4 mr-2" />
                    {revogarMutation.isPending ? "Revogando..." : "Confirmar Revogação"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Status da Resolução */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Status:</strong> {resolucao?.status}
          {!isPublished && !isRevoked && (
            <span className="text-orange-600 ml-2">
              Apenas resoluções publicadas podem ser revogadas
            </span>
          )}
          {isRevoked && (
            <span className="text-red-600 ml-2">
              Esta resolução foi revogada em {resolucao.data_revogacao && format(new Date(resolucao.data_revogacao), "dd/MM/yyyy", { locale: ptBR })}
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Revogações desta Resolução */}
      <Card>
        <CardHeader>
          <CardTitle>Revogações Recebidas</CardTitle>
          <CardDescription>
            Registros de revogação desta resolução
          </CardDescription>
        </CardHeader>
        <CardContent>
          {revogacoes.length > 0 ? (
            <div className="space-y-4">
              {revogacoes.map((revogacaoItem) => (
                <div key={revogacaoItem.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTipoRevogacaoBadge(revogacaoItem.tipo_revogacao)}
                      <div className="text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {format(new Date(revogacaoItem.data_revogacao), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium">
                      Revogada por: {revogacaoItem.resolucao_revogadora?.numero}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {revogacaoItem.resolucao_revogadora?.titulo}
                    </p>
                  </div>

                  {revogacaoItem.tipo_revogacao === 'parcial' && revogacaoItem.artigos_revogados && (
                    <div>
                      <p className="text-sm font-medium">Artigos revogados:</p>
                      <p className="text-sm text-muted-foreground">
                        {revogacaoItem.artigos_revogados.join(', ')}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium">Motivo:</p>
                    <p className="text-sm text-muted-foreground">{revogacaoItem.motivo}</p>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Registrado por: {revogacaoItem.profiles?.full_name} em{' '}
                    {format(new Date(revogacaoItem.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileX className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500">Nenhuma revogação registrada</p>
              <p className="text-sm text-gray-400">
                Esta resolução permanece em vigor
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revogações Feitas por esta Resolução */}
      {revogacoesFeitasPor.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revogações Realizadas</CardTitle>
            <CardDescription>
              Resoluções revogadas por esta resolução
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revogacoesFeitasPor.map((revogacaoItem) => (
                <div key={revogacaoItem.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTipoRevogacaoBadge(revogacaoItem.tipo_revogacao)}
                      <div className="text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {format(new Date(revogacaoItem.data_revogacao), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium">
                      Revogou: {revogacaoItem.resolucao_original?.numero}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {revogacaoItem.resolucao_original?.titulo}
                    </p>
                  </div>

                  {revogacaoItem.tipo_revogacao === 'parcial' && revogacaoItem.artigos_revogados && (
                    <div>
                      <p className="text-sm font-medium">Artigos revogados:</p>
                      <p className="text-sm text-muted-foreground">
                        {revogacaoItem.artigos_revogados.join(', ')}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium">Motivo:</p>
                    <p className="text-sm text-muted-foreground">{revogacaoItem.motivo}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações Legais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações sobre Revogação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>Revogação Total:</strong> A resolução perde completamente sua vigência</p>
          <p>• <strong>Revogação Parcial:</strong> Apenas dispositivos específicos são revogados</p>
          <p>• A revogação deve ser expressa e fundamentada</p>
          <p>• A data de revogação marca o fim da vigência dos dispositivos revogados</p>
          <p>• Resoluções revogadas devem ser mantidas no arquivo para consulta histórica</p>
        </CardContent>
      </Card>
    </div>
  );
}