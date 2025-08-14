import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Timer,
  Vote,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  ArrowRight,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AgendaItem } from '@/components/reunioes/AgendaManager';
import { useAuth } from '@/hooks/useAuth';

interface AgendaControlProps {
  currentItem: AgendaItem | null;
  currentIndex: number;
  totalItems: number;
  progress: number;
  isInProgress: boolean;
  canControl?: boolean;
  onPreviousItem?: () => void;
  onNextItem?: () => void;
  onStatusChange?: (index: number, status: AgendaItem['status']) => void;
  onRecordDecision?: (index: number, decision: string, votes?: AgendaItem['votos']) => void;
}

export const AgendaControl = React.memo(function AgendaControl({
  currentItem,
  currentIndex,
  totalItems,
  progress,
  isInProgress,
  canControl = false,
  onPreviousItem,
  onNextItem,
  onStatusChange,
  onRecordDecision
}: AgendaControlProps) {
  const { profile } = useAuth();
  const [showVotingDialog, setShowVotingDialog] = useState(false);
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [votes, setVotes] = useState({ favoraveis: 0, contrarios: 0, abstencoes: 0 });
  const [decision, setDecision] = useState('');

  // Memoizar permissões do usuário
  const canManage = useMemo(() => 
    profile?.role === 'admin' || 
    profile?.role === 'presidente' || 
    profile?.role === 'secretario',
    [profile?.role]
  );

  // Memoizar função de cores de status
  const getStatusColor = useCallback((status: AgendaItem['status']) => {
    switch (status) {
      case 'pendente': return 'text-gray-600';
      case 'em_discussao': return 'text-blue-600';
      case 'votacao': return 'text-yellow-600';
      case 'aprovado': return 'text-green-600';
      case 'rejeitado': return 'text-red-600';
      case 'adiado': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  }, []);

  // Memoizar handlers para evitar re-renders desnecessários
  const handleStartDiscussion = useCallback(() => {
    if (currentItem && onStatusChange) {
      onStatusChange(currentIndex, 'em_discussao');
    }
  }, [currentItem, onStatusChange, currentIndex]);

  const handleOpenVoting = useCallback(() => {
    if (currentItem && onStatusChange) {
      onStatusChange(currentIndex, 'votacao');
      setShowVotingDialog(true);
    }
  }, [currentItem, onStatusChange, currentIndex]);

  const handleRecordVotes = useCallback(() => {
    if (currentItem && onRecordDecision) {
      const status = votes.favoraveis > votes.contrarios ? 'aprovado' : 'rejeitado';
      onStatusChange?.(currentIndex, status);
      onRecordDecision(currentIndex, decision, votes);
      setShowVotingDialog(false);
      setShowDecisionDialog(false);
      
      // Reset form
      setVotes({ favoraveis: 0, contrarios: 0, abstencoes: 0 });
      setDecision('');
    }
  }, [currentItem, onRecordDecision, votes, onStatusChange, currentIndex, decision]);

  const handlePostpone = useCallback(() => {
    if (currentItem && onStatusChange) {
      onStatusChange(currentIndex, 'adiado');
    }
  }, [currentItem, onStatusChange, currentIndex]);

  // Memoizar cálculos de votação
  const votingResult = useMemo(() => {
    const totalVotes = votes.favoraveis + votes.contrarios + votes.abstencoes;
    if (totalVotes === 0) return null;
    
    if (votes.favoraveis > votes.contrarios) {
      return { type: 'approved', label: 'Item será APROVADO', color: 'text-green-600' };
    } else if (votes.favoraveis < votes.contrarios) {
      return { type: 'rejected', label: 'Item será REJEITADO', color: 'text-red-600' };
    } else {
      return { type: 'tied', label: 'EMPATE - revisar votação', color: 'text-yellow-600' };
    }
  }, [votes.favoraveis, votes.contrarios, votes.abstencoes]);

  // Memoizar estado de navegação
  const navigationState = useMemo(() => ({
    canGoPrevious: currentIndex > 0,
    canGoNext: currentIndex < totalItems - 1,
    isFirstItem: currentIndex === 0,
    isLastItem: currentIndex === totalItems - 1
  }), [currentIndex, totalItems]);

  // Memoizar validação do formulário de votação
  const isVotingFormValid = useMemo(() => 
    decision.trim().length > 0 && (votes.favoraveis + votes.contrarios + votes.abstencoes) > 0,
    [decision, votes.favoraveis, votes.contrarios, votes.abstencoes]
  );

  if (!currentItem) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Controle da Pauta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum item selecionado</h3>
            <p className="text-muted-foreground">
              Selecione um item da pauta para iniciar o controle
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Item Atual */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Item Atual da Pauta
            </CardTitle>
            <Badge variant="outline">
              {currentIndex + 1} de {totalItems}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progresso Geral */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso da Reunião</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Informações do Item */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{currentItem.titulo}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentItem.descricao}
                </p>
              </div>
              <Badge className={`gap-1 ${getStatusColor(currentItem.status)}`}>
                {currentItem.status === 'em_discussao' && <Play className="h-3 w-3" />}
                {currentItem.status === 'votacao' && <Vote className="h-3 w-3" />}
                {currentItem.status === 'aprovado' && <CheckCircle className="h-3 w-3" />}
                {currentItem.status === 'rejeitado' && <XCircle className="h-3 w-3" />}
                {currentItem.status}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {currentItem.responsavel}
              </div>
              
              {currentItem.tempoEstimado && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {currentItem.tempoEstimado}min estimado
                </div>
              )}
            </div>

            {currentItem.decisao && (
              <Alert className="mt-3">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Decisão:</strong> {currentItem.decisao}
                </AlertDescription>
              </Alert>
            )}

            {currentItem.votos && (
              <div className="mt-3 p-3 bg-white rounded border">
                <h4 className="font-medium mb-2">Resultado da Votação:</h4>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600">👍 {currentItem.votos.favoraveis} Favoráveis</span>
                  <span className="text-red-600">👎 {currentItem.votos.contrarios} Contrários</span>
                  <span className="text-gray-600">⚪ {currentItem.votos.abstencoes} Abstenções</span>
                </div>
              </div>
            )}
          </div>

          {/* Controles */}
          {canManage && isInProgress && (
            <div className="space-y-3">
              {/* Ações por Status */}
              {currentItem.status === 'pendente' && (
                <div className="flex gap-2">
                  <Button onClick={handleStartDiscussion} className="gap-2">
                    <Play className="h-4 w-4" />
                    Iniciar Discussão
                  </Button>
                </div>
              )}

              {currentItem.status === 'em_discussao' && (
                <div className="flex gap-2">
                  <Button onClick={handleOpenVoting} className="gap-2">
                    <Vote className="h-4 w-4" />
                    Abrir Votação
                  </Button>
                  <Button variant="outline" onClick={handlePostpone} className="gap-2">
                    <Pause className="h-4 w-4" />
                    Adiar Item
                  </Button>
                </div>
              )}

              {currentItem.status === 'votacao' && (
                <div className="flex gap-2">
                  <Dialog open={showVotingDialog} onOpenChange={setShowVotingDialog}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <FileText className="h-4 w-4" />
                        Registrar Votação
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Registrar Resultado da Votação</DialogTitle>
                        <DialogDescription>
                          Registre os votos e a decisão para o item: {currentItem.titulo}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium text-green-600">Favoráveis</label>
                            <Input
                              type="number"
                              min="0"
                              value={votes.favoraveis}
                              onChange={(e) => setVotes(prev => ({ ...prev, favoraveis: parseInt(e.target.value) || 0 }))}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-red-600">Contrários</label>
                            <Input
                              type="number"
                              min="0"
                              value={votes.contrarios}
                              onChange={(e) => setVotes(prev => ({ ...prev, contrarios: parseInt(e.target.value) || 0 }))}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Abstenções</label>
                            <Input
                              type="number"
                              min="0"
                              value={votes.abstencoes}
                              onChange={(e) => setVotes(prev => ({ ...prev, abstencoes: parseInt(e.target.value) || 0 }))}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Decisão/Resumo</label>
                          <Textarea
                            value={decision}
                            onChange={(e) => setDecision(e.target.value)}
                            placeholder="Descreva a decisão tomada ou resumo da discussão"
                            rows={3}
                          />
                        </div>

                        {votingResult && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Resultado:</strong> {' '}
                              <span className={votingResult.color}>{votingResult.label}</span>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowVotingDialog(false)}>
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleRecordVotes}
                          disabled={!isVotingFormValid}
                        >
                          Registrar Votação
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {/* Navegação entre itens */}
              <div className="flex justify-between pt-3 border-t">
                <Button
                  variant="outline"
                  onClick={onPreviousItem}
                  disabled={!navigationState.canGoPrevious}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Item Anterior
                </Button>

                <Button
                  variant="outline"
                  onClick={onNextItem}
                  disabled={!navigationState.canGoNext}
                  className="gap-2"
                >
                  Próximo Item
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navegação Rápida */}
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SkipForward className="h-5 w-5" />
              Navegação Rápida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPreviousItem}
                disabled={!navigationState.canGoPrevious}
                className="gap-2"
              >
                <SkipBack className="h-4 w-4" />
                Anterior
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onNextItem}
                disabled={!navigationState.canGoNext}
                className="gap-2"
              >
                <SkipForward className="h-4 w-4" />
                Próximo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

export default AgendaControl;