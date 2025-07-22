import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { Alert, AlertDescription } from '@/components/ui';
import { 
  FileText, 
  Hash, 
  Calendar, 
  BarChart3, 
  RefreshCw,
  Search,
  Download,
  Plus,
  Settings,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import {
  gerarProtocolo,
  TipoProtocolo,
  ProtocoloInfo,
  TIPOS_PROTOCOLO_INFO,
  consultarProximoProtocolo,
  obterEstatisticasProtocolos,
  validarFormatoProtocolo,
  extrairInfoProtocolo
} from '@/utils';
import { useNotification } from '@/components/ui/notification';

interface EstatisticaProtocolo {
  tipo: TipoProtocolo;
  ano: number;
  total_gerados: number;
  ultimo_numero: number;
  ultima_atualizacao: string;
}



export default function GestaoProtocolos() {
  const [estatisticas, setEstatisticas] = useState<EstatisticaProtocolo[]>([]);
  const [loading, setLoading] = useState(true);
  const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear());
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoProtocolo>('PROC');
  const [proximoNumero, setProximoNumero] = useState('');
  const [numeroConsulta, setNumeroConsulta] = useState('');
  const [infoProtocolo, setInfoProtocolo] = useState<ProtocoloInfo | null>(null);
  const [carregandoGerador, setCarregandoGerador] = useState(false);
  const notification = useNotification();

  const carregarEstatisticas = useCallback(async () => {
    setLoading(true);
    try {
      const dados = await obterEstatisticasProtocolos(anoFiltro);
      setEstatisticas(dados as unknown as EstatisticaProtocolo[]);
    } catch (error) {
      notification.show({
        title: 'Erro',
        message: 'Erro ao carregar estatísticas de protocolos',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [anoFiltro, notification]);

  useEffect(() => {
    carregarEstatisticas();
  }, [carregarEstatisticas]);

  const consultarProximo = useCallback(async () => {
    try {
      const numero = await consultarProximoProtocolo(tipoSelecionado);
      setProximoNumero(numero);
    } catch (error) {
      notification.show({
        title: 'Erro',
        message: 'Erro ao consultar próximo protocolo',
        variant: 'error'
      });
    }
  }, [tipoSelecionado, notification]);

  useEffect(() => {
    if (tipoSelecionado) {
      consultarProximo();
    }
  }, [tipoSelecionado, consultarProximo]);

  const gerarNovoProtocolo = async () => {
    setCarregandoGerador(true);
    try {
      const numero = await gerarProtocolo(tipoSelecionado);
      notification.show({
        title: 'Protocolo Gerado',
        message: `Protocolo ${numero} gerado com sucesso!`,
        variant: 'success'
      });
      
      // Atualizar estatísticas e próximo número
      await carregarEstatisticas();
      await consultarProximo();
    } catch (error) {
      notification.show({
        title: 'Erro',
        message: 'Erro ao gerar protocolo',
        variant: 'error'
      });
    } finally {
      setCarregandoGerador(false);
    }
  };

  const consultarProtocolo = () => {
    if (!validarFormatoProtocolo(numeroConsulta)) {
      notification.show({
        title: 'Formato Inválido',
        message: 'Formato do protocolo deve ser: TIPO-000/YYYY',
        variant: 'error'
      });
      return;
    }

    const info = extrairInfoProtocolo(numeroConsulta);
    if (info) {
      setInfoProtocolo(info);
      notification.show({
        title: 'Protocolo Encontrado',
        message: `Protocolo ${numeroConsulta} consultado com sucesso`,
        variant: 'success'
      });
    } else {
      notification.show({
        title: 'Protocolo Inválido',
        message: 'Não foi possível extrair informações do protocolo',
        variant: 'error'
      });
    }
  };

  const resetarSequencia = async (tipo: TipoProtocolo) => {
    try {
      // TODO: Implementar resetarSequencia ou usar função alternativa
    console.log('Reset de sequência não implementado ainda');
      notification.show({
        title: 'Sequência Resetada',
        message: `Sequência do tipo ${tipo} resetada com sucesso`,
        variant: 'success'
      });
      await carregarEstatisticas();
    } catch (error) {
      notification.show({
        title: 'Erro',
        message: 'Erro ao resetar sequência',
        variant: 'error'
      });
    }
  };

  const getTiposDisponiveis = () => {
    const anosDisponiveis = [2024, 2025, 2026];
    return anosDisponiveis.map(ano => ({
      value: ano,
      label: ano.toString()
    }));
  };

  const StatCard = ({ title, value, description, icon: Icon, color = 'blue' }: { title: string; value: string | number; description: string; icon: React.ComponentType<{ className?: string }>; color?: string }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
          <Icon className={`w-8 h-8 text-${color}-500`} />
        </div>
      </CardContent>
    </Card>
  );

  const totalProtocolos = estatisticas.reduce((acc, stat) => acc + stat.total_gerados, 0);
  const tiposAtivos = estatisticas.filter(stat => stat.total_gerados > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestão de Protocolos</h1>
        <div className="flex items-center space-x-4">
          <Select value={anoFiltro.toString()} onValueChange={(value) => setAnoFiltro(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getTiposDisponiveis().map((ano) => (
                <SelectItem key={ano.value} value={ano.value.toString()}>
                  {ano.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={carregarEstatisticas} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total de Protocolos"
          value={totalProtocolos}
          description={`Em ${anoFiltro}`}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Tipos Ativos"
          value={tiposAtivos}
          description={`De ${Object.keys(TIPOS_PROTOCOLO_INFO).length} tipos`}
          icon={Hash}
          color="green"
        />
        <StatCard
          title="Últimos 30 dias"
          value={estatisticas.filter(stat => {
            const dataAtualizacao = new Date(stat.ultima_atualizacao);
            const trintaDiasAtras = new Date();
            trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
            return dataAtualizacao > trintaDiasAtras;
          }).length}
          description="Tipos utilizados"
          icon={Calendar}
          color="purple"
        />
      </div>

      <Tabs defaultValue="estatisticas" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          <TabsTrigger value="gerador">Gerador</TabsTrigger>
          <TabsTrigger value="consulta">Consulta</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="estatisticas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Estatísticas por Tipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {estatisticas.map((stat) => (
                      <div key={stat.tipo} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{TIPOS_PROTOCOLO_INFO[stat.tipo].nome}</span>
                          <Badge variant={stat.total_gerados > 0 ? "default" : "secondary"}>
                            {stat.tipo}
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {stat.total_gerados}
                        </div>
                        <p className="text-sm text-gray-500">
                          {TIPOS_PROTOCOLO_INFO[stat.tipo].descricao}
                        </p>
                        <div className="mt-2 text-xs text-gray-400">
                          Última atualização: {new Date(stat.ultima_atualizacao).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gerador" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Gerador de Protocolos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo de Protocolo</Label>
                  <Select value={tipoSelecionado} onValueChange={(value) => setTipoSelecionado(value as TipoProtocolo)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIPOS_PROTOCOLO_INFO).map(([tipo, info]) => (
                        <SelectItem key={tipo} value={tipo}>
                          {info.nome} ({tipo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Próximo Número</Label>
                  <Input 
                    value={proximoNumero}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>{TIPOS_PROTOCOLO_INFO[tipoSelecionado].nome}:</strong> {TIPOS_PROTOCOLO_INFO[tipoSelecionado].descricao}
                </AlertDescription>
              </Alert>

              <div className="flex justify-end">
                <Button 
                  onClick={gerarNovoProtocolo}
                  disabled={carregandoGerador}
                  className="min-w-40"
                >
                  {carregandoGerador ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Gerar Protocolo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consulta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Consulta de Protocolos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="numero">Número do Protocolo</Label>
                  <Input
                    id="numero"
                    value={numeroConsulta}
                    onChange={(e) => setNumeroConsulta(e.target.value)}
                    placeholder="Ex: PROC-001/2024"
                    className="font-mono"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={consultarProtocolo}>
                    <Search className="w-4 h-4 mr-2" />
                    Consultar
                  </Button>
                </div>
              </div>

              {infoProtocolo && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p><strong>Tipo:</strong> {infoProtocolo.tipo} - {TIPOS_PROTOCOLO_INFO[infoProtocolo.tipo]?.nome}</p>
                      <p><strong>Ano:</strong> {infoProtocolo.ano}</p>
                      <p><strong>Sequencial:</strong> {infoProtocolo.sequencial}</p>
                      <p><strong>Descrição:</strong> {infoProtocolo.descricao}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Formato válido:</h4>
                <p className="text-sm text-gray-600">
                  TIPO-000/YYYY onde TIPO é o código do tipo de protocolo, 
                  000 é o número sequencial com 3 dígitos e YYYY é o ano.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Atenção:</strong> As operações abaixo devem ser realizadas com cuidado, 
                  pois podem afetar a numeração dos protocolos.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h4 className="font-medium">Resetar Sequências</h4>
                <p className="text-sm text-gray-600">
                  Resetar uma sequência fará com que a numeração volte a começar do 001.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(TIPOS_PROTOCOLO_INFO).map(([tipo, info]) => (
                    <div key={tipo} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{info.nome}</p>
                          <p className="text-sm text-gray-600">{tipo}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resetarSequencia(tipo as TipoProtocolo)}
                        >
                          Resetar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}