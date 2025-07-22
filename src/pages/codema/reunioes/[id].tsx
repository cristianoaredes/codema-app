import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Send, 
  CheckSquare, 
  FileText,
  Settings,
  Clock
} from 'lucide-react';
import { useReuniao, useConvocacoes } from '@/hooks';
import { ConvocacaoForm, PresencasManager } from '@/components/codema/reunioes';
import { useAuth } from '@/hooks';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ReuniaoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [convocacaoDialogOpen, setConvocacaoDialogOpen] = useState(false);

  const { data: reuniao, isLoading } = useReuniao(id!);
  const { data: convocacoes = [] } = useConvocacoes(id);

  const canManage = profile?.role && ['admin', 'secretario', 'presidente'].includes(profile.role);
  const reuniaoDate = reuniao ? new Date(reuniao.data_reuniao) : null;
  const isUpcoming = reuniaoDate ? reuniaoDate > new Date() : false;
  const isToday = reuniaoDate ? 
    format(reuniaoDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') : false;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada': return 'bg-blue-100 text-blue-800';
      case 'realizada': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'ordinaria': return 'bg-primary/10 text-primary';
      case 'extraordinaria': return 'bg-orange-100 text-orange-800';
      case 'audiencia_publica': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'ordinaria': return 'Ordinária';
      case 'extraordinaria': return 'Extraordinária';
      case 'audiencia_publica': return 'Audiência Pública';
      default: return tipo;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'agendada': return 'Agendada';
      case 'realizada': return 'Realizada';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const convocacoesStats = {
    total: convocacoes.length,
    enviadas: convocacoes.filter(c => c.status === 'enviada').length,
    confirmadas: convocacoes.filter(c => c.confirmacao_presenca === 'confirmada').length,
    rejeitadas: convocacoes.filter(c => c.confirmacao_presenca === 'rejeitada').length,
    pendentes: convocacoes.filter(c => c.confirmacao_presenca === 'pendente').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando reunião...</p>
        </div>
      </div>
    );
  }

  if (!reuniao) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Reunião não encontrada</h1>
          <Button onClick={() => navigate('/reunioes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Reuniões
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/reunioes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{reuniao.titulo}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getTipoColor(reuniao.tipo)}>
                {getTipoLabel(reuniao.tipo)}
              </Badge>
              <Badge className={getStatusColor(reuniao.status)}>
                {getStatusLabel(reuniao.status)}
              </Badge>
              {isToday && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Clock className="h-3 w-3 mr-1" />
                  Hoje
                </Badge>
              )}
            </div>
          </div>
        </div>

        {canManage && isUpcoming && (
          <div className="flex gap-2">
            <Dialog open={convocacaoDialogOpen} onOpenChange={setConvocacaoDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Convocações
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Enviar Convocações</DialogTitle>
                  <DialogDescription>
                    Selecione os conselheiros e método de envio para as convocações
                  </DialogDescription>
                </DialogHeader>
                <ConvocacaoForm
                  reuniao_id={reuniao.id}
                  tipo_reuniao={reuniao.tipo as 'ordinaria' | 'extraordinaria' | 'publica'}
                  onSuccess={() => setConvocacaoDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>

            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        )}
      </div>

      {/* Meeting Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Informações da Reunião</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Data e Hora</p>
                <p className="text-gray-600">
                  {format(new Date(reuniao.data_reuniao), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Local</p>
                <p className="text-gray-600">{reuniao.local}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Quórum</p>
                <p className="text-gray-600">
                  {reuniao.quorum_presente || 0}/{reuniao.quorum_necessario || 7} presentes
                </p>
              </div>
            </div>
          </div>

          {reuniao.pauta && (
            <div className="mt-6">
              <h4 className="font-medium mb-2">Pauta</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{reuniao.pauta}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="convocacoes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="convocacoes" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Convocações
          </TabsTrigger>
          <TabsTrigger value="presencas" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Presenças
          </TabsTrigger>
          <TabsTrigger value="ata" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Ata
          </TabsTrigger>
          <TabsTrigger value="resolucoes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Resoluções
          </TabsTrigger>
        </TabsList>

        {/* Convocações Tab */}
        <TabsContent value="convocacoes">
          <Card>
            <CardHeader>
              <CardTitle>Status das Convocações</CardTitle>
              <CardDescription>
                Acompanhe o envio e confirmação das convocações
              </CardDescription>
            </CardHeader>
            <CardContent>
              {convocacoes.length > 0 ? (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{convocacoesStats.total}</div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{convocacoesStats.enviadas}</div>
                      <div className="text-sm text-gray-600">Enviadas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{convocacoesStats.confirmadas}</div>
                      <div className="text-sm text-gray-600">Confirmadas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{convocacoesStats.rejeitadas}</div>
                      <div className="text-sm text-gray-600">Rejeitadas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{convocacoesStats.pendentes}</div>
                      <div className="text-sm text-gray-600">Pendentes</div>
                    </div>
                  </div>

                  {/* Convocações List */}
                  <div className="space-y-2">
                    {convocacoes.map((convocacao) => (
                      <div key={convocacao.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{convocacao.conselheiros?.nome_completo}</p>
                            <p className="text-sm text-gray-600">{convocacao.conselheiros?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={convocacao.status === 'enviada' ? 'default' : 'secondary'}>
                            {convocacao.status}
                          </Badge>
                          <Badge 
                            variant={
                              convocacao.confirmacao_presenca === 'confirmada' ? 'default' :
                              convocacao.confirmacao_presenca === 'rejeitada' ? 'destructive' : 'secondary'
                            }
                          >
                            {convocacao.confirmacao_presenca}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma convocação enviada
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Envie convocações para os conselheiros participarem da reunião
                  </p>
                  {canManage && isUpcoming && (
                    <Button onClick={() => setConvocacaoDialogOpen(true)}>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Convocações
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Presenças Tab */}
        <TabsContent value="presencas">
          {(canManage || isToday) ? (
            <PresencasManager 
              reuniao_id={reuniao.id}
              quorum_necessario={reuniao.quorum_necessario}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Controle de Presença
                </h3>
                <p className="text-gray-600">
                  A lista de presença estará disponível no dia da reunião
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Ata Tab */}
        <TabsContent value="ata">
          <Card>
            <CardHeader>
              <CardTitle>Ata da Reunião</CardTitle>
              <CardDescription>
                {reuniao.ata ? 'Ata registrada' : 'Aguardando elaboração da ata'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reuniao.ata ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{reuniao.ata}</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ata não elaborada
                  </h3>
                  <p className="text-gray-600">
                    A ata será elaborada após a realização da reunião
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resoluções Tab */}
        <TabsContent value="resolucoes">
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Resoluções Geradas
              </h3>
              <p className="text-gray-600">
                As resoluções aprovadas nesta reunião aparecerão aqui
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}