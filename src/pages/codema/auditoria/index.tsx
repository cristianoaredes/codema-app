import { useState } from 'react';
import { Search, Filter, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { useAuditLogs } from '@/hooks';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AuditoriaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterEntity, setFilterEntity] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const { data: logs = [], isLoading } = useAuditLogs({
    search: searchTerm,
    action: filterAction,
    entity: filterEntity,
    dateStart: dateRange.start,
    dateEnd: dateRange.end
  });

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exportar logs para TCE-MG');
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'login': return 'bg-yellow-100 text-yellow-800';
      case 'logout': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'CREATE': 'Criação',
      'UPDATE': 'Atualização',
      'DELETE': 'Exclusão',
      'LOGIN': 'Login',
      'LOGOUT': 'Logout',
      'VIEW': 'Visualização',
      'EXPORT': 'Exportação'
    };
    return labels[action.toUpperCase()] || action;
  };

  const getEntityLabel = (entity: string) => {
    const labels: Record<string, string> = {
      'conselheiro': 'Conselheiro',
      'reuniao': 'Reunião',
      'processo': 'Processo',
      'documento': 'Documento',
      'resolucao': 'Resolução',
      'impedimento': 'Impedimento',
      'user': 'Usuário'
    };
    return labels[entity] || entity;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando logs de auditoria...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logs de Auditoria</h1>
          <p className="text-gray-600 mt-1">
            Registro completo de todas as ações no sistema para conformidade com TCE-MG
          </p>
        </div>
        
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar TCE-MG
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros e Busca</CardTitle>
          <CardDescription>
            Filtre os logs por período, ação ou entidade para análise específica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar usuário ou detalhes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as ações</SelectItem>
                <SelectItem value="CREATE">Criação</SelectItem>
                <SelectItem value="UPDATE">Atualização</SelectItem>
                <SelectItem value="DELETE">Exclusão</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterEntity} onValueChange={setFilterEntity}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por entidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as entidades</SelectItem>
                <SelectItem value="conselheiro">Conselheiro</SelectItem>
                <SelectItem value="reuniao">Reunião</SelectItem>
                <SelectItem value="processo">Processo</SelectItem>
                <SelectItem value="documento">Documento</SelectItem>
                <SelectItem value="resolucao">Resolução</SelectItem>
                <SelectItem value="impedimento">Impedimento</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              placeholder="Data início"
            />

            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              placeholder="Data fim"
            />
          </div>

          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterAction('');
                setFilterEntity('');
                setDateRange({ start: '', end: '' });
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Auditoria</CardTitle>
          <CardDescription>
            {logs.length} registro(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {log.profiles?.full_name || 'Sistema'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {log.profiles?.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionColor(log.action)}>
                      {getActionLabel(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">
                      {getEntityLabel(log.entity)}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.entity_id?.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {log.ip_address}
                  </TableCell>
                  <TableCell>
                    {log.details && (
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {logs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <Eye className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum log encontrado
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterAction || filterEntity
                  ? 'Tente ajustar os filtros para encontrar registros.'
                  : 'Ainda não há registros de auditoria.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}