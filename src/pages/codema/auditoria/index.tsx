import { useState } from 'react';
import { Search, Filter, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BreadcrumbWithActions, SmartBreadcrumb } from '@/components/navigation/SmartBreadcrumb';
import { LoadingSpinner } from '@/components/ui/loading';
import { useAuditLogs } from '@/hooks';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AuditoriaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterEntity, setFilterEntity] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const { data: logs = [], isLoading } = useAuditLogs({
    search: searchTerm,
    action: filterAction,
    entity: filterEntity,
    dateStart: dateRange.start,
    dateEnd: dateRange.end
  });

  const handleExport = () => {
    if (logs.length === 0) return;
    
    const csvHeaders = ['Data/Hora', 'Usuário', 'Email', 'Ação', 'Entidade', 'ID Entidade', 'IP', 'Detalhes'];
    const csvRows = logs.map(log => [
      format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
      log.profiles?.full_name || 'Sistema',
      log.profiles?.email || '',
      getActionLabel(log.action),
      getEntityLabel(log.entity),
      log.entity_id || '',
      log.ip_address || '',
      log.details ? JSON.stringify(log.details) : ''
    ]);
    
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new globalThis.Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `auditoria_codema_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    link.click();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterAction('');
    setFilterEntity('');
    setDateRange({ start: '', end: '' });
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
      'CREATE': 'Criação', 'UPDATE': 'Atualização', 'DELETE': 'Exclusão',
      'LOGIN': 'Login', 'LOGOUT': 'Logout', 'VIEW': 'Visualização', 'EXPORT': 'Exportação'
    };
    return labels[action.toUpperCase()] || action;
  };

  const getEntityLabel = (entity: string) => {
    const labels: Record<string, string> = {
      'conselheiro': 'Conselheiro', 'reuniao': 'Reunião', 'processo': 'Processo',
      'documento': 'Documento', 'resolucao': 'Resolução', 'impedimento': 'Impedimento', 'user': 'Usuário'
    };
    return labels[entity] || entity;
  };

  if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><LoadingSpinner /></div>;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <BreadcrumbWithActions
          title="Logs de Auditoria"
          description="Registro completo de todas as ações no sistema para conformidade com TCE-MG"
          actions={
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleExport} disabled={logs.length === 0}>
                  <Download className="h-4 w-4 mr-2" />Exportar TCE-MG
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Exportar logs em formato CSV para TCE-MG</p></TooltipContent>
            </Tooltip>
          }
        >
          <SmartBreadcrumb />
        </BreadcrumbWithActions>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros e Busca</CardTitle>
            <CardDescription>Filtre os logs por período, ação ou entidade para análise específica</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input placeholder="Buscar usuário ou detalhes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger><SelectValue placeholder="Filtrar por ação" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CREATE">Criação</SelectItem>
                  <SelectItem value="UPDATE">Atualização</SelectItem>
                  <SelectItem value="DELETE">Exclusão</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterEntity} onValueChange={setFilterEntity}>
                <SelectTrigger><SelectValue placeholder="Filtrar por entidade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="conselheiro">Conselheiro</SelectItem>
                  <SelectItem value="reuniao">Reunião</SelectItem>
                  <SelectItem value="processo">Processo</SelectItem>
                  <SelectItem value="documento">Documento</SelectItem>
                  <SelectItem value="resolucao">Resolução</SelectItem>
                  <SelectItem value="impedimento">Impedimento</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" value={dateRange.start} onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} placeholder="Data início" />
              <Input type="date" value={dateRange.end} onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} placeholder="Data fim" />
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={handleClearFilters}><Filter className="h-4 w-4 mr-2" />Limpar Filtros</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registros de Auditoria</CardTitle>
            <CardDescription>{logs.length} registro(s) encontrado(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Data/Hora</TableHead><TableHead>Usuário</TableHead><TableHead>Ação</TableHead><TableHead>Entidade</TableHead><TableHead>ID</TableHead><TableHead>IP</TableHead><TableHead>Detalhes</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">{format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{log.profiles?.full_name || 'Sistema'}</span>
                        <span className="text-xs text-muted-foreground">{log.profiles?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge className={getActionColor(log.action)}>{getActionLabel(log.action)}</Badge></TableCell>
                    <TableCell><span className="capitalize">{getEntityLabel(log.entity)}</span></TableCell>
                    <TableCell className="font-mono text-xs">{log.entity_id?.slice(0, 8)}...</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.ip_address}</TableCell>
                    <TableCell>
                      {log.details && (
                        <Tooltip>
                          <TooltipTrigger asChild><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></TooltipTrigger>
                          <TooltipContent><p>Ver detalhes da ação</p></TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {logs.length === 0 && (
              <div className="text-center py-12">
                <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum log encontrado</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterAction || filterEntity ? 'Tente ajustar os filtros para encontrar registros.' : 'Ainda não há registros de auditoria.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}