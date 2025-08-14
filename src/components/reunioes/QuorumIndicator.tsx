import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface QuorumData {
  totalMembers: number;
  presentMembers: number;
  requiredQuorum: number;
  hasQuorum: boolean;
  percentage: number;
  lastUpdate: Date;
}

interface QuorumIndicatorProps {
  quorumData: QuorumData;
  isRealTime?: boolean;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const QuorumIndicator = React.memo(function QuorumIndicator({ 
  quorumData, 
  isRealTime = false, 
  showDetails = true,
  size = 'md'
}: QuorumIndicatorProps) {
  const { 
    totalMembers, 
    presentMembers, 
    requiredQuorum, 
    hasQuorum, 
    percentage,
    lastUpdate
  } = quorumData;

  // Memoizar cálculos derivados
  const derivedData = useMemo(() => ({
    absentMembers: totalMembers - presentMembers,
    membersNeeded: Math.max(0, requiredQuorum - presentMembers)
  }), [totalMembers, presentMembers, requiredQuorum]);

  // Memoizar status do quórum
  const status = useMemo(() => {
    if (hasQuorum) {
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Quórum Atingido',
        variant: 'default' as const,
        color: 'text-green-600'
      };
    } else if (presentMembers === 0) {
      return {
        icon: <XCircle className="h-4 w-4" />,
        label: 'Sem Presenças',
        variant: 'secondary' as const,
        color: 'text-gray-500'
      };
    } else {
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        label: 'Quórum Insuficiente',
        variant: 'destructive' as const,
        color: 'text-red-600'
      };
    }
  }, [hasQuorum, presentMembers]);

  // Memoizar cor da progress bar
  const progressColor = useMemo(() => {
    if (hasQuorum) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  }, [hasQuorum, percentage]);

  // Memoizar formatação de tempo
  const formattedLastUpdate = useMemo(() => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes === 1) return 'Há 1 minuto';
    if (diffMinutes < 60) return `Há ${diffMinutes} minutos`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return 'Há 1 hora';
    if (diffHours < 24) return `Há ${diffHours} horas`;
    
    return lastUpdate.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [lastUpdate]);

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg bg-white">
        <div className="flex items-center gap-2">
          {status.icon}
          <span className={`text-sm font-medium ${status.color}`}>
            {presentMembers}/{totalMembers}
          </span>
        </div>
        <Badge variant={status.variant} className="text-xs">
          {hasQuorum ? 'Quórum OK' : `Faltam ${derivedData.membersNeeded}`}
        </Badge>
        {isRealTime && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formattedLastUpdate}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={size === 'lg' ? 'w-full' : 'w-auto'}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Controle de Quórum
          </CardTitle>
          {isRealTime && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">Tempo Real</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Principal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status.icon}
            <span className={`font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          <Badge variant={status.variant}>
            {percentage.toFixed(1)}%
          </Badge>
        </div>

        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Presentes: {presentMembers}</span>
            <span>Necessário: {requiredQuorum}</span>
          </div>
          <div className="relative">
            <Progress value={percentage} className="h-3" />
            <div 
              className={`absolute top-0 left-0 h-3 rounded transition-all duration-300 ${progressColor}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
            {/* Linha indicativa do quórum necessário */}
            <div 
              className="absolute top-0 h-3 w-0.5 bg-black/20"
              style={{ left: `${(requiredQuorum / totalMembers) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span className="absolute transform -translate-x-1/2" 
                  style={{ left: `${(requiredQuorum / totalMembers) * 100}%` }}>
              Quórum
            </span>
            <span>{totalMembers}</span>
          </div>
        </div>

        {showDetails && (
          <>
            {/* Estatísticas Detalhadas */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-green-600">
                  <UserCheck className="h-4 w-4" />
                  <span className="font-semibold">{presentMembers}</span>
                </div>
                <span className="text-xs text-muted-foreground">Presentes</span>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-red-600">
                  <UserX className="h-4 w-4" />
                  <span className="font-semibold">{derivedData.absentMembers}</span>
                </div>
                <span className="text-xs text-muted-foreground">Ausentes</span>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600">
                  <Users className="h-4 w-4" />
                  <span className="font-semibold">{totalMembers}</span>
                </div>
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
            </div>

            {/* Alert para quórum insuficiente */}
            {!hasQuorum && presentMembers > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {derivedData.membersNeeded === 1 
                    ? `Necessário mais 1 conselheiro para atingir o quórum.`
                    : `Necessários mais ${derivedData.membersNeeded} conselheiros para atingir o quórum.`
                  }
                </AlertDescription>
              </Alert>
            )}

            {/* Última atualização */}
            {isRealTime && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                <Clock className="h-3 w-3" />
                <span>Última atualização: {formattedLastUpdate}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
});

export default QuorumIndicator;