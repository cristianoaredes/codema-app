import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User,
  Crown,
  FileText,
  Users,
  Eye,
  Edit,
  Gavel,
  Clock,
  MessageSquare,
  Vote,
  UserCheck,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import MeetingDashboard, { MeetingStatus } from './MeetingDashboard';
import { QuorumData } from './QuorumIndicator';
import { Alert, AlertDescription } from '@/components/ui/alert';

type UserRole = 'admin' | 'presidente' | 'secretario' | 'conselheiro' | 'citizen';

interface MeetingData {
  id: string;
  titulo: string;
  status: MeetingStatus;
  data_reuniao: string;
  local: string;
  pauta?: string;
  startTime?: Date;
}

interface RoleBasedMeetingViewProps {
  meeting: MeetingData;
  quorumData?: QuorumData;
  isRealTimeConnected?: boolean;
  onStatusChange?: (newStatus: MeetingStatus) => Promise<void>;
  onRefreshQuorum?: () => Promise<void>;
  onMarkAttendance?: (conselheiro_id: string, presente: boolean) => Promise<void>;
  onGenerateMinutes?: () => Promise<void>;
  onSendNotification?: () => Promise<void>;
  onDownloadAttendanceList?: () => Promise<void>;
  onPreviewAttendanceList?: () => Promise<void>;
}

/**
 * Componente que adapta a interface baseado no papel do usuário
 */
export function RoleBasedMeetingView({
  meeting,
  quorumData,
  isRealTimeConnected = false,
  onStatusChange,
  onRefreshQuorum,
  onMarkAttendance,
  onGenerateMinutes,
  onSendNotification,
  onDownloadAttendanceList,
  onPreviewAttendanceList
}: RoleBasedMeetingViewProps) {
  const { profile } = useAuth();
  const userRole = profile?.role as UserRole || 'citizen';

  const getRoleInfo = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          title: 'Administrador do Sistema',
          icon: <Shield className="h-5 w-5" />,
          color: 'text-purple-600',
          description: 'Controle total do sistema'
        };
      case 'presidente':
        return {
          title: 'Presidente do CODEMA',
          icon: <Crown className="h-5 w-5" />,
          color: 'text-yellow-600',
          description: 'Conduz e preside as reuniões'
        };
      case 'secretario':
        return {
          title: 'Secretário(a) Executivo(a)',
          icon: <FileText className="h-5 w-5" />,
          color: 'text-blue-600',
          description: 'Registra e documenta as reuniões'
        };
      case 'conselheiro':
        return {
          title: 'Conselheiro(a)',
          icon: <User className="h-5 w-5" />,
          color: 'text-green-600',
          description: 'Participa ativamente das reuniões'
        };
      case 'citizen':
        return {
          title: 'Cidadão',
          icon: <Eye className="h-5 w-5" />,
          color: 'text-gray-600',
          description: 'Visualização das informações públicas'
        };
      default:
        return {
          title: 'Usuário',
          icon: <User className="h-5 w-5" />,
          color: 'text-gray-600',
          description: 'Acesso básico'
        };
    }
  };

  const roleInfo = getRoleInfo(userRole);

  /**
   * Componente específico para Presidente
   */
  const PresidentView = () => (
    <div className="space-y-6">
      {/* Dashboard de Controle */}
      <MeetingDashboard
        meetingId={meeting.id}
        meetingTitle={meeting.titulo}
        meetingStatus={meeting.status}
        quorumData={quorumData}
        startTime={meeting.startTime}
        isRealTimeConnected={isRealTimeConnected}
        onStatusChange={onStatusChange}
        onRefreshQuorum={onRefreshQuorum}
        onSendNotification={onSendNotification}
        onGenerateMinutes={onGenerateMinutes}
      />

      {/* Ferramentas do Presidente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Ferramentas da Presidência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Vote className="h-4 w-4" />
              Iniciar Votação
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Abrir Discussão
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Clock className="h-4 w-4" />
              Controlar Tempo
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Users className="h-4 w-4" />
              Conceder Palavra
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  /**
   * Componente específico para Secretário
   */
  const SecretaryView = () => (
    <div className="space-y-6">
      {/* Controle de Quórum (para auxiliar o presidente) */}
      {quorumData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Controle de Presença
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Presentes: {quorumData.presentMembers}/{quorumData.totalMembers}</span>
                <Badge variant={quorumData.hasQuorum ? 'default' : 'destructive'}>
                  {quorumData.hasQuorum ? 'Quórum OK' : 'Sem Quórum'}
                </Badge>
              </div>
              <div className="flex gap-2">
                {onDownloadAttendanceList && (
                  <Button size="sm" onClick={onDownloadAttendanceList}>
                    Baixar Lista de Presença
                  </Button>
                )}
                {onRefreshQuorum && (
                  <Button variant="outline" size="sm" onClick={onRefreshQuorum}>
                    Atualizar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ferramentas do Secretário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ferramentas da Secretaria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              Registrar Ata
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <UserCheck className="h-4 w-4" />
              Marcar Presenças
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="h-4 w-4" />
              Gerar Documentos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  /**
   * Componente específico para Conselheiro
   */
  const CouncilMemberView = () => (
    <div className="space-y-6">
      {/* Status da Reunião */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Sua Participação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Status da Reunião:</span>
              <Badge>{meeting.status === 'in_progress' ? 'Em Andamento' : 'Agendada'}</Badge>
            </div>
            {quorumData && (
              <div className="flex justify-between items-center">
                <span>Quórum:</span>
                <Badge variant={quorumData.hasQuorum ? 'default' : 'destructive'}>
                  {quorumData.presentMembers}/{quorumData.totalMembers} presentes
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ações do Conselheiro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Suas Ações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Solicitar Palavra
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="h-4 w-4" />
              Ver Documentos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  /**
   * Componente específico para Cidadão
   */
  const CitizenView = () => (
    <div className="space-y-6">
      <Alert>
        <Eye className="h-4 w-4" />
        <AlertDescription>
          Você está visualizando informações públicas desta reunião.
        </AlertDescription>
      </Alert>

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Informações da Reunião
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div><strong>Status:</strong> {meeting.status}</div>
            <div><strong>Data:</strong> {new Date(meeting.data_reuniao).toLocaleString('pt-BR')}</div>
            <div><strong>Local:</strong> {meeting.local}</div>
            {quorumData && (
              <div><strong>Presença:</strong> {quorumData.presentMembers} de {quorumData.totalMembers} conselheiros</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  /**
   * Renderiza o componente baseado no papel do usuário
   */
  const renderRoleSpecificView = () => {
    switch (userRole) {
      case 'admin':
      case 'presidente':
        return <PresidentView />;
      case 'secretario':
        return <SecretaryView />;
      case 'conselheiro':
        return <CouncilMemberView />;
      case 'citizen':
      default:
        return <CitizenView />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com informação do papel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`${roleInfo.color}`}>
                {roleInfo.icon}
              </div>
              <div>
                <h3 className="font-semibold">{roleInfo.title}</h3>
                <p className="text-sm text-muted-foreground">{roleInfo.description}</p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1">
              {roleInfo.icon}
              {userRole}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Interface específica por papel */}
      {renderRoleSpecificView()}
    </div>
  );
}

export default RoleBasedMeetingView;