import { useState, useMemo } from 'react';
import { Plus, Search, Filter, AlertTriangle, Users, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useConselheiros, useConselheirosComMandatoExpirando } from '@/hooks';
import { ConselheiroCard, ConselheiroForm } from '@/components/codema/conselheiros';
import { Conselheiro } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { BreadcrumbWithActions, SmartBreadcrumb } from '@/components/navigation/SmartBreadcrumb';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from '@/components/ui/loading';

type ViewMode = 'grid' | 'list';

export default function ConselheirosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSegmento, setFilterSegmento] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const { data: conselheiros = [], isLoading } = useConselheiros();
  const { data: mandatosExpirando = [] } = useConselheirosComMandatoExpirando(30);

  const filteredConselheiros = useMemo(() => conselheiros.filter((conselheiro: Conselheiro) => {
    const matchesSearch = conselheiro.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conselheiro.entidade_representada.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegmento = filterSegmento === 'all' || conselheiro.segmento === filterSegmento;
    const matchesStatus = filterStatus === 'all' || conselheiro.status === filterStatus;
    
    return matchesSearch && matchesSegmento && matchesStatus;
  }), [conselheiros, searchTerm, filterSegmento, filterStatus]);

  const stats = useMemo(() => ({
    total: conselheiros.length,
    ativos: conselheiros.filter(c => c.status === 'ativo').length,
    governo: conselheiros.filter(c => c.segmento === 'governo').length,
    sociedadeCivil: conselheiros.filter(c => c.segmento === 'sociedade_civil').length,
    setorProdutivo: conselheiros.filter(c => c.segmento === 'setor_produtivo').length,
  }), [conselheiros]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterSegmento('all');
    setFilterStatus('all');
  };
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ativo': return 'success';
      case 'inativo': return 'destructive';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <BreadcrumbWithActions
        title="Conselheiros CODEMA"
        description="Gestão completa dos membros do Conselho Municipal de Defesa do Meio Ambiente"
        actions={
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Novo Conselheiro</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl"><ConselheiroForm onSuccess={() => setIsCreateDialogOpen(false)} /></DialogContent>
          </Dialog>
        }
      >
        <SmartBreadcrumb />
      </BreadcrumbWithActions>

      {mandatosExpirando.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{mandatosExpirando.length} mandato(s)</strong> expirando nos próximos 30 dias. Verifique a necessidade de renovação.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Stats Cards ... */}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Filtros e Visualização</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}><LayoutGrid className="h-4 w-4" /></Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou entidade..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterSegmento} onValueChange={setFilterSegmento}>
              <SelectTrigger><SelectValue placeholder="Segmento" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os segmentos</SelectItem>
                <SelectItem value="governo">Governo</SelectItem>
                <SelectItem value="sociedade_civil">Sociedade Civil</SelectItem>
                <SelectItem value="setor_produtivo">Setor Produtivo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="licenciado">Licenciado</SelectItem>
                <SelectItem value="afastado">Afastado</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" onClick={handleClearFilters} className="md:col-start-4"><Filter className="h-4 w-4 mr-2" />Limpar Filtros</Button>
          </div>
        </CardContent>
      </Card>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConselheiros.map((conselheiro) => (
                <ConselheiroCard key={conselheiro.id} conselheiro={conselheiro} />
              ))}
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Entidade</TableHead>
                    <TableHead>Segmento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fim do Mandato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConselheiros.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.nome_completo}</TableCell>
                      <TableCell>{c.entidade_representada}</TableCell>
                      <TableCell>{c.segmento.replace('_', ' ')}</TableCell>
                      <TableCell><Badge variant={getStatusVariant(c.status)}>{c.status}</Badge></TableCell>
                      <TableCell>{new Date(c.mandato_fim).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {filteredConselheiros.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum conselheiro encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterSegmento !== 'all' || filterStatus !== 'all'
                ? 'Tente ajustar os filtros para encontrar conselheiros.'
                : 'Comece cadastrando o primeiro conselheiro do CODEMA.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}