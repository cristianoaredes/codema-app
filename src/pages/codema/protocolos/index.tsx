import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loading } from '@/components/ui';
import { BreadcrumbWithActions, SmartBreadcrumb } from '@/components/navigation/SmartBreadcrumb';
import { FileText, Search, Plus, Hash, Calendar, BarChart3, RefreshCw, Info, CheckCircle, Settings, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Local type definitions to avoid import issues
type TipoProtocolo = 'PROC' | 'ATA' | 'RES' | 'CONV' | 'NOT' | 'PAR' | 'REL' | 'CERT' | 'DEC' | 'AUT';

interface ProtocoloInfo {
  tipo: TipoProtocolo;
  descricao: string;
  prefixo: string;
  cor: string;
  icone: string;
}

interface EstatisticaProtocolo {
  tipo: TipoProtocolo;
  ano: number;
  total: number;
  ultimo_numero: number;
  ultima_atualizacao: string;
}

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ElementType;
  color: string;
}

// Local protocol info
const TIPOS_PROTOCOLO_INFO: Record<TipoProtocolo, ProtocoloInfo> = {
  'PROC': { tipo: 'PROC', descricao: 'Processo Administrativo', prefixo: 'PROC', cor: 'blue', icone: '📋' },
  'ATA': { tipo: 'ATA', descricao: 'Ata de Reunião', prefixo: 'ATA', cor: 'green', icone: '📝' },
  'RES': { tipo: 'RES', descricao: 'Resolução', prefixo: 'RES', cor: 'purple', icone: '⚖️' },
  'CONV': { tipo: 'CONV', descricao: 'Convocação', prefixo: 'CONV', cor: 'yellow', icone: '📢' },
  'NOT': { tipo: 'NOT', descricao: 'Notificação', prefixo: 'NOT', cor: 'orange', icone: '📨' },
  'PAR': { tipo: 'PAR', descricao: 'Parecer Técnico', prefixo: 'PAR', cor: 'indigo', icone: '🔬' },
  'REL': { tipo: 'REL', descricao: 'Relatório', prefixo: 'REL', cor: 'teal', icone: '📊' },
  'CERT': { tipo: 'CERT', descricao: 'Certidão', prefixo: 'CERT', cor: 'pink', icone: '📜' },
  'DEC': { tipo: 'DEC', descricao: 'Declaração', prefixo: 'DEC', cor: 'gray', icone: '📄' },
  'AUT': { tipo: 'AUT', descricao: 'Autorização', prefixo: 'AUT', cor: 'red', icone: '✅' }
};

// Local protocol generation function
async function gerarProtocolo(tipo: TipoProtocolo): Promise<string> {
  const ano = new Date().getFullYear();
  const prefixo = TIPOS_PROTOCOLO_INFO[tipo].prefixo;
  
  try {
    // Tenta gerar via função do banco
    const { data, error } = await supabase
      .rpc('gerar_proximo_protocolo', { tipo_protocolo: tipo });
    if (!error && data) return data as string;
  } catch (error) {
    console.warn('Database unavailable, generating locally:', error);
  }
  
  // Fallback to local generation
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const numero = `${timestamp}${random}`.slice(-3).padStart(3, '0');
  return `${prefixo}-${numero}/${ano}`;
}

// Validate protocol format
function validarFormatoProtocolo(protocolo: string): boolean {
  const regex = /^[A-Z]+-\d{3}\/\d{4}$/;
  return regex.test(protocolo);
}

// Extract protocol info
function extrairInfoProtocolo(protocolo: string): { tipo: string; numero: number; ano: number } | null {
  const match = protocolo.match(/^([A-Z]+)-(\d{3})\/(\d{4})$/);
  if (!match) return null;
  
  return {
    tipo: match[1],
    numero: parseInt(match[2]),
    ano: parseInt(match[3])
  };
}

// Get next protocol number
async function consultarProximoProtocolo(tipo: TipoProtocolo): Promise<string> {
  const ano = new Date().getFullYear();
  const prefixo = TIPOS_PROTOCOLO_INFO[tipo].prefixo;
  
  try {
    const { data, error } = await supabase
      .rpc('consultar_proximo_protocolo', { tipo_protocolo: tipo });
    if (!error && data) return data as string;
  } catch (error) {
    console.warn('Database unavailable:', error);
  }
  
  // Fallback
  return `${prefixo}-001/${ano}`;
}

