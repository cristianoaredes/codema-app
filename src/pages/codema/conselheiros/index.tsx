import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Search, 
  Users, 
  AlertCircle,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useConselheiros, useCreateConselheiro, useUpdateConselheiro, useDeleteConselheiro } from '@/hooks/useConselheiros';
import ConselheiroCard from '@/components/codema/conselheiros/ConselheiroCard';
import ConselheiroForm from '@/components/codema/conselheiros/ConselheiroForm';
import { Conselheiro } from '@/types/conselheiro';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const ConselheirosPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterSegmento, setFilterSegmento] = useState<string>('todos');
  const [showForm, setShowForm] = useState(false);
  const [editingConselheiro, setEditingConselheiro] = useState<Conselheiro | undefined>();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [conselheiroToDelete, setConselheiroToDelete] = useState<Conselheiro | null>(null);
  const [importInputRef, setImportInputRef] = useState<HTMLInputElement | null>(null);
  
  const { toast } = useToast();
  const { data: conselheiros, isLoading, error } = useConselheiros();
  const deleteConselheiro = useDeleteConselheiro();

  // Filter conselheiros based on search and filters
  const filteredConselheiros = conselheiros?.filter(conselheiro => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = conselheiro.nome_completo.toLowerCase().includes(searchLower) ||
                          conselheiro.entidade_representada?.toLowerCase().includes(searchLower) ||
                          (conselheiro.cpf && conselheiro.cpf.includes(searchTerm)) ||
                          (conselheiro.email && conselheiro.email.toLowerCase().includes(searchLower));
    const matchesStatus = filterStatus === 'todos' || conselheiro.status === filterStatus;
    const matchesSegmento = filterSegmento === 'todos' || conselheiro.segmento === filterSegmento;
    
    return matchesSearch && matchesStatus && matchesSegmento;
  }) || [];

  // Calculate statistics
  const stats = {
    total: conselheiros?.length || 0,
    ativos: conselheiros?.filter(c => c.status === 'ativo').length || 0,
    titulares: conselheiros?.filter(c => c.titular).length || 0,
    suplentes: conselheiros?.filter(c => !c.titular).length || 0,
    mandatosVencendo: conselheiros?.filter(c => {
      const fim = new Date(c.mandato_fim);
      const hoje = new Date();
      const diff = fim.getTime() - hoje.getTime();
      const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return dias <= 90 && dias > 0;
    }).length || 0,
  };

  const handleEdit = (conselheiro: Conselheiro) => {
    setEditingConselheiro(conselheiro);
    setShowForm(true);
  };

  const handleDeleteClick = (conselheiro: Conselheiro) => {
    setConselheiroToDelete(conselheiro);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!conselheiroToDelete) return;
    
    try {
      await deleteConselheiro.mutateAsync(conselheiroToDelete.id);
      setDeleteConfirmOpen(false);
      setConselheiroToDelete(null);
    } catch (error) {
      console.error('Erro ao remover conselheiro:', error);
      toast({
        title: 'Erro ao remover',
        description: 'Ocorreu um erro ao remover o conselheiro. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingConselheiro(undefined);
  };

  const handleExport = () => {
    try {
      if (!conselheiros || conselheiros.length === 0) {
        toast({
          title: 'Nada para exportar',
          description: 'Não há conselheiros cadastrados para exportar.',
          variant: 'destructive',
        });
        return;
      }

      // Prepare data for export
      const exportData = conselheiros.map(conselheiro => ({
        nome_completo: conselheiro.nome_completo,
        cpf: conselheiro.cpf || '',
        email: conselheiro.email || '',
        telefone: conselheiro.telefone || '',
        endereco: conselheiro.endereco || '',
        entidade_representada: conselheiro.entidade_representada,
        segmento: conselheiro.segmento,
        titular: conselheiro.titular ? 'Sim' : 'Não',
        status: conselheiro.status,
        mandato_inicio: new Date(conselheiro.mandato_inicio).toLocaleDateString('pt-BR'),
        mandato_fim: new Date(conselheiro.mandato_fim).toLocaleDateString('pt-BR'),
        mandato_numero: conselheiro.mandato_numero || '',
        total_faltas: conselheiro.total_faltas,
        faltas_consecutivas: conselheiro.faltas_consecutivas,
        observacoes: conselheiro.observacoes || '',
      }));

      // Convert to CSV
      const headers = [
        'Nome Completo', 'CPF', 'Email', 'Telefone', 'Endereço',
        'Entidade Representada', 'Segmento', 'Titular', 'Status',
        'Mandato Início', 'Mandato Fim', 'Número Mandato',
        'Total Faltas', 'Faltas Consecutivas', 'Observações'
      ];

      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          Object.values(row).map(value => 
            `"${String(value).replace(/"/g, '""')}"` // Escape quotes
          ).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `conselheiros_codema_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Exportação realizada',
        description: `${conselheiros.length} conselheiros exportados com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Ocorreu um erro ao exportar os dados.',
        variant: 'destructive',
      });
    }
  };

  const handleImport = () => {
    importInputRef?.click();
  };

  const processImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Formato inválido',
        description: 'Por favor, selecione um arquivo CSV.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('Arquivo CSV deve ter pelo menos um cabeçalho e uma linha de dados');
        }

        // For now, show info about what would be imported
        // Full implementation would require more complex validation and batch insert
        toast({
          title: 'Importação preparada',
          description: `Arquivo processado com ${lines.length - 1} registros. Funcionalidade de importação será implementada em breve.`,
        });

        // Reset file input
        event.target.value = '';
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        toast({
          title: 'Erro no processamento',
          description: 'Ocorreu um erro ao processar o arquivo CSV.',
          variant: 'destructive',
        });
      }
    };

    reader.readAsText(file, 'UTF-8');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar conselheiros: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Mobile optimized */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Conselheiros CODEMA</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gerencie os membros do conselho</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="text-xs sm:text-sm">
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Exportar</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleImport} className="text-xs sm:text-sm">
            <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Importar</span>
            <span className="sm:hidden">Import</span>
          </Button>
          <Button onClick={() => { setEditingConselheiro(undefined); setShowForm(true); }} size="sm" className="text-xs sm:text-sm">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Novo Conselheiro</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      {/* Statistics - Mobile optimized grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.total}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-600">{stats.ativos}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.titulares}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Titulares</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.suplentes}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Suplentes</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow col-span-2 sm:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-amber-600">{stats.mandatosVencendo}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Mandatos Vencendo</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters - Mobile optimized */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, entidade, CPF ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="licenciado">Licenciado</SelectItem>
                  <SelectItem value="afastado">Afastado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSegmento} onValueChange={setFilterSegmento}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Segmento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="governo">Governo</SelectItem>
                  <SelectItem value="sociedade_civil">Sociedade Civil</SelectItem>
                  <SelectItem value="setor_produtivo">Setor Produtivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conselheiros List */}
      {filteredConselheiros.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || filterStatus !== 'todos' || filterSegmento !== 'todos'
                ? 'Nenhum conselheiro encontrado com os filtros aplicados'
                : 'Nenhum conselheiro cadastrado'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== 'todos' || filterSegmento !== 'todos'
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece cadastrando o primeiro conselheiro do CODEMA.'}
            </p>
            {!searchTerm && filterStatus === 'todos' && filterSegmento === 'todos' && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Conselheiro
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredConselheiros.map((conselheiro) => (
            <ConselheiroCard
              key={conselheiro.id}
              conselheiro={conselheiro}
              onEdit={handleEdit}
              onDelete={() => handleDeleteClick(conselheiro)}
              canEdit={true}
            />
          ))}
        </div>
      )}

      {/* Form Dialog - Mobile fullscreen */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-4xl w-full sm:w-auto h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto p-0 sm:p-6">
          <DialogHeader className="p-4 sm:p-0">
            <DialogTitle className="text-lg sm:text-xl">
              {editingConselheiro ? 'Editar Conselheiro' : 'Novo Conselheiro'}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {editingConselheiro 
                ? 'Atualize as informações do conselheiro abaixo' 
                : 'Preencha as informações para cadastrar um novo conselheiro'}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 sm:p-0">
            <ConselheiroForm
              conselheiro={editingConselheiro}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Conselheiro</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover {conselheiroToDelete?.nome_completo}?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteConselheiro.isPending}
            >
              {deleteConselheiro.isPending ? 'Removendo...' : 'Remover'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden file input for import */}
      <input
        type="file"
        ref={setImportInputRef}
        onChange={processImportFile}
        accept=".csv"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ConselheirosPage;