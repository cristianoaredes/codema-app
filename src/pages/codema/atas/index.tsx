import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, Eye, Edit2, FileText, Download, Clock, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BreadcrumbWithActions, SmartBreadcrumb } from "@/components/navigation/SmartBreadcrumb";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AtaForm, AtaReviewSystem } from "@/components/codema/atas";

interface Ata {
  id: string;
  numero: string;
  reuniao_id: string;
  data_reuniao: string;
  hora_inicio: string;
  hora_fim?: string;
  local_reuniao: string;
  tipo_reuniao: string;
  status: string;
  versao: number;
  rascunho: boolean;
  pdf_gerado: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  reunioes?: {
    id: string;
    titulo: string;
    tipo: string;
  };
  profiles?: {
    full_name: string;
  };
}

export default function AtasPage() {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tipoFilter, setTipoFilter] = useState<string>("all");
  const [showAtaForm, setShowAtaForm] = useState(false);
  const [selectedAta, setSelectedAta] = useState<Ata | null>(null);
  const [showReviewSystem, setShowReviewSystem] = useState(false);
  const [reviewAtaId, setReviewAtaId] = useState<string | null>(null);

  const canEdit = profile?.role && ['admin', 'secretario', 'presidente'].includes(profile.role);
  const canReview = profile?.role && ['conselheiro_titular', 'conselheiro_suplente', 'presidente'].includes(profile.role);

  const { data: atas = [], isLoading } = useQuery({
    queryKey: ['atas', searchTerm, statusFilter, tipoFilter],
    queryFn: async () => {
      let query = supabase
        .from('atas')
        .select(`
          *,
          reunioes:reuniao_id(id, titulo, tipo),
          profiles:created_by(full_name)
        `)
        .order('data_reuniao', { ascending: false });

      if (searchTerm) {
        query = query.or(`numero.ilike.%${searchTerm}%,local_reuniao.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (tipoFilter !== 'all') {
        query = query.eq('tipo_reuniao', tipoFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Ata[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['atas-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('atas')
        .select('status, rascunho, pdf_gerado');

      if (error) throw error;

      const total = data.length;
      const rascunhos = data.filter(a => a.rascunho).length;
      const aprovadas = data.filter(a => a.status === 'aprovada').length;
      const assinadas = data.filter(a => a.status === 'assinada').length;
      const comPdf = data.filter(a => a.pdf_gerado).length;

      return { total, rascunhos, aprovadas, assinadas, comPdf };
    },
  });

  const getStatusBadge = (status: string, rascunho: boolean) => {
    if (rascunho) {
      return <Badge variant="outline" className="bg-gray-50"><Clock className="w-3 h-3 mr-1" />Rascunho</Badge>;
    }

    switch (status) {
      case 'em_revisao':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Edit2 className="w-3 h-3 mr-1" />Em Revisão</Badge>;
      case 'aprovada':
        return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Aprovada</Badge>;
      case 'assinada':
        return <Badge variant="default" className="bg-blue-600"><CheckCircle className="w-3 h-3 mr-1" />Assinada</Badge>;
      default:
        return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />Rascunho</Badge>;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'ordinaria': return 'Ordinária';
      case 'extraordinaria': return 'Extraordinária';
      case 'publica': return 'Audiência Pública';
      default: return tipo;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <BreadcrumbWithActions
          title="Atas do CODEMA"
          description="Gestão de atas eletrônicas das reuniões do conselho."
          actions={
            canEdit && (
              <Dialog open={showAtaForm} onOpenChange={setShowAtaForm}>
                <DialogTrigger asChild>
                  <Button><Plus className="w-4 h-4 mr-2" />Nova Ata</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{selectedAta ? 'Editar Ata' : 'Nova Ata'}</DialogTitle></DialogHeader>
                  <AtaForm ata={selectedAta} onClose={() => { setShowAtaForm(false); setSelectedAta(null); }} />
                </DialogContent>
              </Dialog>
            )
          }
        >
          <SmartBreadcrumb />
        </BreadcrumbWithActions>

        {/* Review System Dialog */}
        <Dialog open={showReviewSystem} onOpenChange={setShowReviewSystem}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Sistema de Revisão</DialogTitle>
            </DialogHeader>
            {reviewAtaId && (
              <AtaReviewSystem
                ataId={reviewAtaId}
                canReview={canReview}
              />
            )}
          </DialogContent>
        </Dialog>
        
        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Atas</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rascunhos}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.aprovadas}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assinadas</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.assinadas}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Com PDF</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.comPdf}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Pesquise e filtre as atas por diferentes critérios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por número ou local..."
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
                  <SelectItem value="assinada">Assinada</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="ordinaria">Ordinária</SelectItem>
                  <SelectItem value="extraordinaria">Extraordinária</SelectItem>
                  <SelectItem value="publica">Audiência Pública</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Atas List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Atas</CardTitle>
            <CardDescription>
              {atas.length} ata(s) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Versão</TableHead>
                  <TableHead>Criado por</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atas.map((ata) => (
                  <TableRow key={ata.id}>
                    <TableCell className="font-medium">{ata.numero}</TableCell>
                    <TableCell>
                      {format(new Date(ata.data_reuniao), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{getTipoLabel(ata.tipo_reuniao)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{ata.local_reuniao}</TableCell>
                    <TableCell>{getStatusBadge(ata.status, ata.rascunho)}</TableCell>
                    <TableCell>v{ata.versao}</TableCell>
                    <TableCell>{ata.profiles?.full_name || 'Sistema'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild><Button variant="outline" size="icon"><Eye className="w-4 h-4" /></Button></TooltipTrigger>
                          <TooltipContent><p>Visualizar Detalhes</p></TooltipContent>
                        </Tooltip>
                        {canEdit && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" onClick={() => { setSelectedAta(ata); setShowAtaForm(true); }}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Editar Ata</p></TooltipContent>
                          </Tooltip>
                        )}
                        {(canReview || canEdit) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" onClick={() => { setReviewAtaId(ata.id); setShowReviewSystem(true); }}>
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Revisar e Comentar</p></TooltipContent>
                          </Tooltip>
                        )}
                        {ata.pdf_gerado && (
                          <Tooltip>
                            <TooltipTrigger asChild><Button variant="outline" size="icon"><Download className="w-4 h-4" /></Button></TooltipTrigger>
                            <TooltipContent><p>Baixar PDF</p></TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {atas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
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
      </div>
    </TooltipProvider>
  );
}