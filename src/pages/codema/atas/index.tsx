import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BreadcrumbWithActions, SmartBreadcrumb } from '@/components/navigation/SmartBreadcrumb';
import { LoadingSpinner } from '@/components/ui/loading';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Calendar,
  Users,
  FileSignature,
  History,
  Printer,
  Mail,
  Lock,
  Unlock
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Ata {
  id: string;
  reuniao_id: string;
  numero_ata: string;
  conteudo: string;
  status: 'rascunho' | 'em_revisao' | 'aprovada' | 'publicada';
  versao: number;
  data_aprovacao: string | null;
  aprovada_por: string | null;
  pdf_url: string | null;
  hash_verificacao: string | null;
  created_at: string;
  updated_at: string;
  reuniao?: {
    numero_reuniao: string;
    tipo: string;
    data_hora: string;
    local: string;
    pauta: string[];
  };
  aprovador?: {
    full_name: string;
  };
}

interface AtaVersion {
  id: string;
  ata_id: string;
  versao: number;
  conteudo: string;
  alterado_por: string;
  motivo_alteracao: string;
  created_at: string;
  editor?: {
    full_name: string;
  };
}

const AtasPage = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAtaForm, setShowAtaForm] = useState(false);
  const [selectedAta, setSelectedAta] = useState<Ata | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedAtaId, setSelectedAtaId] = useState<string | null>(null);

  const canEdit = profile?.role && ['admin', 'secretario', 'presidente'].includes(profile.role);
  const canApprove = profile?.role && ['admin', 'presidente'].includes(profile.role);

  // Fetch atas
  const { data: atas = [], isLoading } = useQuery({
    queryKey: ['atas', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('atas')
        .select(`
          *,
          reuniao:reunioes(*),
          aprovador:profiles!atas_aprovada_por_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`numero_ata.ilike.%${searchTerm}%,conteudo.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Ata[];
    },
  });

  // Fetch version history
  const { data: versions = [] } = useQuery({
    queryKey: ['ata-versions', selectedAtaId],
    queryFn: async () => {
      if (!selectedAtaId) return [];
      
      const { data, error } = await supabase
        .from('atas_versoes')
        .select(`
          *,
          editor:profiles!atas_versoes_alterado_por_fkey(full_name)
        `)
        .eq('ata_id', selectedAtaId)
        .order('versao', { ascending: false });

      if (error) throw error;
      return data as AtaVersion[];
    },
    enabled: !!selectedAtaId,
  });

  // Create/Update ata mutation
  const saveMutation = useMutation({
    mutationFn: async (ataData: Partial<Ata>) => {
      if (selectedAta?.id) {
        // Update existing
        const { error } = await supabase
          .from('atas')
          .update(ataData)
          .eq('id', selectedAta.id);
        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('atas')
          .insert(ataData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atas'] });
      toast({
        title: 'Sucesso',
        description: selectedAta ? 'Ata atualizada com sucesso!' : 'Ata criada com sucesso!',
      });
      setShowAtaForm(false);
      setSelectedAta(null);
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar ata. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Error saving ata:', error);
    },
  });

  // Change status mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status, aprovada_por }: { id: string; status: string; aprovada_por?: string }) => {
      const updateData: any = { status };
      if (status === 'aprovada' && aprovada_por) {
        updateData.aprovada_por = aprovada_por;
        updateData.data_aprovacao = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('atas')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atas'] });
      toast({
        title: 'Sucesso',
        description: 'Status da ata atualizado!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status.',
        variant: 'destructive',
      });
      console.error('Error updating status:', error);
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'rascunho':
        return <Badge variant="outline" className="bg-gray-50"><Edit className="w-3 h-3 mr-1" />Rascunho</Badge>;
      case 'em_revisao':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Em Revisão</Badge>;
      case 'aprovada':
        return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Aprovada</Badge>;
      case 'publicada':
        return <Badge variant="default" className="bg-blue-600"><FileText className="w-3 h-3 mr-1" />Publicada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleStatusChange = (ata: Ata, newStatus: string) => {
    statusMutation.mutate({
      id: ata.id,
      status: newStatus,
      aprovada_por: newStatus === 'aprovada' ? profile?.id : undefined,
    });
  };

  const generatePDF = async (ata: Ata) => {
    toast({
      title: 'Gerando PDF',
      description: 'O PDF está sendo gerado...',
    });
    // TODO: Implement PDF generation
  };

  const sendByEmail = async (ata: Ata) => {
    toast({
      title: 'Enviando por email',
      description: 'A ata está sendo enviada...',
    });
    // TODO: Implement email sending
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <BreadcrumbWithActions
          title="Atas das Reuniões"
          description="Gestão completa de atas - elaboração, revisão, aprovação e publicação"
          actions={
            canEdit && (
              <Button onClick={() => setShowAtaForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Ata
              </Button>
            )
          }
        >
          <SmartBreadcrumb />
        </BreadcrumbWithActions>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Atas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{atas.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Elaboração</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {atas.filter(a => a.status === 'rascunho' || a.status === 'em_revisao').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {atas.filter(a => a.status === 'aprovada').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Publicadas</CardTitle>
              <FileSignature className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {atas.filter(a => a.status === 'publicada').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Pesquise e filtre as atas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por número ou conteúdo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="em_revisao">Em Revisão</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="publicada">Publicada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Atas List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Atas</CardTitle>
            <CardDescription>{atas.length} ata(s) encontrada(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Reunião</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Versão</TableHead>
                  <TableHead>Aprovador</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atas.map((ata) => (
                  <TableRow key={ata.id}>
                    <TableCell className="font-medium">{ata.numero_ata}</TableCell>
                    <TableCell>
                      {ata.reuniao && (
                        <div>
                          <p className="font-medium">{ata.reuniao.numero_reuniao}</p>
                          <p className="text-sm text-muted-foreground">
                            {ata.reuniao.tipo === 'ordinaria' ? 'Ordinária' : 'Extraordinária'}
                          </p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {ata.reuniao && format(new Date(ata.reuniao.data_hora), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{getStatusBadge(ata.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">v{ata.versao}</Badge>
                    </TableCell>
                    <TableCell>
                      {ata.aprovador?.full_name || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Visualizar Ata</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        {canEdit && ata.status === 'rascunho' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setSelectedAta(ata);
                                  setShowAtaForm(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar Ata</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedAtaId(ata.id);
                                setShowVersionHistory(true);
                              }}
                            >
                              <History className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Histórico de Versões</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        {ata.status === 'aprovada' && (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => generatePDF(ata)}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Gerar PDF</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => sendByEmail(ata)}
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Enviar por Email</p>
                              </TooltipContent>
                            </Tooltip>
                          </>
                        )}
                        
                        {canApprove && ata.status === 'em_revisao' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleStatusChange(ata, 'aprovada')}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Aprovar Ata</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        {canEdit && ata.status === 'aprovada' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleStatusChange(ata, 'publicada')}
                              >
                                <FileSignature className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Publicar Ata</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {atas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Nenhuma ata encontrada</p>
                        {canEdit && (
                          <p className="text-sm text-muted-foreground">
                            Clique em "Nova Ata" para criar a primeira ata
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Version History Dialog */}
        <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Histórico de Versões</DialogTitle>
              <DialogDescription>
                Visualize todas as versões e alterações desta ata
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {versions.map((version) => (
                <Card key={version.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-sm">Versão {version.versao}</CardTitle>
                        <CardDescription>
                          {version.editor?.full_name} - {format(new Date(version.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium mb-2">Motivo da alteração:</p>
                    <p className="text-sm text-muted-foreground">{version.motivo_alteracao}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Ata Form Dialog */}
        <Dialog open={showAtaForm} onOpenChange={setShowAtaForm}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedAta ? 'Editar Ata' : 'Nova Ata'}</DialogTitle>
              <DialogDescription>
                {selectedAta ? 'Edite os dados da ata' : 'Crie uma nova ata de reunião'}
              </DialogDescription>
            </DialogHeader>
            {/* TODO: Implement AtaForm component */}
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Formulário de edição de atas em desenvolvimento.
                </AlertDescription>
              </Alert>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default AtasPage;