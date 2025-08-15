import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Clock, 
  FileText,
  User,
  MapPin,
  Camera,
  Upload,
  ExternalLink,
  AlertTriangle,
  Shield,
  Calendar,
  MessageCircle,
  ArrowRight,
  Play,
  Pause,
  CheckCircle,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Denuncia } from "@/hooks/useOuvidoriaDenuncias";

interface DenunciaWorkflowProps {
  denuncia: Denuncia;
  onStatusUpdate: (novoStatus: string, dados?: any) => void;
  canManage: boolean;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  icon: React.ReactNode;
  actions?: string[];
}

const DenunciaWorkflow: React.FC<DenunciaWorkflowProps> = ({
  denuncia,
  onStatusUpdate,
  canManage
}) => {
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [actionData, setActionData] = useState<any>({});
  const [uploading, setUploading] = useState(false);

  // Mapeamento de status para etapas do workflow
  const getWorkflowSteps = (): WorkflowStep[] => {
    const steps: WorkflowStep[] = [
      {
        id: 'recebida',
        title: 'Denúncia Recebida',
        description: 'Denúncia registrada no sistema',
        status: 'completed',
        icon: <FileText className="h-4 w-4" />
      },
      {
        id: 'triagem',
        title: 'Triagem e Análise',
        description: 'Análise preliminar da denúncia',
        status: denuncia.status === 'recebida' ? 'current' : 
                ['em_apuracao', 'fiscalizacao_agendada', 'fiscalizacao_realizada', 'procedente', 'improcedente'].includes(denuncia.status) ? 'completed' : 'pending',
        icon: <User className="h-4 w-4" />,
        actions: canManage ? ['iniciar_apuracao', 'arquivar', 'transferir'] : undefined
      },
      {
        id: 'fiscalizacao',
        title: 'Fiscalização',
        description: 'Vistoria no local da denúncia',
        status: ['fiscalizacao_agendada', 'fiscalizacao_realizada'].includes(denuncia.status) ? 'current' :
                ['procedente', 'improcedente'].includes(denuncia.status) ? 'completed' : 'pending',
        icon: <Shield className="h-4 w-4" />,
        actions: canManage ? ['agendar_fiscalizacao', 'realizar_fiscalizacao', 'solicitar_documentos'] : undefined
      },
      {
        id: 'relatorio',
        title: 'Relatório Final',
        description: 'Elaboração do parecer técnico',
        status: denuncia.status === 'fiscalizacao_realizada' ? 'current' :
                ['procedente', 'improcedente'].includes(denuncia.status) ? 'completed' : 'pending',
        icon: <FileText className="h-4 w-4" />,
        actions: canManage ? ['gerar_relatorio', 'solicitar_revisao'] : undefined
      },
      {
        id: 'conclusao',
        title: 'Conclusão',
        description: 'Finalização do processo',
        status: ['procedente', 'improcedente', 'arquivada'].includes(denuncia.status) ? 'completed' : 'pending',
        icon: denuncia.status === 'procedente' ? <AlertTriangle className="h-4 w-4" /> : 
              denuncia.status === 'improcedente' ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />,
        actions: canManage ? ['finalizar_procedente', 'finalizar_improcedente'] : undefined
      }
    ];

    return steps;
  };

  const getProgressPercentage = () => {
    const steps = getWorkflowSteps();
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    return (completedSteps / steps.length) * 100;
  };

  const handleAction = async (action: string) => {
    const actionConfigs = {
      iniciar_apuracao: {
        title: 'Iniciar Apuração',
        description: 'Atribuir fiscal responsável e iniciar processo de apuração',
        fields: ['fiscal_responsavel_id', 'prazo_apuracao', 'observacoes']
      },
      agendar_fiscalizacao: {
        title: 'Agendar Fiscalização',
        description: 'Definir data e responsável pela vistoria',
        fields: ['data_fiscalizacao', 'fiscal_responsavel_id', 'observacoes']
      },
      realizar_fiscalizacao: {
        title: 'Realizar Fiscalização',
        description: 'Registrar resultado da vistoria realizada',
        fields: ['relatorio_fiscalizacao', 'evidencias', 'conclusao_fiscal']
      },
      gerar_relatorio: {
        title: 'Gerar Relatório Final',
        description: 'Elaborar parecer técnico final',
        fields: ['relatorio_final', 'recomendacoes', 'penalidades']
      },
      finalizar_procedente: {
        title: 'Finalizar como Procedente',
        description: 'Confirmar irregularidade e aplicar penalidades',
        fields: ['relatorio_final', 'penalidades_aplicadas', 'prazo_regularizacao']
      },
      finalizar_improcedente: {
        title: 'Finalizar como Improcedente',
        description: 'Arquivar denúncia por falta de fundamento',
        fields: ['relatorio_final', 'justificativa']
      }
    };

    const config = actionConfigs[action as keyof typeof actionConfigs];
    if (!config) return;

    setSelectedAction(action);
    setActionData({ action, config });
    setShowActionDialog(true);
  };

  const executeAction = async () => {
    try {
      let novoStatus = denuncia.status;
      
      switch (selectedAction) {
        case 'iniciar_apuracao':
          novoStatus = 'em_apuracao';
          break;
        case 'agendar_fiscalizacao':
          novoStatus = 'fiscalizacao_agendada';
          break;
        case 'realizar_fiscalizacao':
          novoStatus = 'fiscalizacao_realizada';
          break;
        case 'finalizar_procedente':
          novoStatus = 'procedente';
          break;
        case 'finalizar_improcedente':
          novoStatus = 'improcedente';
          break;
      }

      await onStatusUpdate(novoStatus, actionData);
      setShowActionDialog(false);
      setActionData({});
    } catch (error) {
      console.error('Erro ao executar ação:', error);
    }
  };

  const steps = getWorkflowSteps();
  const currentStep = steps.find(step => step.status === 'current');

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Status do Processo: {denuncia.protocolo}
              </CardTitle>
              <CardDescription>
                Acompanhe o andamento da fiscalização ambiental
              </CardDescription>
            </div>
            <Badge 
              variant={denuncia.status === 'procedente' ? 'destructive' : 
                      denuncia.status === 'improcedente' ? 'secondary' :
                      ['fiscalizacao_agendada', 'fiscalizacao_realizada'].includes(denuncia.status) ? 'default' : 'outline'}
            >
              {currentStep?.title || 'Em andamento'}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso do processo</span>
              <span>{Math.round(getProgressPercentage())}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Workflow Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={step.id} className={step.status === 'current' ? 'border-primary' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    step.status === 'completed' ? 'bg-green-100 text-green-600' :
                    step.status === 'current' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : step.icon}
                  </div>
                  
                  <div>
                    <CardTitle className="text-base">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {step.status === 'completed' && (
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Concluído
                    </Badge>
                  )}
                  
                  {step.status === 'current' && (
                    <Badge variant="default">
                      <Play className="h-3 w-3 mr-1" />
                      Em andamento
                    </Badge>
                  )}

                  {step.actions && canManage && step.status === 'current' && (
                    <div className="flex gap-1">
                      {step.actions.map(action => (
                        <Button
                          key={action}
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(action)}
                        >
                          {action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            {/* Step Content */}
            {step.status !== 'pending' && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Informações específicas de cada etapa */}
                  {step.id === 'fiscalizacao' && denuncia.data_fiscalizacao && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Fiscalização realizada em {format(new Date(denuncia.data_fiscalizacao), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  )}

                  {step.id === 'fiscalizacao' && denuncia.fiscal_responsavel && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Fiscal responsável: {denuncia.fiscal_responsavel.full_name}</span>
                    </div>
                  )}

                  {denuncia.relatorio_fiscalizacao && (step.id === 'fiscalizacao' || step.id === 'relatorio') && (
                    <div className="bg-muted/50 border rounded p-3">
                      <h5 className="font-medium mb-1 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Relatório de Fiscalização
                      </h5>
                      <p className="text-sm">{denuncia.relatorio_fiscalizacao}</p>
                    </div>
                  )}

                  {/* Timeline visual */}
                  {index < steps.length - 1 && (
                    <div className="flex justify-center">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{actionData.config?.title}</DialogTitle>
            <DialogDescription>{actionData.config?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Campos dinâmicos baseados na ação */}
            {actionData.config?.fields?.includes('fiscal_responsavel_id') && (
              <div>
                <Label>Fiscal Responsável</Label>
                <Select onValueChange={(value) => setActionData({...actionData, fiscal_responsavel_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fiscal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fiscal-1">João Silva</SelectItem>
                    <SelectItem value="fiscal-2">Maria Santos</SelectItem>
                    <SelectItem value="fiscal-3">Pedro Oliveira</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {actionData.config?.fields?.includes('data_fiscalizacao') && (
              <div>
                <Label>Data da Fiscalização</Label>
                <Input
                  type="datetime-local"
                  onChange={(e) => setActionData({...actionData, data_fiscalizacao: e.target.value})}
                />
              </div>
            )}

            {actionData.config?.fields?.includes('relatorio_fiscalizacao') && (
              <div>
                <Label>Relatório da Fiscalização</Label>
                <Textarea
                  placeholder="Descreva os achados da fiscalização..."
                  rows={4}
                  onChange={(e) => setActionData({...actionData, relatorio_fiscalizacao: e.target.value})}
                />
              </div>
            )}

            {actionData.config?.fields?.includes('penalidades') && (
              <div>
                <Label>Penalidades Aplicadas</Label>
                <Textarea
                  placeholder="Descreva as penalidades aplicadas..."
                  rows={3}
                  onChange={(e) => setActionData({...actionData, penalidades: e.target.value})}
                />
              </div>
            )}

            {actionData.config?.fields?.includes('observacoes') && (
              <div>
                <Label>Observações</Label>
                <Textarea
                  placeholder="Observações adicionais..."
                  rows={3}
                  onChange={(e) => setActionData({...actionData, observacoes: e.target.value})}
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={executeAction} disabled={uploading}>
                {uploading ? "Processando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DenunciaWorkflow;