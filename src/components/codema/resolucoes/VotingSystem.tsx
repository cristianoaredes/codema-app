import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Vote, Check, X, Minus, AlertTriangle, Users, Clock, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logAction } from "@/utils/monitoring";

interface VotingSystemProps {
  resolucaoId: string;
  canVote: boolean;
  onClose: () => void;
}

interface Voto {
  id: string;
  conselheiro_id: string;
  voto: string;
  justificativa: string;
  impedimento: boolean;
  motivo_impedimento: string;
  data_voto: string;
  conselheiros: {
    nome: string;
    cargo: string;
    tipo: string;
  };
}

interface Conselheiro {
  id: string;
  nome: string;
  cargo: string;
  tipo: string;
  ativo: boolean;
}

export function VotingSystem({ resolucaoId, canVote, onClose }: VotingSystemProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [meuVoto, setMeuVoto] = useState<string>('');
  const [justificativa, setJustificativa] = useState<string>('');
  const [impedimento, setImpedimento] = useState<boolean>(false);
  const [motivoImpedimento, setMotivoImpedimento] = useState<string>('');
  const [votacaoIniciada, setVotacaoIniciada] = useState<boolean>(false);

  // Buscar dados da resolução
  const { data: resolucao } = useQuery({
    queryKey: ['resolucao', resolucaoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resolucoes')
        .select('*')
        .eq('id', resolucaoId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Buscar conselheiros ativos
  const { data: conselheiros = [] } = useQuery({
    queryKey: ['conselheiros-votacao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conselheiros')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      return data as Conselheiro[];
    },
  });

  // Buscar votos já registrados
  const { data: votos = [], refetch: refetchVotos } = useQuery({
    queryKey: ['resolucao-votos', resolucaoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resolucoes_votos')
        .select(`
          *,
          conselheiros(nome, cargo, tipo)
        `)
        .eq('resolucao_id', resolucaoId)
        .order('data_voto');

      if (error) throw error;
      return data as Voto[];
    },
  });

  // Buscar meu conselheiro (se aplicável)
  const { data: meuConselheiro } = useQuery({
    queryKey: ['meu-conselheiro'],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const { data, error } = await supabase
        .from('conselheiros')
        .select('*')
        .eq('user_id', profile.id)
        .eq('ativo', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!profile?.id && canVote,
  });

  // Verificar se já votei
  const meuVotoExistente = votos.find(v => v.conselheiro_id === meuConselheiro?.id);

  // Iniciar votação
  const iniciarVotacaoMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('resolucoes')
        .update({ 
          status: 'em_votacao',
          updated_by: profile?.id 
        })
        .eq('id', resolucaoId)
        .select()
        .single();

      if (error) throw error;

      await logAction(
        'iniciar_votacao_resolucao',
        'resolucoes',
        resolucaoId,
        { numero: resolucao?.numero }
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resolucao', resolucaoId] });
      queryClient.invalidateQueries({ queryKey: ['resolucoes'] });
      setVotacaoIniciada(true);
      toast({
        title: "Sucesso",
        description: "Votação iniciada com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao iniciar votação: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Registrar voto
  const votarMutation = useMutation({
    mutationFn: async () => {
      if (!meuConselheiro) throw new Error('Conselheiro não encontrado');

      const votoData = {
        resolucao_id: resolucaoId,
        conselheiro_id: meuConselheiro.id,
        voto: impedimento ? 'impedimento' : meuVoto,
        justificativa: justificativa || null,
        impedimento,
        motivo_impedimento: impedimento ? motivoImpedimento : null,
      };

      const { data, error } = await supabase
        .from('resolucoes_votos')
        .upsert(votoData, {
          onConflict: 'resolucao_id,conselheiro_id'
        })
        .select()
        .single();

      if (error) throw error;

      await logAction(
        'votar_resolucao',
        'resolucoes_votos',
        data.id,
        { 
          resolucao_numero: resolucao?.numero,
          voto: votoData.voto,
          conselheiro: meuConselheiro.nome
        }
      );

      return data;
    },
    onSuccess: () => {
      refetchVotos();
      toast({
        title: "Sucesso",
        description: "Voto registrado com sucesso",
      });
      
      // Limpar formulário
      setMeuVoto('');
      setJustificativa('');
      setImpedimento(false);
      setMotivoImpedimento('');
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao registrar voto: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Encerrar votação e calcular resultado
  const encerrarVotacaoMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('calcular_resultado_votacao', {
        resolucao_uuid: resolucaoId
      });

      if (error) throw error;

      await logAction(
        'encerrar_votacao_resolucao',
        'resolucoes',
        resolucaoId,
        { 
          numero: resolucao?.numero,
          resultado: data
        }
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resolucao', resolucaoId] });
      queryClient.invalidateQueries({ queryKey: ['resolucoes'] });
      toast({
        title: "Sucesso",
        description: "Votação encerrada e resultado calculado",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao encerrar votação: " + error.message,
        variant: "destructive",
      });
    },
  });

  const canStartVoting = profile?.role && ['admin', 'secretario', 'presidente'].includes(profile.role);
  const canEndVoting = canStartVoting && resolucao?.status === 'em_votacao';

  // Calcular estatísticas
  const totalConselheiros = conselheiros.length;
  const votosComputados = votos.filter(v => !v.impedimento);
  const votosFavor = votos.filter(v => v.voto === 'favor').length;
  const votosContra = votos.filter(v => v.voto === 'contra').length;
  const abstencoes = votos.filter(v => v.voto === 'abstencao').length;
  const impedimentos = votos.filter(v => v.impedimento).length;
  const ausentes = totalConselheiros - votos.length;
  const quorumNecessario = Math.floor(totalConselheiros / 2) + 1;
  const quorumPresente = votosComputados.length;
  const quorumAtingido = quorumPresente >= quorumNecessario;

  const porcentagemVotacao = totalConselheiros > 0 ? (votos.length / totalConselheiros) * 100 : 0;

  const getVotoBadge = (voto: string, impedimento: boolean) => {
    if (impedimento) {
      return <Badge variant="outline" className="bg-orange-50 text-orange-700">Impedimento</Badge>;
    }
    
    switch (voto) {
      case 'favor':
        return <Badge variant="outline" className="bg-green-50 text-green-700">A Favor</Badge>;
      case 'contra':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Contra</Badge>;
      case 'abstencao':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700">Abstenção</Badge>;
      default:
        return <Badge variant="outline">Ausente</Badge>;
    }
  };

  if (!resolucao) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Votação: {resolucao.numero}</h3>
        <p className="text-sm text-muted-foreground">{resolucao.titulo}</p>
        <Badge variant={resolucao.status === 'em_votacao' ? 'default' : 'outline'}>
          {resolucao.status === 'em_votacao' ? 'Votação Aberta' : 'Votação Não Iniciada'}
        </Badge>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="w-5 h-5" />
            Progresso da Votação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Participação</span>
              <span>{votos.length} de {totalConselheiros} conselheiros</span>
            </div>
            <Progress value={porcentagemVotacao} className="w-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{votosFavor}</div>
              <div className="text-sm text-green-600">A Favor</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{votosContra}</div>
              <div className="text-sm text-red-600">Contra</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">{abstencoes}</div>
              <div className="text-sm text-gray-600">Abstenções</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">{impedimentos}</div>
              <div className="text-sm text-orange-600">Impedimentos</div>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Quorum:</strong> {quorumPresente} presentes de {quorumNecessario} necessários
              {quorumAtingido ? (
                <span className="text-green-600 ml-2">✓ Quorum atingido</span>
              ) : (
                <span className="text-red-600 ml-2">✗ Quorum insuficiente</span>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Controles de Votação */}
      {canStartVoting && (
        <Card>
          <CardHeader>
            <CardTitle>Controle de Votação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resolucao.status === 'minuta' && (
              <Button 
                onClick={() => iniciarVotacaoMutation.mutate()}
                disabled={iniciarVotacaoMutation.isPending}
                className="w-full"
              >
                <Vote className="w-4 h-4 mr-2" />
                {iniciarVotacaoMutation.isPending ? "Iniciando..." : "Iniciar Votação"}
              </Button>
            )}

            {canEndVoting && (
              <Button 
                onClick={() => encerrarVotacaoMutation.mutate()}
                disabled={encerrarVotacaoMutation.isPending}
                variant="destructive"
                className="w-full"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {encerrarVotacaoMutation.isPending ? "Encerrando..." : "Encerrar Votação"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Meu Voto */}
      {canVote && meuConselheiro && resolucao.status === 'em_votacao' && (
        <Card>
          <CardHeader>
            <CardTitle>Meu Voto</CardTitle>
            <CardDescription>
              Votando como: {meuConselheiro.nome} - {meuConselheiro.cargo}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {meuVotoExistente ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Você já votou: <strong>{getVotoBadge(meuVotoExistente.voto, meuVotoExistente.impedimento)}</strong>
                  {meuVotoExistente.justificativa && (
                    <div className="mt-2 text-sm">
                      <strong>Justificativa:</strong> {meuVotoExistente.justificativa}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {/* Declaração de Impedimento */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="impedimento"
                    checked={impedimento}
                    onChange={(e) => setImpedimento(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="impedimento">Declaro impedimento para votar</Label>
                </div>

                {impedimento ? (
                  <div>
                    <Label>Motivo do Impedimento</Label>
                    <Textarea
                      value={motivoImpedimento}
                      onChange={(e) => setMotivoImpedimento(e.target.value)}
                      placeholder="Descreva o motivo do impedimento..."
                      className="min-h-[80px]"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label>Seu Voto</Label>
                      <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          variant={meuVoto === 'favor' ? 'default' : 'outline'}
                          onClick={() => setMeuVoto('favor')}
                          className="flex-1"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          A Favor
                        </Button>
                        <Button
                          type="button"
                          variant={meuVoto === 'contra' ? 'destructive' : 'outline'}
                          onClick={() => setMeuVoto('contra')}
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Contra
                        </Button>
                        <Button
                          type="button"
                          variant={meuVoto === 'abstencao' ? 'secondary' : 'outline'}
                          onClick={() => setMeuVoto('abstencao')}
                          className="flex-1"
                        >
                          <Minus className="w-4 h-4 mr-2" />
                          Abstenção
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Justificativa (Opcional)</Label>
                      <Textarea
                        value={justificativa}
                        onChange={(e) => setJustificativa(e.target.value)}
                        placeholder="Justifique seu voto (especialmente importante para votos contra)..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => votarMutation.mutate()}
                  disabled={
                    votarMutation.isPending || 
                    (!impedimento && !meuVoto) || 
                    (impedimento && !motivoImpedimento.trim())
                  }
                  className="w-full"
                >
                  <Vote className="w-4 h-4 mr-2" />
                  {votarMutation.isPending ? "Registrando..." : "Registrar Voto"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de Votos */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Votos</CardTitle>
          <CardDescription>
            Votos registrados até o momento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {votos.map((voto) => (
              <div key={voto.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{voto.conselheiros.nome}</div>
                  <div className="text-sm text-muted-foreground">
                    {voto.conselheiros.cargo} - {voto.conselheiros.tipo === 'titular' ? 'Titular' : 'Suplente'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(voto.data_voto), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>
                <div className="text-right">
                  {getVotoBadge(voto.voto, voto.impedimento)}
                  {voto.justificativa && (
                    <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                      {voto.justificativa}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {conselheiros
              .filter(c => !votos.some(v => v.conselheiro_id === c.id))
              .map((conselheiro) => (
                <div key={conselheiro.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div>
                    <div className="font-medium text-gray-700">{conselheiro.nome}</div>
                    <div className="text-sm text-muted-foreground">
                      {conselheiro.cargo} - {conselheiro.tipo === 'titular' ? 'Titular' : 'Suplente'}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    Aguardando
                  </Badge>
                </div>
              ))}
          </div>

          {votos.length === 0 && (
            <div className="text-center py-8">
              <Vote className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500">Nenhum voto registrado ainda</p>
              <p className="text-sm text-gray-400">
                {resolucao.status === 'em_votacao' 
                  ? 'Aguardando votos dos conselheiros'
                  : 'Inicie a votação para permitir que os conselheiros votem'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  );
}