// Get protocol statistics
async function obterEstatisticasProtocolos(ano?: number): Promise<EstatisticaProtocolo[]> {
  try {
    const { data, error } = await supabase
      .rpc('obter_estatisticas_protocolos', { ano_filtro: ano });
    if (!error && Array.isArray(data)) {
      return data.map((d: any) => ({
        tipo: d.tipo as TipoProtocolo,
        ano: d.ano as number,
        total: (d.total_gerados ?? 0) as number,
        ultimo_numero: (d.ultimo_numero ?? 0) as number,
        ultima_atualizacao: d.ultima_atualizacao as string,
      }));
    }
  } catch (error) {
    console.warn('Statistics unavailable:', error);
  }
  
  // Return empty statistics
  return Object.keys(TIPOS_PROTOCOLO_INFO).map(tipo => ({
    tipo: tipo as TipoProtocolo,
    ano: ano || new Date().getFullYear(),
    total: 0,
    ultimo_numero: 0,
    ultima_atualizacao: new Date().toISOString()
  }));
}

// Stat Card Component
function StatCard({ title, value, description, icon: Icon, color }: StatCardProps) {
  return (
    <Card className={`hover:shadow-lg transition-shadow`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-500`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function GestaoProtocolos() {
  const [loading, setLoading] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoProtocolo>('PROC');
  const [protocoloGerado, setProtocoloGerado] = useState<string>('');
  const [protocoloConsulta, setProtocoloConsulta] = useState('');
  const [resultadoConsulta, setResultadoConsulta] = useState<any>(null);
  const [estatisticas, setEstatisticas] = useState<EstatisticaProtocolo[]>([]);
  const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear());
  const [proximoNumero, setProximoNumero] = useState<string>('');

  useEffect(() => {
    carregarEstatisticas();
  }, [anoFiltro]);

  useEffect(() => {
    consultarProximo();
  }, [tipoSelecionado]);

  const carregarEstatisticas = async () => {
    setLoading(true);
    try {
      const stats = await obterEstatisticasProtocolos(anoFiltro);
      setEstatisticas(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const consultarProximo = async () => {
    try {
      const proximo = await consultarProximoProtocolo(tipoSelecionado);
      setProximoNumero(proximo);
    } catch (error) {
      console.error('Erro ao consultar próximo número:', error);
    }
  };

  const handleGerarProtocolo = async () => {
    setLoading(true);
    try {
      const novoProtocolo = await gerarProtocolo(tipoSelecionado);
      setProtocoloGerado(novoProtocolo);
      
      toast.success(`Protocolo ${novoProtocolo} gerado com sucesso!`);
      
      // Refresh statistics and next number
      await carregarEstatisticas();
      await consultarProximo();
    } catch (error) {
      console.error('Erro ao gerar protocolo:', error);
      toast.error('Erro ao gerar protocolo');
    } finally {
      setLoading(false);
    }
  };

  const handleConsultarProtocolo = () => {
    if (!protocoloConsulta) {
      toast.error('Digite um protocolo para consultar');
      return;
    }

    if (!validarFormatoProtocolo(protocoloConsulta)) {
      toast.error('Formato de protocolo inválido. Use: XXX-000/0000');
      return;
    }

    const info = extrairInfoProtocolo(protocoloConsulta);
    if (info) {
      setResultadoConsulta(info);
      toast.success('Protocolo válido!');
    } else {
      setResultadoConsulta(null);
      toast.error('Não foi possível extrair informações do protocolo');
    }
  };

  const handleCopiarProtocolo = (protocolo: string) => {
    navigator.clipboard.writeText(protocolo);
    toast.success('Protocolo copiado para a área de transferência!');
  };

  const getTiposDisponiveis = () => {
    const anos = new Set(estatisticas.map(e => e.ano));
    return [anoFiltro, ...Array.from(anos)].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => b - a).map(ano => ({
      value: ano,
      label: ano.toString()
    }));
  };

  const totalProtocolos = estatisticas.reduce((acc, stat) => acc + stat.total, 0);
  const tiposAtivos = estatisticas.filter(stat => stat.total > 0).length;

  return (
    <div className="space-y-6">
      <BreadcrumbWithActions
        title="Gestão de Protocolos"
        description="Sistema completo de geração e controle de protocolos do CODEMA"
        actions={
          <div className="flex items-center space-x-4">
            <Select value={anoFiltro.toString()} onValueChange={(value) => setAnoFiltro(parseInt(value))}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                {getTiposDisponiveis().map((ano) => (
                  <SelectItem key={ano.value} value={ano.value.toString()}>{ano.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={carregarEstatisticas} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        }
      >
        <SmartBreadcrumb />
      </BreadcrumbWithActions>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total de Protocolos" value={totalProtocolos} description={`Em ${anoFiltro}`} icon={FileText} color="blue" />
        <StatCard title="Tipos Ativos" value={tiposAtivos} description={`De ${Object.keys(TIPOS_PROTOCOLO_INFO).length} tipos`} icon={Hash} color="green" />
        <StatCard title="Últimos 30 dias" value={estatisticas.filter(stat => {
          const dataAtualizacao = new Date(stat.ultima_atualizacao);
          const trintaDiasAtras = new Date();
          trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
          return dataAtualizacao > trintaDiasAtras;
        }).reduce((acc, stat) => acc + stat.total, 0)} description="Protocolos recentes" icon={Calendar} color="purple" />
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="gerar" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gerar">Gerar Protocolo</TabsTrigger>
          <TabsTrigger value="consultar">Consultar</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        {/* Generate Protocol Tab */}
        <TabsContent value="gerar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerar Novo Protocolo</CardTitle>
              <CardDescription>
                Selecione o tipo de documento e gere um número de protocolo único
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Protocolo</Label>
                  <Select value={tipoSelecionado} onValueChange={(value) => setTipoSelecionado(value as TipoProtocolo)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIPOS_PROTOCOLO_INFO).map(([key, info]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span>{info.icone}</span>
                            <span>{info.descricao}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Próximo Número</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {proximoNumero || 'Carregando...'}
                    </Badge>
                  </div>
                </div>
              </div>

              {protocoloGerado && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>Protocolo gerado: <strong>{protocoloGerado}</strong></span>
                    <Button size="sm" variant="outline" onClick={() => handleCopiarProtocolo(protocoloGerado)}>
                      Copiar
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleGerarProtocolo} disabled={loading} className="w-full">
                {loading ? <Loading type="spinner" /> : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Gerar Protocolo
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Query Tab */}
        <TabsContent value="consultar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consultar Protocolo</CardTitle>
              <CardDescription>
                Digite um número de protocolo para validar e obter informações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Ex: PROC-001/2024"
                  value={protocoloConsulta}
                  onChange={(e) => setProtocoloConsulta(e.target.value.toUpperCase())}
                />
                <Button onClick={handleConsultarProtocolo}>
                  <Search className="h-4 w-4 mr-2" />
                  Consultar
                </Button>
              </div>

              {resultadoConsulta && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p><strong>Tipo:</strong> {resultadoConsulta.tipo}</p>
                      <p><strong>Número:</strong> {resultadoConsulta.numero}</p>
                      <p><strong>Ano:</strong> {resultadoConsulta.ano}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="estatisticas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas por Tipo</CardTitle>
              <CardDescription>
                Visão geral dos protocolos gerados em {anoFiltro}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loading type="spinner" className="py-8" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Último Número</TableHead>
                      <TableHead>Última Atualização</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estatisticas.map((stat) => {
                      const info = TIPOS_PROTOCOLO_INFO[stat.tipo];
                      return (
                        <TableRow key={stat.tipo}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <span>{info?.icone || '📄'}</span>
                              <span>{stat.tipo}</span>
                            </div>
                          </TableCell>
                          <TableCell>{info?.descricao || 'Desconhecido'}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={stat.total > 0 ? "default" : "secondary"}>
                              {stat.total}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{stat.ultimo_numero}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(stat.ultima_atualizacao).toLocaleDateString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Resumo Anual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(TIPOS_PROTOCOLO_INFO).slice(0, 5).map(([tipo, info]) => {
                  const stat = estatisticas.find(s => s.tipo === tipo);
                  return (
                    <div key={tipo} className="text-center">
                      <div className="text-2xl mb-1">{info.icone}</div>
                      <div className="text-sm font-medium">{tipo}</div>
                      <div className="text-2xl font-bold">{stat?.total || 0}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="configuracoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Gerencie as configurações de geração de protocolos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Informações do Sistema:</p>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• Prefixo do município: CODEMA/ITH</li>
                      <li>• Formato: TIPO-XXX/AAAA</li>
                      <li>• Reinício anual: Sim (01/Janeiro)</li>
                      <li>• Backup automático: Ativo</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label>Tipos de Protocolo Disponíveis</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {Object.entries(TIPOS_PROTOCOLO_INFO).map(([tipo, info]) => (
                      <div key={tipo} className="flex items-center space-x-2 p-2 border rounded">
                        <span>{info.icone}</span>
                        <span className="text-sm font-medium">{tipo}</span>
                        <span className="text-xs text-muted-foreground">- {info.descricao}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Para modificar configurações avançadas, entre em contato com o administrador do sistema.
                </AlertDescription>
              </Alert>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}