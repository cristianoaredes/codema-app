import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  Clock,
  Target,
  Activity,
  Zap,
  Eye,
  AlertCircle,
  Crown,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  VotingService, 
  VotingSession, 
  VotingOption, 
  VotingResults,
  VotingStatistics 
} from '@/services/votingService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface VotingResultsPanelProps {
  sessionId?: string;
  showStatistics?: boolean;
  className?: string;
}

export function VotingResultsPanel({ 
  sessionId, 
  showStatistics = false, 
  className 
}: VotingResultsPanelProps) {
  const { profile } = useAuth();
  const { toast } = useToast();

  const [session, setSession] = useState<VotingSession | null>(null);
  const [options, setOptions] = useState<VotingOption[]>([]);
  const [results, setResults] = useState<VotingResults | null>(null);
  const [statistics, setStatistics] = useState<VotingStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const isAdmin = ['admin', 'presidente', 'secretario'].includes(profile?.role || '');

  // Carregar dados iniciais
  useEffect(() => {
    if (sessionId) {
      loadSessionData();
    } else if (showStatistics) {
      loadStatistics();
    }
  }, [sessionId, showStatistics]);

  // Auto refresh para sessões ativas
  useEffect(() => {
    if (autoRefresh && sessionId && session?.status === 'aberta') {
      const interval = setInterval(() => {
        loadSessionData();
      }, 5000); // Atualizar a cada 5 segundos

      return () => clearInterval(interval);
    }
  }, [autoRefresh, sessionId, session?.status]);

  // Configurar realtime
  useEffect(() => {
    if (sessionId && session?.status === 'aberta') {
      const unsubscribe = VotingService.subscribeToVotingSession(sessionId, {
        onResults: (newResults) => {
          setResults(newResults);
        },
        onSessionUpdate: (updatedSession) => {
          setSession(updatedSession);
          if (updatedSession.status === 'encerrada') {
            setAutoRefresh(false);
            toast({
              title: "Votação encerrada",
              description: "Os resultados finais foram calculados",
            });
          }
        }
      });

      return unsubscribe;
    }
  }, [sessionId, session?.status]);

  const loadSessionData = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const details = await VotingService.getVotingSessionDetails(sessionId);
      setSession(details.session);
      setOptions(details.options);
      setResults(details.results || null);
    } catch (error) {
      console.error('Erro ao carregar dados da sessão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da votação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const stats = await VotingService.getVotingStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportResults = async () => {
    if (!sessionId || !isAdmin) return;

    try {
      const exportData = await VotingService.exportVotingResults(sessionId);
      
      // Criar e baixar arquivo JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `votacao_${session?.titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Exportação concluída",
        description: "Os resultados foram exportados com sucesso",
      });
    } catch (error) {
      console.error('Erro ao exportar resultados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar os resultados",
        variant: "destructive",
      });
    }
  };

  const calculateParticipationRate = (): number => {
    if (!results || results.total_eligible === 0) return 0;
    return ((results.total_votes + results.total_abstentions) / results.total_eligible) * 100;
  };

  const getWinningOption = (): VotingOption | null => {
    if (!results?.winning_option_id || !options.length) return null;
    return options.find(opt => opt.id === results.winning_option_id) || null;
  };

  const getOptionVotes = (optionId: string): number => {
    return results?.results_data[optionId]?.votes || 0;
  };

  const getOptionPercentage = (optionId: string): number => {
    return results?.results_data[optionId]?.percentage || 0;
  };

  const sortedOptions = options.sort((a, b) => {
    const votesA = getOptionVotes(a.id);
    const votesB = getOptionVotes(b.id);
    return votesB - votesA; // Ordem decrescente
  });

  if (loading) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="h-6 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-32 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Painel de Estatísticas Gerais
  if (showStatistics && statistics) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estatísticas de Votação
            </CardTitle>
            <CardDescription>
              Métricas gerais do sistema de votação eletrônica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Métricas Principais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {statistics.total_sessions}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total de Sessões
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {statistics.total_votes_cast}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Votos Registrados
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">
                      {statistics.average_participation.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Participação Média
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-600">
                      {statistics.approval_rate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Taxa de Aprovação
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sessões por Status */}
            <div className="space-y-3">
              <h3 className="font-medium">Sessões por Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(statistics.sessions_by_status).map(([status, count]) => (
                  <div key={status} className="text-center p-3 border rounded">
                    <p className="text-lg font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {status === 'preparando' ? 'Preparando' :
                       status === 'aberta' ? 'Em andamento' :
                       status === 'encerrada' ? 'Encerradas' :
                       status === 'cancelada' ? 'Canceladas' : status}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sessões Mais Ativas */}
            {statistics.most_active_sessions.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium">Sessões Mais Ativas</h3>
                <div className="space-y-2">
                  {statistics.most_active_sessions.map((sessionStat, index) => (
                    <div key={sessionStat.session_id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{sessionStat.titulo}</p>
                          <p className="text-sm text-muted-foreground">
                            {sessionStat.participation_rate.toFixed(1)}% de participação
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{sessionStat.total_votes} votos</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Painel de Resultados de Sessão Específica
  if (!session || !results) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {sessionId ? "Resultados não disponíveis" : "Selecione uma sessão de votação"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Resultados da Votação
              </CardTitle>
              <CardDescription>{session.titulo}</CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {session.status === 'aberta' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
                  {autoRefresh ? 'Pause' : 'Auto Refresh'}
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={loadSessionData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              
              {isAdmin && session.status === 'encerrada' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportResults}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status da Votação */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {session.status === 'aberta' && <Zap className="h-5 w-5 text-green-500" />}
              {session.status === 'encerrada' && <CheckCircle className="h-5 w-5 text-blue-500" />}
              {session.status === 'preparando' && <Clock className="h-5 w-5 text-yellow-500" />}
              
              <div>
                <p className="font-medium">
                  Status: {
                    session.status === 'aberta' ? 'Em andamento' :
                    session.status === 'encerrada' ? 'Encerrada' :
                    session.status === 'preparando' ? 'Preparando' :
                    'Cancelada'
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {session.status === 'aberta' && 'Votação em tempo real'}
                  {session.status === 'encerrada' && 'Resultados finais'}
                  {session.status === 'preparando' && 'Aguardando início'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {results.quorum_reached ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Quórum atingido
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Quórum não atingido
                </Badge>
              )}
              
              {session.voto_secreto && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Voto secreto
                </Badge>
              )}
            </div>
          </div>

          {/* Métricas de Participação */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {results.total_eligible}
              </p>
              <p className="text-xs text-muted-foreground">Elegíveis</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {results.total_present}
              </p>
              <p className="text-xs text-muted-foreground">Presentes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {results.total_votes}
              </p>
              <p className="text-xs text-muted-foreground">Votos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {results.total_abstentions}
              </p>
              <p className="text-xs text-muted-foreground">Abstenções</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">
                {calculateParticipationRate().toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Participação</p>
            </div>
          </div>

          <Progress value={calculateParticipationRate()} className="h-2" />

          <Separator />

          {/* Resultados por Opção */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Resultados por Opção</h3>
              {session.status === 'aberta' && (
                <Badge variant="outline" className="animate-pulse">
                  <Activity className="h-3 w-3 mr-1" />
                  Tempo real
                </Badge>
              )}
            </div>
            
            <div className="space-y-3">
              {sortedOptions.map((option, index) => {
                const votes = getOptionVotes(option.id);
                const percentage = getOptionPercentage(option.id);
                const isWinner = results.winning_option_id === option.id;

                return (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 border rounded-lg ${
                      isWinner ? 'border-green-500 bg-green-50' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {index === 0 && isWinner && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: option.cor }}
                          />
                          <span className="font-medium">{option.texto}</span>
                        </div>
                        
                        {isWinner && results.approved && (
                          <Badge variant="default" className="text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Vencedora
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold">{votes}</span>
                        <span className="text-sm text-muted-foreground">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    
                    <Progress 
                      value={percentage} 
                      className="h-3"
                      style={{ 
                        backgroundColor: `${option.cor}20`,
                      }}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Resultado Final */}
          {session.status === 'encerrada' && (
            <div className="space-y-4">
              <Separator />
              <div className="text-center space-y-4">
                <h3 className="font-medium text-lg">Resultado Final</h3>
                
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-2"
                >
                  {results.approved ? (
                    <div className="space-y-2">
                      <Badge variant="default" className="text-xl px-6 py-3">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        APROVADO
                      </Badge>
                      {getWinningOption() && (
                        <p className="text-muted-foreground">
                          Opção vencedora: <strong>{getWinningOption()?.texto}</strong>
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Maioria {session.maioria_requerida} atingida
                        {session.percentual_qualificada && ` (${session.percentual_qualificada}%)`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Badge variant="secondary" className="text-xl px-6 py-3">
                        <XCircle className="h-5 w-5 mr-2" />
                        REJEITADO
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Maioria {session.maioria_requerida} não atingida
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Hash de Verificação */}
                {session.hash_final && (
                  <div className="text-xs text-muted-foreground font-mono p-2 bg-muted rounded">
                    Hash de verificação: {session.hash_final.substring(0, 16)}...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Links para Auditoria (Admin) */}
          {isAdmin && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Auditoria Completa
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                      <DialogTitle>Auditoria da Votação</DialogTitle>
                      <DialogDescription>
                        Logs detalhados e informações de auditoria da sessão
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Sistema de auditoria completo com logs, hashes de verificação e rastreabilidade...
                      </p>
                      {/* Aqui seria implementado o componente de auditoria detalhada */}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}