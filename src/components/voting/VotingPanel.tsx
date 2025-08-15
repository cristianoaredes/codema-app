import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Vote,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Play,
  Square,
  BarChart3,
  Shield,
  Timer,
  TrendingUp,
  UserCheck,
  Gavel
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  VotingService, 
  VotingSession, 
  VotingOption, 
  VotingResults,
  VotingPresence 
} from '@/services/votingService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface VotingPanelProps {
  reuniaoId: string;
  className?: string;
}

export function VotingPanel({ reuniaoId, className }: VotingPanelProps) {
  const { profile } = useAuth();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<VotingSession[]>([]);
  const [activeSession, setActiveSession] = useState<VotingSession | null>(null);
  const [sessionOptions, setSessionOptions] = useState<VotingOption[]>([]);
  const [sessionResults, setSessionResults] = useState<VotingResults | null>(null);
  const [sessionPresence, setSessionPresence] = useState<VotingPresence[]>([]);
  const [userVote, setUserVote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const isAdmin = ['admin', 'presidente', 'secretario'].includes(profile?.role || '');

  // Carregar sessões da reunião
  useEffect(() => {
    loadVotingSessions();
  }, [reuniaoId]);

  // Timer para sessões ativas
  useEffect(() => {
    if (activeSession?.status === 'aberta' && activeSession.started_at && activeSession.timeout_minutes) {
      const startTime = new Date(activeSession.started_at).getTime();
      const timeoutMs = activeSession.timeout_minutes * 60 * 1000;
      
      const interval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTime;
        const remaining = Math.max(0, timeoutMs - elapsed);
        
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          toast({
            title: "Tempo esgotado",
            description: "O tempo para votação se esgotou",
            variant: "destructive",
          });
          loadVotingSessions(); // Recarregar para verificar se foi encerrada
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setTimeRemaining(null);
    }
  }, [activeSession]);

  // Configurar realtime para sessão ativa
  useEffect(() => {
    if (activeSession?.id) {
      const unsubscribe = VotingService.subscribeToVotingSession(activeSession.id, {
        onVote: () => {
          // Recarregar resultados quando há novos votos
          loadSessionResults(activeSession.id);
        },
        onResults: (results) => {
          setSessionResults(results);
        },
        onSessionUpdate: (session) => {
          setActiveSession(session);
          if (session.status === 'encerrada') {
            toast({
              title: "Votação encerrada",
              description: "Os resultados finais estão disponíveis",
            });
          }
        },
        onPresenceUpdate: (presence) => {
          setSessionPresence(presence);
        }
      });

      return unsubscribe;
    }
  }, [activeSession?.id]);

  const loadVotingSessions = async () => {
    try {
      setLoading(true);
      const data = await VotingService.getVotingSessionsByReuniao(reuniaoId);
      setSessions(data);
      
      // Se há uma sessão ativa, carregar detalhes
      const active = data.find(s => s.status === 'aberta');
      if (active) {
        await selectSession(active);
      } else if (data.length > 0) {
        await selectSession(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as sessões de votação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectSession = async (session: VotingSession) => {
    try {
      setActiveSession(session);
      
      const details = await VotingService.getVotingSessionDetails(session.id);
      setSessionOptions(details.options);
      setSessionResults(details.results || null);
      setUserVote(details.userVote || null);

      const presence = await VotingService.getVotingPresence(session.id);
      setSessionPresence(presence);
    } catch (error) {
      console.error('Erro ao carregar detalhes da sessão:', error);
    }
  };

  const loadSessionResults = async (sessionId: string) => {
    try {
      const results = await VotingService.calculateResults(sessionId);
      setSessionResults(results);
    } catch (error) {
      console.error('Erro ao carregar resultados:', error);
    }
  };

  const handleStartSession = async (session: VotingSession) => {
    try {
      const result = await VotingService.startVotingSession(session.id);
      if (result.success) {
        toast({
          title: "Votação iniciada",
          description: "A sessão de votação está agora aberta",
        });
        await loadVotingSessions();
      } else {
        toast({
          title: "Erro",
          description: result.error || "Não foi possível iniciar a votação",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao iniciar votação",
        variant: "destructive",
      });
    }
  };

  const handleEndSession = async (session: VotingSession) => {
    try {
      const result = await VotingService.endVotingSession(session.id);
      if (result.success) {
        toast({
          title: "Votação encerrada",
          description: "Os resultados finais foram calculados",
        });
        await loadVotingSessions();
      } else {
        toast({
          title: "Erro",
          description: result.error || "Não foi possível encerrar a votação",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao encerrar votação",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (optionId?: string) => {
    if (!activeSession) return;

    try {
      setVoting(true);
      
      const canVoteResult = await VotingService.canUserVote(activeSession.id);
      if (!canVoteResult.canVote) {
        toast({
          title: "Não é possível votar",
          description: canVoteResult.reason,
          variant: "destructive",
        });
        return;
      }

      const result = await VotingService.castVote(activeSession.id, optionId, {
        browser: navigator.userAgent,
        timestamp: new Date().toISOString()
      });

      if (result.success) {
        toast({
          title: optionId ? "Voto registrado" : "Abstenção registrada",
          description: "Seu voto foi registrado com segurança",
        });
        
        // Recarregar detalhes da sessão
        await selectSession(activeSession);
      } else {
        toast({
          title: "Erro ao votar",
          description: result.error || "Não foi possível registrar o voto",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao votar:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao registrar voto",
        variant: "destructive",
      });
    } finally {
      setVoting(false);
    }
  };

  const getStatusIcon = (status: VotingSession['status']) => {
    switch (status) {
      case 'preparando': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'aberta': return <Play className="h-4 w-4 text-green-500" />;
      case 'encerrada': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'cancelada': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: VotingSession['status']) => {
    switch (status) {
      case 'preparando': return 'Preparando';
      case 'aberta': return 'Em votação';
      case 'encerrada': return 'Encerrada';
      case 'cancelada': return 'Cancelada';
      default: return 'Desconhecido';
    }
  };

  const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateVotePercentage = (optionId: string): number => {
    if (!sessionResults || sessionResults.total_votes === 0) return 0;
    const option = sessionResults.results_data[optionId];
    return option?.percentage || 0;
  };

  const getWinningOption = (): VotingOption | null => {
    if (!sessionResults?.winning_option_id || !sessionOptions.length) return null;
    return sessionOptions.find(opt => opt.id === sessionResults.winning_option_id) || null;
  };

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

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Sistema de Votação Eletrônica
          </CardTitle>
          <CardDescription>
            Votações eletrônicas da reunião em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Lista de Sessões */}
          {sessions.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nenhuma sessão de votação foi criada para esta reunião.
                {isAdmin && " Use o sistema de gestão para criar uma nova votação."}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium">Sessões de Votação</h3>
              <div className="grid gap-3">
                {sessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      activeSession?.id === session.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => selectSession(session)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(session.status)}
                        <div>
                          <h4 className="font-medium">{session.titulo}</h4>
                          <p className="text-sm text-muted-foreground">
                            {session.tipo_votacao} • {getStatusLabel(session.status)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {session.voto_secreto && (
                          <Badge variant="outline">
                            <Shield className="h-3 w-3 mr-1" />
                            Secreto
                          </Badge>
                        )}
                        
                        {isAdmin && session.status === 'preparando' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartSession(session);
                            }}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Iniciar
                          </Button>
                        )}
                        
                        {isAdmin && session.status === 'aberta' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEndSession(session);
                            }}
                          >
                            <Square className="h-4 w-4 mr-1" />
                            Encerrar
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Detalhes da Sessão Ativa */}
          <AnimatePresence>
            {activeSession && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6"
              >
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-lg">{activeSession.titulo}</h3>
                    <div className="flex items-center gap-2">
                      {timeRemaining !== null && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {formatTimeRemaining(timeRemaining)}
                        </Badge>
                      )}
                      <Badge variant={
                        activeSession.status === 'aberta' ? 'default' :
                        activeSession.status === 'encerrada' ? 'secondary' :
                        'outline'
                      }>
                        {getStatusLabel(activeSession.status)}
                      </Badge>
                    </div>
                  </div>

                  {activeSession.descricao && (
                    <p className="text-sm text-muted-foreground">
                      {activeSession.descricao}
                    </p>
                  )}

                  {/* Informações da Votação */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tipo</p>
                      <p className="font-medium capitalize">{activeSession.tipo_votacao}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Maioria</p>
                      <p className="font-medium capitalize">{activeSession.maioria_requerida}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quórum</p>
                      <p className="font-medium">{activeSession.quorum_minimo} conselheiros</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Abstenção</p>
                      <p className="font-medium">
                        {activeSession.permite_abstencao ? 'Permitida' : 'Não permitida'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Estatísticas de Presença */}
                {sessionResults && (
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Participação
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {sessionResults.total_eligible}
                        </p>
                        <p className="text-xs text-muted-foreground">Elegíveis</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {sessionResults.total_present}
                        </p>
                        <p className="text-xs text-muted-foreground">Presentes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {sessionResults.total_votes}
                        </p>
                        <p className="text-xs text-muted-foreground">Votos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {sessionResults.total_abstentions}
                        </p>
                        <p className="text-xs text-muted-foreground">Abstenções</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {sessionResults.quorum_reached ? (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Quórum atingido
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Quórum não atingido
                        </Badge>
                      )}
                      
                      {sessionResults.approved !== undefined && (
                        <Badge variant={sessionResults.approved ? "default" : "secondary"}>
                          {sessionResults.approved ? "Aprovado" : "Rejeitado"}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Opções de Votação */}
                {sessionOptions.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Gavel className="h-4 w-4" />
                      Opções de Votação
                    </h4>
                    
                    <div className="space-y-3">
                      {sessionOptions.map((option) => {
                        const percentage = calculateVotePercentage(option.id);
                        const votes = sessionResults?.results_data[option.id]?.votes || 0;
                        const isWinner = sessionResults?.winning_option_id === option.id;
                        const userVotedThis = userVote?.option_id === option.id;

                        return (
                          <motion.div
                            key={option.id}
                            className={`p-4 border rounded-lg ${
                              userVotedThis ? 'border-primary bg-primary/5' :
                              isWinner && sessionResults?.approved ? 'border-green-500 bg-green-50' :
                              'border-border'
                            }`}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: option.cor }}
                                />
                                <span className="font-medium">{option.texto}</span>
                                {isWinner && sessionResults?.approved && (
                                  <Badge variant="default" className="text-xs">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    Vencedora
                                  </Badge>
                                )}
                                {userVotedThis && (
                                  <Badge variant="outline" className="text-xs">
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    Seu voto
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{votes} votos</span>
                                <span className="text-sm text-muted-foreground">
                                  ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                            
                            <Progress value={percentage} className="mb-3" />
                            
                            {activeSession.status === 'aberta' && !userVote && (
                              <Button
                                size="sm"
                                variant={userVotedThis ? "default" : "outline"}
                                onClick={() => handleVote(option.id)}
                                disabled={voting}
                                className="w-full"
                              >
                                {voting ? "Votando..." : "Votar nesta opção"}
                              </Button>
                            )}
                          </motion.div>
                        );
                      })}
                      
                      {/* Botão de Abstenção */}
                      {activeSession.permite_abstencao && activeSession.status === 'aberta' && !userVote && (
                        <motion.div
                          className={`p-4 border rounded-lg border-dashed ${
                            userVote?.option_id === null ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Não deseja votar em nenhuma opção?
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVote()}
                              disabled={voting}
                            >
                              {voting ? "Registrando..." : "Abster-se"}
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}

                {/* Resultados Finais */}
                {activeSession.status === 'encerrada' && sessionResults && (
                  <div className="space-y-4">
                    <Separator />
                    <div className="text-center space-y-2">
                      <h4 className="font-medium text-lg">Resultado Final</h4>
                      {sessionResults.approved ? (
                        <div className="space-y-2">
                          <Badge variant="default" className="text-base px-4 py-2">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            APROVADO
                          </Badge>
                          {getWinningOption() && (
                            <p className="text-sm text-muted-foreground">
                              Opção vencedora: <strong>{getWinningOption()?.texto}</strong>
                            </p>
                          )}
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-base px-4 py-2">
                          <XCircle className="h-4 w-4 mr-2" />
                          REJEITADO
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Ações Administrativas */}
                {isAdmin && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes da Votação</DialogTitle>
                            <DialogDescription>
                              Informações detalhadas e estatísticas da sessão
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Conteúdo dos detalhes seria implementado aqui */}
                            <p className="text-sm text-muted-foreground">
                              Detalhes completos, logs de auditoria e estatísticas avançadas...
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Auditoria
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}