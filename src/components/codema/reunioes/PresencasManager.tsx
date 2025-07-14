import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QuorumIndicator } from '@/components/codema/conselheiros';
import { useConselheiros } from '@/hooks/useConselheiros';
import { usePresencas, useMarcarPresenca, useConvocacoes } from '@/hooks/useReunioes';
import { Users, Clock, AlertTriangle, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PresencasManagerProps {
  reuniao_id: string;
  quorum_necessario?: number;
}

export function PresencasManager({ reuniao_id, quorum_necessario = 7 }: PresencasManagerProps) {
  const [justificativaDialog, setJustificativaDialog] = useState<{
    open: boolean;
    conselheiro_id: string;
    nome: string;
  }>({ open: false, conselheiro_id: '', nome: '' });
  const [justificativa, setJustificativa] = useState('');

  const { data: conselheiros = [] } = useConselheiros();
  const { data: presencas = [] } = usePresencas(reuniao_id);
  const { data: convocacoes = [] } = useConvocacoes(reuniao_id);
  const marcarPresenca = useMarcarPresenca();

  const activeConselheiros = conselheiros.filter(c => c.status === 'ativo');
  const totalPresentes = presencas.filter(p => p.presente).length;
  const quorumAtingido = totalPresentes >= quorum_necessario;

  const getPresencaStatus = (conselheiro_id: string) => {
    return presencas.find(p => p.conselheiro_id === conselheiro_id);
  };

  const getConvocacaoStatus = (conselheiro_id: string) => {
    return convocacoes.find(c => c.conselheiro_id === conselheiro_id);
  };

  const handlePresencaChange = async (conselheiro_id: string, presente: boolean) => {
    if (!presente) {
      // Open justification dialog for absence
      const conselheiro = activeConselheiros.find(c => c.id === conselheiro_id);
      setJustificativaDialog({
        open: true,
        conselheiro_id,
        nome: conselheiro?.nome_completo || ''
      });
      return;
    }

    // Mark as present immediately
    try {
      await marcarPresenca.mutateAsync({
        reuniao_id,
        conselheiro_id,
        presente: true,
        horario_chegada: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao marcar presença:', error);
    }
  };

  const handleJustificarAusencia = async () => {
    try {
      await marcarPresenca.mutateAsync({
        reuniao_id,
        conselheiro_id: justificativaDialog.conselheiro_id,
        presente: false,
        justificativa_ausencia: justificativa || 'Ausência sem justificativa',
      });
      setJustificativaDialog({ open: false, conselheiro_id: '', nome: '' });
      setJustificativa('');
    } catch (error) {
      console.error('Erro ao justificar ausência:', error);
    }
  };

  const getConfirmacaoIcon = (confirmacao?: string) => {
    switch (confirmacao) {
      case 'confirmada':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejeitada':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getConfirmacaoLabel = (confirmacao?: string) => {
    switch (confirmacao) {
      case 'confirmada':
        return 'Confirmou';
      case 'rejeitada':
        return 'Rejeitou';
      default:
        return 'Pendente';
    }
  };

  const getSegmentoColor = (segmento: string) => {
    switch (segmento) {
      case 'governo': return 'bg-blue-100 text-blue-800';
      case 'sociedade_civil': return 'bg-purple-100 text-purple-800';
      case 'setor_produtivo': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSegmentoLabel = (segmento: string) => {
    switch (segmento) {
      case 'governo': return 'Governo';
      case 'sociedade_civil': return 'Sociedade Civil';
      case 'setor_produtivo': return 'Setor Produtivo';
      default: return segmento;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quorum Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Status do Quórum
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QuorumIndicator 
            totalConselheiros={activeConselheiros.length}
            presentes={totalPresentes}
          />
          {quorumAtingido ? (
            <p className="text-sm text-green-600 mt-2">
              ✅ Quórum atingido! A reunião pode ser realizada.
            </p>
          ) : (
            <p className="text-sm text-red-600 mt-2">
              ❌ Quórum não atingido. Necessário pelo menos {quorum_necessario} conselheiros presentes.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Presença</CardTitle>
          <CardDescription>
            Marque a presença dos conselheiros conforme chegam à reunião
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeConselheiros.map((conselheiro) => {
              const presenca = getPresencaStatus(conselheiro.id);
              const convocacao = getConvocacaoStatus(conselheiro.id);
              
              return (
                <div key={conselheiro.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={presenca?.presente || false}
                      onCheckedChange={(checked) => 
                        handlePresencaChange(conselheiro.id, checked as boolean)
                      }
                      disabled={marcarPresenca.isPending}
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{conselheiro.nome_completo}</h4>
                        <Badge className={getSegmentoColor(conselheiro.segmento)}>
                          {getSegmentoLabel(conselheiro.segmento)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{conselheiro.entidade_representada}</p>
                      
                      {/* Attendance Status */}
                      <div className="flex items-center gap-4 mt-2">
                        {presenca && (
                          <div className="flex items-center gap-1 text-xs">
                            {presenca.presente ? (
                              <>
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span className="text-green-600">
                                  Presente {presenca.horario_chegada && 
                                    `(${format(new Date(presenca.horario_chegada), 'HH:mm', { locale: ptBR })})`
                                  }
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 text-red-600" />
                                <span className="text-red-600">Ausente</span>
                                {presenca.justificativa_ausencia && (
                                  <span className="text-gray-600">
                                    - {presenca.justificativa_ausencia}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        )}
                        
                        {/* Confirmation Status */}
                        {convocacao && (
                          <div className="flex items-center gap-1 text-xs">
                            {getConfirmacaoIcon(convocacao.confirmacao_presenca)}
                            <span className="text-gray-600">
                              {getConfirmacaoLabel(convocacao.confirmacao_presenca)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {presenca?.presente && presenca.horario_chegada && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(presenca.horario_chegada), 'HH:mm', { locale: ptBR })}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Absence Justification Dialog */}
      <Dialog 
        open={justificativaDialog.open} 
        onOpenChange={(open) => setJustificativaDialog(prev => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Justificar Ausência</DialogTitle>
            <DialogDescription>
              Registre o motivo da ausência de {justificativaDialog.nome}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Justificativa</label>
              <Textarea
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Digite o motivo da ausência..."
                className="mt-1"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setJustificativaDialog({ open: false, conselheiro_id: '', nome: '' })}
              >
                Cancelar
              </Button>
              <Button onClick={handleJustificarAusencia} disabled={marcarPresenca.isPending}>
                <MessageSquare className="h-4 w-4 mr-2" />
                {marcarPresenca.isPending ? 'Salvando...' : 'Registrar Ausência'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}