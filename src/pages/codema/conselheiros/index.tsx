import { useState } from 'react';
import { Plus, Search, Filter, AlertTriangle, Users } from 'lucide-react';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Alert, AlertDescription } from '@/components/ui';
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
} from '@/components/ui';

export default function ConselheirosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSegmento, setFilterSegmento] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: conselheiros = [], isLoading } = useConselheiros();
  const { data: mandatosExpirando = [] } = useConselheirosComMandatoExpirando(30);

  const filteredConselheiros = conselheiros.filter((conselheiro: Conselheiro) => {
    const matchesSearch = conselheiro.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conselheiro.entidade_representada.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegmento = !filterSegmento || conselheiro.segmento === filterSegmento;
    const matchesStatus = !filterStatus || conselheiro.status === filterStatus;
    
    return matchesSearch && matchesSegmento && matchesStatus;
  });

  const stats = {
    total: conselheiros.length,
    ativos: conselheiros.filter(c => c.status === 'ativo').length,
    governo: conselheiros.filter(c => c.segmento === 'governo').length,
    sociedadeCivil: conselheiros.filter(c => c.segmento === 'sociedade_civil').length,
    setorProdutivo: conselheiros.filter(c => c.segmento === 'setor_produtivo').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando conselheiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conselheiros CODEMA</h1>
          <p className="text-gray-600 mt-1">
            Gestão completa dos membros do Conselho Municipal de Defesa do Meio Ambiente
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Conselheiro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Conselheiro</DialogTitle>
              <DialogDescription>
                Preencha as informações do novo membro do CODEMA
              </DialogDescription>
            </DialogHeader>
            <ConselheiroForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts */}
      {mandatosExpirando.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{mandatosExpirando.length} mandato(s)</strong> expirando nos próximos 30 dias.
            Verifique a necessidade de renovação.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.ativos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Governo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.governo}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Soc. Civil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.sociedadeCivil}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">S. Produtivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.setorProdutivo}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou entidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={filterSegmento}
              onChange={(e) => setFilterSegmento(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Todos os segmentos</option>
              <option value="governo">Governo</option>
              <option value="sociedade_civil">Sociedade Civil</option>
              <option value="setor_produtivo">Setor Produtivo</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="licenciado">Licenciado</option>
              <option value="afastado">Afastado</option>
            </select>

            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conselheiros List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConselheiros.map((conselheiro) => (
          <ConselheiroCard key={conselheiro.id} conselheiro={conselheiro} />
        ))}
      </div>

      {filteredConselheiros.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum conselheiro encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterSegmento || filterStatus
                ? 'Tente ajustar os filtros para encontrar conselheiros.'
                : 'Comece cadastrando o primeiro conselheiro do CODEMA.'}
            </p>
            {!searchTerm && !filterSegmento && !filterStatus && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Conselheiro
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}