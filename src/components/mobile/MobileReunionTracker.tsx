import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Users,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  PhoneCall,
  Video,
  Mic,
  MicOff,
  Bell,
  Share2,
  Calendar,
  FileText,
  TrendingUp,
  UserCheck,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileApiService, ReunionMobileData } from '@/services/mobileApiService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface MobileReunionTrackerProps {
  reunionId?: string;
  autoRefresh?: boolean;
  className?: string;
}

interface Participant {
  id: string;
  nome: string;
  cargo: string;
  presente: boolean;
  hora_entrada?: string;
  avatar?: string;
  is_current_user?: boolean;
}

interface PautaItem {
  id: string;
  titulo: string;
  descricao: string;
  status: 'pendente' | 'em_discussao' | 'aprovado' | 'rejeitado';
  tempo_inicio?: string;
  tempo_fim?: string;
  votacao_necessaria: boolean;
}

export function MobileReunionTracker({ 
  reunionId, 
  autoRefresh = true, 
  className 
}: MobileReunionTrackerProps) {
  const { profile } = useAuth();
  const { toast } = useToast();

  const [reunion, setReunion] = useState<ReunionMobileData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [pautas, setPautas] = useState<PautaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [currentUserPresent, setCurrentUserPresent] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  // Simular dados em tempo real
  const mockReunion: ReunionMobileData = {
    id: reunionId || '1',
    titulo: 'Reunião Ordinária - Janeiro 2025',
    data_reuniao: new Date().toISOString(),
    local: 'Câmara Municipal de Itanhomi',
    status: 'em_andamento',
    tipo: 'ordinaria',
    pauta: 'Discussão sobre licenciamento ambiental e projetos do FMA',
    participantes_confirmados: 7,
    total_conselheiros: 12,
    quorum_atingido: true,
    tempo_restante: 90,
    proxima_pauta: {
      id: '2',
      titulo: 'Análise de Projeto FMA-2025-001',
      descricao: 'Discussão sobre o projeto de reflorestamento da área urbana'
    }
  };

  const mockParticipants: Participant[] = [
    { id: '1', nome: 'João Silva', cargo: 'Presidente', presente: true, hora_entrada: '14:00', is_current_user: true },
    { id: '2', nome: 'Maria Santos', cargo: 'Vice-Presidente', presente: true, hora_entrada: '14:02' },
    { id: '3', nome: 'Pedro Oliveira', cargo: 'Secretário', presente: true, hora_entrada: '14:05' },
    { id: '4', nome: 'Ana Costa', cargo: 'Conselheiro', presente: true, hora_entrada: '14:03' },
    { id: '5', nome: 'Carlos Lima', cargo: 'Conselheiro', presente: true, hora_entrada: '14:08' },
    { id: '6', nome: 'Lucia Ferreira', cargo: 'Conselheiro', presente: true, hora_entrada: '14:10' },
    { id: '7', nome: 'Roberto Mendes', cargo: 'Conselheiro', presente: true, hora_entrada: '14:12' },
    { id: '8', nome: 'Elena Rodrigues', cargo: 'Conselheiro', presente: false },
    { id: '9', nome: 'Fernando Alves', cargo: 'Conselheiro', presente: false },
    { id: '10', nome: 'Sandra Pereira', cargo: 'Conselheiro', presente: false },
    { id: '11', nome: 'Miguel Torres', cargo: 'Conselheiro', presente: false },
    { id: '12', nome: 'Julia Nascimento', cargo: 'Conselheiro', presente: false },
  ];

  const mockPautas: PautaItem[] = [
    {
      id: '1',
      titulo: 'Abertura e verificação de quórum',
      descricao: 'Verificação da presença dos conselheiros',
      status: 'aprovado',
      tempo_inicio: '14:00',
      tempo_fim: '14:05',
      votacao_necessaria: false
    },
    {
      id: '2',
      titulo: 'Análise de Projeto FMA-2025-001',
      descricao: 'Discussão sobre o projeto de reflorestamento da área urbana',
      status: 'em_discussao',
      tempo_inicio: '14:05',
      votacao_necessaria: true
    },
    {
      id: '3',
      titulo: 'Aprovação da Ata da Reunião Anterior',
      descricao: 'Revisão e aprovação da ata da reunião de dezembro/2024',
      status: 'pendente',
      votacao_necessaria: true
    },
    {
      id: '4',
      titulo: 'Relatório de Atividades FMA',
      descricao: 'Apresentação do relatório mensal de atividades do FMA',
      status: 'pendente',
      votacao_necessaria: false
    }
  ];

  // Carregar dados da reunião
  const loadReunionData = async () => {
    if (!reunionId) return;

    try {
      setIsLoading(true);
      
      // Simular carregamento dos dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setReunion(mockReunion);
      setParticipants(mockParticipants);
      setPautas(mockPautas);
      setCurrentUserPresent(mockParticipants.find(p => p.is_current_user)?.presente || false);
      setConnectionStatus('connected');

    } catch (error) {
      console.error('Erro ao carregar dados da reunião:', error);
      setConnectionStatus('disconnected');
      toast({
        title: "Erro ao conectar",
        description: "Não foi possível carregar os dados da reunião",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Realizar check-in/check-out
  const handleCheckInOut = async () => {
    if (!profile?.id || !reunionId) return;

    setIsCheckingIn(true);
    try {
      const newStatus = !currentUserPresent;
      
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setCurrentUserPresent(newStatus);
      
      // Atualizar lista de participantes
      setParticipants(prev => prev.map(p => 
        p.is_current_user 
          ? { 
              ...p, 
              presente: newStatus,
              hora_entrada: newStatus ? new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : undefined
            }
          : p
      ));

      // Atualizar contador de participantes na reunião
      if (reunion) {
        setReunion(prev => prev ? {
          ...prev,
          participantes_confirmados: prev.participantes_confirmados + (newStatus ? 1 : -1),
          quorum_atingido: (prev.participantes_confirmados + (newStatus ? 1 : -1)) >= Math.ceil(prev.total_conselheiros / 2)
        } : null);
      }

      toast({
        title: newStatus ? "Check-in realizado" : "Check-out realizado",
        description: newStatus ? "Sua presença foi registrada" : "Você foi marcado como ausente",
      });

    } catch (error) {
      console.error('Erro no check-in/out:', error);
      toast({
        title: "Erro no check-in",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Auto-refresh dos dados
  useEffect(() => {
    loadReunionData();

    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simular atualizações em tempo real
        if (Math.random() > 0.7) {
          // Simular mudança de status de pauta
          setPautas(prev => prev.map((pauta, index) => {
            if (index === 1 && pauta.status === 'em_discussao' && Math.random() > 0.5) {
              return { ...pauta, status: 'aprovado', tempo_fim: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
            }
            return pauta;
          }));
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [reunionId, autoRefresh]);

  if (isLoading) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-32 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!reunion) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Reunião não encontrada</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quorumPercentage = (reunion.participantes_confirmados / reunion.total_conselheiros) * 100;

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Status da Conexão */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 border rounded-lg"
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              {connectionStatus === 'connected' ? 'Conectado' : 
               connectionStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
            </span>
          </div>
          
          <Badge variant={reunion.status === 'em_andamento' ? 'default' : 'secondary'}>
            {reunion.status === 'em_andamento' ? 'Em Andamento' : reunion.status}
          </Badge>
        </motion.div>

        {/* Informações da Reunião */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{reunion.titulo}</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(reunion.data_reuniao).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(reunion.data_reuniao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {reunion.local}
                  </span>
                </CardDescription>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Check-in Button */}
            <Button
              onClick={handleCheckInOut}
              disabled={isCheckingIn}
              className="w-full"
              variant={currentUserPresent ? "destructive" : "default"}
            >
              {isCheckingIn ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {currentUserPresent ? (
                    <>
                      <XCircle className="h-4 w-4" />
                      Fazer Check-out
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Fazer Check-in
                    </>
                  )}
                </div>
              )}
            </Button>

            {/* Quórum Status */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Quórum ({reunion.participantes_confirmados}/{reunion.total_conselheiros})</span>
                <span className="font-medium">{Math.round(quorumPercentage)}%</span>
              </div>
              <Progress value={quorumPercentage} className="h-2" />
              <div className="flex items-center gap-2 text-sm">
                {reunion.quorum_atingido ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Quórum atingido</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span className="text-orange-600">Aguardando quórum</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pauta Atual */}
        {reunion.proxima_pauta && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Pauta Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h3 className="font-medium">{reunion.proxima_pauta.titulo}</h3>
                <p className="text-sm text-muted-foreground">{reunion.proxima_pauta.descricao}</p>
                
                <div className="flex items-center gap-2">
                  <Badge variant="default">Em Discussão</Badge>
                  <span className="text-sm text-muted-foreground">Iniciado às 14:05</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Participantes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participantes
              </CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Ver Todos
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Lista de Participantes</DialogTitle>
                    <DialogDescription>
                      Status de presença dos conselheiros
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback>
                              {participant.nome.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{participant.nome}</p>
                            <p className="text-xs text-muted-foreground">{participant.cargo}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {participant.presente ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              {participant.hora_entrada && (
                                <span className="text-xs text-muted-foreground">{participant.hora_entrada}</span>
                              )}
                            </>
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {participants.filter(p => p.presente).slice(0, 6).map((participant) => (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={participant.avatar} />
                    <AvatarFallback className="text-xs">
                      {participant.nome.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{participant.nome.split(' ')[0]}</span>
                  {participant.is_current_user && (
                    <Badge variant="secondary" className="text-xs">Você</Badge>
                  )}
                </motion.div>
              ))}
              
              {participants.filter(p => p.presente).length > 6 && (
                <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
                  <span className="text-xs font-medium">+{participants.filter(p => p.presente).length - 6}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Andamento da Pauta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Andamento da Pauta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pautas.map((pauta, index) => (
                <motion.div
                  key={pauta.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-start gap-3 p-3 border rounded-lg ${
                    pauta.status === 'em_discussao' ? 'border-blue-200 bg-blue-50' :
                    pauta.status === 'aprovado' ? 'border-green-200 bg-green-50' :
                    pauta.status === 'rejeitado' ? 'border-red-200 bg-red-50' :
                    'border-gray-200'
                  }`}
                >
                  <div className="mt-0.5">
                    {pauta.status === 'aprovado' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : pauta.status === 'rejeitado' ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : pauta.status === 'em_discussao' ? (
                      <Play className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{pauta.titulo}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{pauta.descricao}</p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={
                        pauta.status === 'aprovado' ? 'default' :
                        pauta.status === 'rejeitado' ? 'destructive' :
                        pauta.status === 'em_discussao' ? 'default' :
                        'secondary'
                      } className="text-xs">
                        {pauta.status === 'aprovado' ? 'Aprovado' :
                         pauta.status === 'rejeitado' ? 'Rejeitado' :
                         pauta.status === 'em_discussao' ? 'Em Discussão' :
                         'Pendente'}
                      </Badge>
                      
                      {pauta.votacao_necessaria && (
                        <Badge variant="outline" className="text-xs">
                          Votação
                        </Badge>
                      )}
                      
                      {(pauta.tempo_inicio || pauta.tempo_fim) && (
                        <span className="text-xs text-muted-foreground">
                          {pauta.tempo_inicio}{pauta.tempo_fim ? ` - ${pauta.tempo_fim}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions Mobile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12">
                <div className="flex flex-col items-center gap-1">
                  <Video className="h-4 w-4" />
                  <span className="text-xs">Videoconferência</span>
                </div>
              </Button>
              
              <Button variant="outline" className="h-12">
                <div className="flex flex-col items-center gap-1">
                  <PhoneCall className="h-4 w-4" />
                  <span className="text-xs">Ligar</span>
                </div>
              </Button>
              
              <Button variant="outline" className="h-12">
                <div className="flex flex-col items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs">Documentos</span>
                </div>
              </Button>
              
              <Button variant="outline" className="h-12">
                <div className="flex flex-col items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs">Votação</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}