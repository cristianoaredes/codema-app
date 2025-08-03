import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, FileText, Download, Clock, CheckCircle, XCircle, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
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
  // Index signature to allow dynamic property access
  [key: string]: unknown;
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

  const canEdit = profile?.role && (
    ['admin', 'secretario', 'presidente'].includes(profile.role) ||
    (profile.role === 'vice_presidente' && profile.is_acting_president === true)
  );
  const canReview = profile?.role && ['conselheiro_titular', 'conselheiro_suplente', 'vice_presidente', 'presidente'].includes(profile.role);

  const { data: atas = [], isLoading } = useQuery({
    queryKey: ['atas', searchTerm, statusFilter, tipoFilter],
    queryFn: async () => {
      try {
        let query = supabase
          .from('atas')
          .select(`
            *,
            reunioes:reuniao_id(id, titulo, tipo)
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
        if (error) {
          console.warn('Atas table query failed:', error.message);
          return [];
        }
        return data as Ata[];
      } catch (error) {
        console.warn('Atas table not available:', error);
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: stats } = useQuery({
    queryKey: ['atas-stats'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('atas')
          .select('status, rascunho, pdf_gerado');
        
        if (error) {
          console.warn('Atas stats query failed:', error.message);
          return { total: 0, rascunho: 0, aprovado: 0, publicado: 0 };
        }

        const total = data?.length || 0;
        const rascunhos = data?.filter((a: Ata) => a.rascunho).length || 0;
        const aprovadas = data?.filter((a: Ata) => a.status === 'aprovada').length || 0;
        const assinadas = data?.filter((a: Ata) => a.status === 'assinada').length || 0;
        const comPdf = data?.filter((a: Ata) => a.pdf_gerado).length || 0;

        return { total, rascunhos, aprovadas, assinadas, comPdf };
      } catch (error) {
        console.warn('Atas stats query failed:', error);
        return { total: 0, rascunho: 0, aprovado: 0, publicado: 0 };
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
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

  // ResponsiveTable configuration
  const tableColumns = [
    {
      key: 'numero',
      title: 'Número',
      priority: 'high' as const,
      render: (item: Record<string, unknown>) => {
        const ata = item as Ata;
        return <span className="font-medium">{ata.numero}</span>;
      }
    },
    {
      key: 'data_reuniao',
      title: 'Data',
      priority: 'high' as const,
      render: (item: Record<string, unknown>) => {
        const ata = item as Ata;
        return format(new Date(ata.data_reuniao), "dd/MM/yyyy", { locale: ptBR });
      }
    },
    {
      key: 'tipo_reuniao',
      title: 'Tipo',
      priority: 'medium' as const,
      render: (item: Record<string, unknown>) => {
        const ata = item as Ata;
        return getTipoLabel(ata.tipo_reuniao);
      }
    },
    {
      key: 'local_reuniao',
      title: 'Local',
      priority: 'low' as const,
      render: (item: Record<string, unknown>) => {
        const ata = item as Ata;
        return (
          <span className="max-w-[200px] truncate block" title={ata.local_reuniao}>
            {ata.local_reuniao}
          </span>
        );
      }
    },
    {
      key: 'status',
      title: 'Status',
      priority: 'high' as const,
      render: (item: Record<string, unknown>) => {
        const ata = item as Ata;
        return getStatusBadge(ata.status, ata.rascunho);
      }
    },
    {
      key: 'versao',
      title: 'Versão',
      priority: 'medium' as const,
      render: (item: Record<string, unknown>) => {
        const ata = item as Ata;
        return `v${ata.versao}`;
      }
    },
    {
      key: 'created_by',
      title: 'Criado por',
      priority: 'low' as const,
      render: (_item: Record<string, unknown>) => 'Sistema'
    }
  ];

  const getTableActions = (item: Record<string, unknown>) => {
    const ata = item as Ata;
    return [
    {
      label: 'Visualizar Detalhes',
      onClick: () => {
        // Add view action logic here
        console.log('View ata:', ata.id);
      }
    },
    ...(canEdit ? [{
      label: 'Editar Ata',
      onClick: () => {
        setSelectedAta(ata);
        setShowAtaForm(true);
      }
    }] : []),
    ...((canReview || canEdit) ? [{
      label: 'Revisar e Comentar',
      onClick: () => {
        setReviewAtaId(ata.id);
        setShowReviewSystem(true);
      }
    }] : []),
    ...(ata.pdf_gerado ? [{
      label: 'Baixar PDF',
      onClick: () => {
        // Add PDF download logic here
        console.log('Download PDF for ata:', ata.id);
      }
    }] : [])
    ];
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
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
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
            <div className="flex flex-col gap-4">
              {/* Search input - full width on all screens */}
              <div className="w-full">
                <Input
                  placeholder="Buscar por número ou local..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {/* Filter dropdowns - responsive layout */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
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
                  <SelectTrigger className="w-full sm:w-[180px]">
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
            <ResponsiveTable
              data={atas}
              columns={tableColumns}
              actions={getTableActions}
              loading={isLoading}
              emptyMessage={
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhuma ata encontrada</p>
                  {canEdit && (
                    <p className="text-sm text-muted-foreground">
                      Clique em "Nova Ata" para criar a primeira ata
                    </p>
                  )}
                </div>
              }
            />
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}