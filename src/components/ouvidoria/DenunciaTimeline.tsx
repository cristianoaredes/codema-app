import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Clock,
  FileText,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Calendar,
  MapPin,
  Camera,
  Mail,
  Phone,
  Edit,
  Trash,
  MoreVertical,
  Download,
  Share2,
  Flag
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Denuncia } from "@/hooks/useOuvidoriaDenuncias";

interface TimelineEvent {
  id: string;
  type: 'created' | 'updated' | 'status_change' | 'comment' | 'document' | 'fiscal_assigned' | 'inspection' | 'report' | 'resolution';
  title: string;
  description?: string;
  timestamp: string;
  user?: {
    name: string;
    role: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
  icon?: React.ReactNode;
  color?: string;
}

interface DenunciaTimelineProps {
  denuncia: Denuncia;
  events?: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
  canAddEvent?: boolean;
}

const DenunciaTimeline: React.FC<DenunciaTimelineProps> = ({
  denuncia,
  events = [],
  onEventClick,
  canAddEvent = false
}) => {
  // Gerar eventos baseados na denúncia
  const generateEvents = (): TimelineEvent[] => {
    const generatedEvents: TimelineEvent[] = [
      {
        id: '1',
        type: 'created',
        title: 'Denúncia Registrada',
        description: `Protocolo ${denuncia.protocolo} gerado automaticamente`,
        timestamp: denuncia.created_at,
        user: denuncia.denunciante_nome ? {
          name: denuncia.denunciante_nome,
          role: 'Denunciante'
        } : {
          name: 'Anônimo',
          role: 'Denunciante'
        },
        icon: <FileText className="h-4 w-4" />,
        color: 'bg-blue-500',
        metadata: {
          tipo: denuncia.tipo_denuncia,
          prioridade: denuncia.prioridade,
          local: denuncia.local_ocorrencia
        }
      }
    ];

    // Adicionar evento de atribuição de fiscal
    if (denuncia.fiscal_responsavel_id) {
      generatedEvents.push({
        id: '2',
        type: 'fiscal_assigned',
        title: 'Fiscal Atribuído',
        description: `${denuncia.fiscal_responsavel?.full_name || 'Fiscal'} foi designado para apuração`,
        timestamp: denuncia.updated_at || denuncia.created_at,
        user: {
          name: denuncia.fiscal_responsavel?.full_name || 'Fiscal',
          role: 'Fiscal Ambiental'
        },
        icon: <Shield className="h-4 w-4" />,
        color: 'bg-green-500'
      });
    }

    // Adicionar evento de mudança de status
    if (denuncia.status !== 'recebida') {
      const statusLabels: Record<string, string> = {
        em_apuracao: 'Em Apuração',
        fiscalizacao_agendada: 'Fiscalização Agendada',
        fiscalizacao_realizada: 'Fiscalização Realizada',
        procedente: 'Denúncia Procedente',
        improcedente: 'Denúncia Improcedente',
        arquivada: 'Denúncia Arquivada'
      };

      generatedEvents.push({
        id: '3',
        type: 'status_change',
        title: 'Status Atualizado',
        description: `Status alterado para "${statusLabels[denuncia.status] || denuncia.status}"`,
        timestamp: denuncia.updated_at || denuncia.created_at,
        icon: <Clock className="h-4 w-4" />,
        color: denuncia.status === 'procedente' ? 'bg-red-500' : 
               denuncia.status === 'improcedente' ? 'bg-green-500' : 
               'bg-orange-500'
      });
    }

    // Adicionar evento de fiscalização
    if (denuncia.data_fiscalizacao) {
      generatedEvents.push({
        id: '4',
        type: 'inspection',
        title: 'Fiscalização Realizada',
        description: 'Vistoria in loco concluída',
        timestamp: denuncia.data_fiscalizacao,
        user: denuncia.fiscal_responsavel ? {
          name: denuncia.fiscal_responsavel.full_name,
          role: 'Fiscal Ambiental'
        } : undefined,
        icon: <MapPin className="h-4 w-4" />,
        color: 'bg-purple-500',
        metadata: {
          local: denuncia.local_ocorrencia,
          coordenadas: denuncia.latitude && denuncia.longitude ? 
            `${denuncia.latitude}, ${denuncia.longitude}` : null
        }
      });
    }

    // Adicionar evento de relatório
    if (denuncia.relatorio_fiscalizacao) {
      generatedEvents.push({
        id: '5',
        type: 'report',
        title: 'Relatório de Fiscalização',
        description: 'Relatório técnico elaborado',
        timestamp: denuncia.data_fiscalizacao || denuncia.updated_at || denuncia.created_at,
        icon: <FileText className="h-4 w-4" />,
        color: 'bg-indigo-500',
        metadata: {
          preview: denuncia.relatorio_fiscalizacao.substring(0, 100) + '...'
        }
      });
    }

    // Adicionar eventos customizados se fornecidos
    if (events.length > 0) {
      generatedEvents.push(...events);
    }

    // Ordenar por timestamp
    return generatedEvents.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const timelineEvents = generateEvents();

  const getEventIcon = (event: TimelineEvent) => {
    if (event.icon) return event.icon;
    
    switch (event.type) {
      case 'created': return <FileText className="h-4 w-4" />;
      case 'updated': return <Edit className="h-4 w-4" />;
      case 'status_change': return <Clock className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'fiscal_assigned': return <Shield className="h-4 w-4" />;
      case 'inspection': return <MapPin className="h-4 w-4" />;
      case 'report': return <FileText className="h-4 w-4" />;
      case 'resolution': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (event: TimelineEvent) => {
    if (event.color) return event.color;
    
    switch (event.type) {
      case 'created': return 'bg-blue-500';
      case 'fiscal_assigned': return 'bg-green-500';
      case 'inspection': return 'bg-purple-500';
      case 'report': return 'bg-indigo-500';
      case 'resolution': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Linha do Tempo
            </CardTitle>
            <CardDescription>
              Histórico completo de eventos da denúncia
            </CardDescription>
          </div>
          
          {canAddEvent && (
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Adicionar Evento
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-8 relative">
          {/* Linha vertical conectando eventos */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
          
          {timelineEvents.map((event, index) => (
            <div key={event.id} className="relative flex gap-4">
              {/* Ícone do evento */}
              <div className={`
                relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-white
                ${getEventColor(event)}
              `}>
                {getEventIcon(event)}
              </div>
              
              {/* Conteúdo do evento */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium leading-none">{event.title}</h4>
                    {event.description && (
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.timestamp), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </span>
                    
                    {onEventClick && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEventClick(event)}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Metadados do evento */}
                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {event.metadata.tipo && (
                      <Badge variant="outline" className="text-xs">
                        {event.metadata.tipo}
                      </Badge>
                    )}
                    {event.metadata.prioridade && (
                      <Badge 
                        variant={event.metadata.prioridade === 'urgente' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {event.metadata.prioridade}
                      </Badge>
                    )}
                    {event.metadata.local && (
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {event.metadata.local}
                      </Badge>
                    )}
                    {event.metadata.coordenadas && (
                      <Badge variant="outline" className="text-xs">
                        📍 {event.metadata.coordenadas}
                      </Badge>
                    )}
                  </div>
                )}
                
                {/* Preview de conteúdo */}
                {event.metadata?.preview && (
                  <div className="bg-muted/50 rounded-lg p-3 text-sm">
                    {event.metadata.preview}
                  </div>
                )}
                
                {/* Informações do usuário */}
                {event.user && (
                  <div className="flex items-center gap-2 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={event.user.avatar} />
                      <AvatarFallback>
                        {event.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{event.user.name}</span>
                    <span className="text-muted-foreground">• {event.user.role}</span>
                  </div>
                )}
                
                {/* Data e hora completa */}
                <div className="text-xs text-muted-foreground">
                  {format(new Date(event.timestamp), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
              </div>
            </div>
          ))}
          
          {/* Fim da timeline */}
          {timelineEvents.length > 0 && (
            <div className="relative flex gap-4">
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Flag className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Início do processo
                </p>
              </div>
            </div>
          )}
          
          {/* Mensagem vazia */}
          {timelineEvents.length === 0 && (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Nenhum evento registrado ainda
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DenunciaTimeline;