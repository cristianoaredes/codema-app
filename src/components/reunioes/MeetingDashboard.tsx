import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Users, 
  FileText,
  Bell,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { QuorumIndicator, QuorumData } from './QuorumIndicator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';

export type MeetingStatus = 'scheduled' | 'in_progress' | 'paused' | 'completed' | 'cancelled';

interface MeetingDashboardProps {
  meetingId: string;
  meetingTitle: string;
  meetingStatus: MeetingStatus;
  quorumData?: QuorumData;
  startTime?: Date;
  isRealTimeConnected?: boolean;
  onStatusChange?: (newStatus: MeetingStatus) => Promise<void>;
  onRefreshQuorum?: () => Promise<void>;
  onSendNotification?: () => Promise<void>;
  onGenerateMinutes?: () => Promise<void>;
}

export function MeetingDashboard({
  meetingId,
  meetingTitle,
  meetingStatus,
  quorumData,
  startTime,
  isRealTimeConnected = false,
  onStatusChange,
  onRefreshQuorum,
  onSendNotification,
  onGenerateMinutes
}: MeetingDashboardProps) {
  const { profile } = useAuth();
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [elapsed, setElapsed] = useState<string>('00:00:00');

  // Verificar permissões do usuário
  const canControlMeeting = profile?.role === 'admin' || 
                           profile?.role === 'presidente' || 
                           profile?.role === 'secretario';

  // Calcular tempo decorrido
  React.useEffect(() => {
    if (meetingStatus === 'in_progress' && startTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - startTime.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setElapsed(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [meetingStatus, startTime]);

  const getStatusInfo = (status: MeetingStatus) => {
    switch (status) {
      case 'scheduled':
        return {
          label: 'Agendada',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          icon: <Clock className="h-4 w-4" />,
          variant: 'secondary' as const
        };
      case 'in_progress':
        return {
          label: 'Em Andamento',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          icon: <Play className="h-4 w-4" />,
          variant: 'default' as const
        };
      case 'paused':
        return {
          label: 'Pausada',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          icon: <Pause className="h-4 w-4" />,
          variant: 'secondary' as const
        };
      case 'completed':
        return {
          label: 'Concluída',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          icon: <CheckCircle className="h-4 w-4" />,
          variant: 'outline' as const
        };
      case 'cancelled':
        return {
          label: 'Cancelada',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          icon: <Square className="h-4 w-4" />,
          variant: 'destructive' as const
        };
    }
  };

  const statusInfo = getStatusInfo(meetingStatus);

  const handleStatusChange = async (newStatus: MeetingStatus) => {
    if (!onStatusChange) return;
    
    setIsChangingStatus(true);
    try {
      await onStatusChange(newStatus);
    } catch (error) {
      console.error('Erro ao alterar status da reunião:', error);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const getAvailableActions = () => {
    const actions = [];

    switch (meetingStatus) {
      case 'scheduled':
        if (quorumData?.hasQuorum) {
          actions.push({
            label: 'Iniciar Reunião',
            icon: <Play className="h-4 w-4" />,
            action: () => handleStatusChange('in_progress'),
            variant: 'default' as const,
            disabled: isChangingStatus
          });
        }
        break;
        
      case 'in_progress':
        actions.push({
          label: 'Pausar',
          icon: <Pause className="h-4 w-4" />,
          action: () => handleStatusChange('paused'),
          variant: 'outline' as const,
          disabled: isChangingStatus
        });
        actions.push({
          label: 'Encerrar',
          icon: <Square className="h-4 w-4" />,
          action: () => handleStatusChange('completed'),
          variant: 'destructive' as const,
          disabled: isChangingStatus
        });
        break;
        
      case 'paused':
        actions.push({
          label: 'Retomar',
          icon: <Play className="h-4 w-4" />,
          action: () => handleStatusChange('in_progress'),
          variant: 'default' as const,
          disabled: isChangingStatus
        });
        actions.push({
          label: 'Encerrar',
          icon: <Square className="h-4 w-4" />,
          action: () => handleStatusChange('completed'),
          variant: 'destructive' as const,
          disabled: isChangingStatus
        });
        break;
    }

    return actions;
  };

  const availableActions = getAvailableActions();

  return (
    <div className="space-y-6">
      {/* Status Principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Controle da Reunião
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {meetingTitle}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isRealTimeConnected && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-muted-foreground">Conectado</span>
                </div>
              )}
              <Badge variant={statusInfo.variant} className="gap-1">
                {statusInfo.icon}
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Timer da Reunião */}
          {meetingStatus === 'in_progress' && (
            <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
              <div className="text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-mono font-bold text-green-700">
                  {elapsed}
                </div>
                <p className="text-sm text-green-600">Tempo de reunião</p>
              </div>
            </div>
          )}

          {/* Alertas Importantes */}
          {meetingStatus === 'scheduled' && quorumData && !quorumData.hasQuorum && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Quórum insuficiente para iniciar a reunião. 
                Necessários {quorumData.requiredQuorum - quorumData.presentMembers} conselheiros adicionais.
              </AlertDescription>
            </Alert>
          )}

          {meetingStatus === 'scheduled' && quorumData?.hasQuorum && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Quórum atingido! A reunião pode ser iniciada.
              </AlertDescription>
            </Alert>
          )}

          {/* Ações de Controle */}
          {canControlMeeting && availableActions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availableActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  size="sm"
                  onClick={action.action}
                  disabled={action.disabled}
                  className="gap-2"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Ações Auxiliares */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {onRefreshQuorum && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefreshQuorum}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar Quórum
              </Button>
            )}
            
            {onSendNotification && canControlMeeting && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSendNotification}
                className="gap-2"
              >
                <Bell className="h-4 w-4" />
                Notificar Ausentes
              </Button>
            )}
            
            {onGenerateMinutes && canControlMeeting && meetingStatus === 'completed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onGenerateMinutes}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Gerar Ata
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quórum Indicator */}
      {quorumData && (
        <QuorumIndicator 
          quorumData={quorumData}
          isRealTime={isRealTimeConnected}
          showDetails={true}
          size="md"
        />
      )}
    </div>
  );
}

export default MeetingDashboard;