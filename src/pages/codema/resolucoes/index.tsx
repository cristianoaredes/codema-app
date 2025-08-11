import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Plus, Edit, Edit2, Vote, CheckCircle, XCircle, Gavel, Users, Eye, Download } from 'lucide-react';
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
import { ResolucaoForm, VotingSystem } from "@/components/codema/resolucoes";

interface Resolucao {
  id: string;
  numero: string;
  titulo: string;
  ementa: string;
  conteudo: string;
  tipo: string;
  status: string;
  data_discussao: string;
  data_votacao: string;
  data_publicacao: string;
  data_vigencia: string;
  votos_favor: number;
  votos_contra: number;
  abstencoes: number;
  quorum_presente: number;
  resultado_votacao: string;
  pdf_gerado: boolean;
  created_at: string;
  created_by: string;
  profiles?: {
    full_name: string;
  };
}

export default function ResolucoesPage() {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tipoFilter, setTipoFilter] = useState<string>("all");
  const [showResolucaoForm, setShowResolucaoForm] = useState(false);
  const [selectedResolucao, setSelectedResolucao] = useState<Resolucao | null>(null);
  const [showVotingSystem, setShowVotingSystem] = useState(false);
  const [votingResolucaoId, setVotingResolucaoId] = useState<string | null>(null);

  const canEdit = profile?.role && (
    ['admin', 'secretario', 'presidente'].includes(profile.role) ||
    (profile.role === 'vice_presidente' && profile.is_acting_president === true)
  );
  const canVote = profile?.role && ['conselheiro_titular', 'conselheiro_suplente', 'vice_presidente', 'presidente'].includes(profile.role);

  const { data: resolucoes = [], isLoading } = useQuery({
    queryKey: ['resolucoes', searchTerm, statusFilter, tipoFilter],
    queryFn: async () => {
      let query = supabase
        .from('resolucoes')
        .select('*')
        .order('numero', { ascending: false });

      if (searchTerm) {
        query = query.or(`numero.ilike.%${searchTerm}%,titulo.ilike.%${searchTerm}%,ementa.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (tipoFilter !== 'all') {
        query = query.eq('tipo', tipoFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Resolucao[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['resolucoes-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resolucoes')
        .select('status, tipo, resultado_votacao');

      if (error) throw error;

      const total = data.length;
      const minutas = data.filter((r: Resolucao) => r.status === 'minuta').length;
      const emVotacao = data.filter((r: Resolucao) => r.status === 'em_votacao').length;
      const aprovadas = data.filter((r: Resolucao) => r.status === 'aprovada').length;
      const publicadas = data.filter((r: Resolucao) => r.status === 'publicada').length;
      const rejeitadas = data.filter((r: Resolucao) => r.status === 'rejeitada').length;

      const normativas = data.filter((r: Resolucao) => r.tipo === 'normativa').length;
      const deliberativas = data.filter((r: Resolucao) => r.tipo === 'deliberativa').length;
      const administrativas = data.filter((r: Resolucao) => r.tipo === 'administrativa').length;

      return { 
        total, minutas, emVotacao, aprovadas, publicadas, rejeitadas,
        normativas, deliberativas, administrativas
      };
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'minuta':
        return <Badge variant="outline" className="bg-gray-50"><Edit className="w-3 h-3 mr-1" />Minuta</Badge>;
      case 'em_votacao':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Vote className="w-3 h-3 mr-1" />Em Votação</Badge>;
      case 'aprovada':
        return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Aprovada</Badge>;
      case 'rejeitada':
        return <Badge variant="outline" className="bg-red-50 text-red-700"><XCircle className="w-3 h-3 mr-1" />Rejeitada</Badge>;
      case 'publicada':
        return <Badge variant="default" className="bg-blue-600"><FileText className="w-3 h-3 mr-1" />Publicada</Badge>;
      case 'revogada':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700"><XCircle className="w-3 h-3 mr-1" />Revogada</Badge>;
      default:
        return <Badge variant="outline">Minuta</Badge>;
    }
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'normativa':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Normativa</Badge>;
      case 'deliberativa':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Deliberativa</Badge>;
      case 'administrativa':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Administrativa</Badge>;
      default:
        return <Badge variant="outline">{tipo}</Badge>;
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
          title="Resoluções do CODEMA"
          description="Controle de resoluções do conselho - criação, votação e publicação"
          actions={
            canEdit && (
              <Dialog open={showResolucaoForm} onOpenChange={setShowResolucaoForm}>
                <DialogTrigger asChild>
                  <Button><Plus className="w-4 h-4 mr-2" />Nova Resolução</Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{selectedResolucao ? 'Editar Resolução' : 'Nova Resolução'}</DialogTitle></DialogHeader>
                  <ResolucaoForm resolucao={selectedResolucao} onClose={() => { setShowResolucaoForm(false); setSelectedResolucao(null); }} />
                </DialogContent>
              </Dialog>
            )
          }
        >
          <SmartBreadcrumb />
        </BreadcrumbWithActions>

        {/* Voting System Dialog */}
        <Dialog open={showVotingSystem} onOpenChange={setShowVotingSystem}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Sistema de Votação</DialogTitle></DialogHeader>
            {votingResolucaoId && (
              <VotingSystem resolucaoId={votingResolucaoId} canVote={canVote} onClose={() => { setShowVotingSystem(false); setVotingResolucaoId(null); }} />
            )}
          </DialogContent>
        </Dialog>

        {/* Stats Cards */}
        {stats && (
          <Tabs defaultValue="status" className="w-full">
            <TabsList>
              <TabsTrigger value="status">Por Status</TabsTrigger>
              <TabsTrigger value="tipo">Por Tipo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="status" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total</CardTitle>
                    <Gavel className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Minutas</CardTitle>
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.minutas}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Em Votação</CardTitle>
                    <Vote className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.emVotacao}</div>
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
                    <CardTitle className="text-sm font-medium">Publicadas</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.publicadas}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.rejeitadas}</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tipo" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total</CardTitle><Gavel className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Normativas</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.normativas}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Deliberativas</CardTitle><Vote className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.deliberativas}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Administrativas</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.administrativas}</div></CardContent></Card>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Pesquise e filtre as resoluções por diferentes critérios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input 
                  placeholder="Buscar por número, título ou ementa..." 
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
                  <SelectItem value="minuta">Minuta</SelectItem>
                  <SelectItem value="em_votacao">Em Votação</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="rejeitada">Rejeitada</SelectItem>
                  <SelectItem value="publicada">Publicada</SelectItem>
                  <SelectItem value="revogada">Revogada</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="normativa">Normativa</SelectItem>
                  <SelectItem value="deliberativa">Deliberativa</SelectItem>
                  <SelectItem value="administrativa">Administrativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Resolutions List */}
        <Card>
          <CardHeader><CardTitle>Lista de Resoluções</CardTitle><CardDescription>{resolucoes.length} resolução(ões) encontrada(s)</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Número</TableHead><TableHead>Título</TableHead><TableHead>Tipo</TableHead><TableHead>Status</TableHead><TableHead>Votação</TableHead><TableHead>Data</TableHead><TableHead>Criado por</TableHead><TableHead>Ações</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {resolucoes.map((resolucao) => (
                  <TableRow key={resolucao.id}>
                    <TableCell className="font-medium">{resolucao.numero}</TableCell>
                    <TableCell className="max-w-[300px]"><div><p className="font-medium truncate">{resolucao.titulo}</p><p className="text-sm text-muted-foreground truncate">{resolucao.ementa}</p></div></TableCell>
                    <TableCell>{getTipoBadge(resolucao.tipo)}</TableCell>
                    <TableCell>{getStatusBadge(resolucao.status)}</TableCell>
                    <TableCell>
                      {resolucao.resultado_votacao && (
                        <div className="text-sm"><div className="flex gap-1"><span className="text-green-600">✓{resolucao.votos_favor}</span><span className="text-red-600">✗{resolucao.votos_contra}</span><span className="text-gray-500">-{resolucao.abstencoes}</span></div><div className="text-xs text-muted-foreground">{resolucao.quorum_presente} presentes</div></div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {resolucao.data_publicacao && (<div>Pub: {format(new Date(resolucao.data_publicacao), "dd/MM/yy", { locale: ptBR })}</div>)}
                        {resolucao.data_votacao && !resolucao.data_publicacao && (<div>Vot: {format(new Date(resolucao.data_votacao), "dd/MM/yy", { locale: ptBR })}</div>)}
                        {!resolucao.data_votacao && (<div>Criada: {format(new Date(resolucao.created_at), "dd/MM/yy", { locale: ptBR })}</div>)}
                      </div>
                    </TableCell>
                    <TableCell>{resolucao.profiles?.full_name || 'Sistema'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon"><Eye className="w-4 h-4" /></Button></TooltipTrigger><TooltipContent><p>Visualizar Detalhes</p></TooltipContent></Tooltip>
                        {canEdit && (<Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => { setSelectedResolucao(resolucao); setShowResolucaoForm(true); }}><Edit2 className="w-4 h-4" /></Button></TooltipTrigger><TooltipContent><p>Editar Resolução</p></TooltipContent></Tooltip>)}
                        {(canVote || canEdit) && resolucao.status === 'em_votacao' && (<Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => { setVotingResolucaoId(resolucao.id); setShowVotingSystem(true); }}><Vote className="w-4 h-4" /></Button></TooltipTrigger><TooltipContent><p>Votar na Resolução</p></TooltipContent></Tooltip>)}
                        {resolucao.pdf_gerado && (<Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon"><Download className="w-4 h-4" /></Button></TooltipTrigger><TooltipContent><p>Baixar PDF</p></TooltipContent></Tooltip>)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {resolucoes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Gavel className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Nenhuma resolução encontrada</p>
                        {canEdit && (<p className="text-sm text-muted-foreground">Clique em "Nova Resolução" para criar a primeira resolução</p>)}
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