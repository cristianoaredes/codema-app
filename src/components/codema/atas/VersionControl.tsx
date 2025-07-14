import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History, Eye, FileText, User, Clock, ArrowRight, GitBranch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { supabase } from "@/integrations/supabase/client";

interface VersionControlProps {
  ataId: string;
  currentVersion: number;
}

interface AtaVersion {
  id: string;
  versao: number;
  conteudo: any;
  modificacoes: string;
  created_at: string;
  created_by: string;
  profiles: {
    full_name: string;
    role: string;
  };
}

export function VersionControl({ ataId, currentVersion }: VersionControlProps) {
  const [selectedVersions, setSelectedVersions] = useState<[number, number] | null>(null);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<AtaVersion | null>(null);

  // Buscar versões da ata
  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['ata-versions', ataId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('atas_versoes')
        .select(`
          *,
          profiles:created_by(full_name, role)
        `)
        .eq('ata_id', ataId)
        .order('versao', { ascending: false });

      if (error) throw error;
      return data as AtaVersion[];
    },
  });

  const getVersionBadge = (versao: number) => {
    if (versao === currentVersion) {
      return <Badge variant="default">Atual</Badge>;
    }
    return <Badge variant="outline">v{versao}</Badge>;
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: 'Administrador',
      secretario: 'Secretário',
      presidente: 'Presidente',
      conselheiro_titular: 'Conselheiro Titular',
      conselheiro_suplente: 'Conselheiro Suplente',
    };
    return roleMap[role] || role;
  };

  const compareVersions = (v1: number, v2: number) => {
    const version1 = versions.find(v => v.versao === v1);
    const version2 = versions.find(v => v.versao === v2);
    
    if (!version1 || !version2) return null;

    const changes = {
      pauta: compareArrays(version1.conteudo.pauta || [], version2.conteudo.pauta || []),
      presentes: compareArrays(version1.conteudo.presentes || [], version2.conteudo.presentes || []),
      deliberacoes: compareArrays(version1.conteudo.deliberacoes || [], version2.conteudo.deliberacoes || []),
      observacoes: version1.conteudo.observacoes !== version2.conteudo.observacoes,
    };

    return changes;
  };

  const compareArrays = (arr1: any[], arr2: any[]) => {
    if (arr1.length !== arr2.length) return true;
    return JSON.stringify(arr1) !== JSON.stringify(arr2);
  };

  const formatJsonContent = (content: any) => {
    return JSON.stringify(content, null, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Controle de Versões
          </h3>
          <p className="text-sm text-muted-foreground">
            Histórico completo de modificações da ata
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          v{currentVersion}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{versions.length}</div>
            <p className="text-xs text-muted-foreground">Versões</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{currentVersion}</div>
            <p className="text-xs text-muted-foreground">Versão Atual</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {versions.length > 0 ? Math.floor((Date.now() - new Date(versions[versions.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Dias desde criação</p>
          </CardContent>
        </Card>
      </div>

      {/* Versions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Versões</CardTitle>
          <CardDescription>
            Todas as modificações registradas da ata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Versão</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Modificado por</TableHead>
                <TableHead>Modificações</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((version) => (
                <TableRow key={version.id}>
                  <TableCell>
                    {getVersionBadge(version.versao)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {format(new Date(version.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{version.profiles?.full_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {getRoleLabel(version.profiles?.role || '')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <p className="text-sm truncate">
                      {version.modificacoes || 'Modificações automáticas do sistema'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedVersion(version)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh]">
                          <DialogHeader>
                            <DialogTitle>
                              Ata - Versão {version.versao}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span className="text-sm">
                                  {version.profiles?.full_name} - {getRoleLabel(version.profiles?.role || '')}
                                </span>
                              </div>
                              <Badge variant="outline">
                                {format(new Date(version.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </Badge>
                            </div>
                            
                            <Separator />
                            
                            <Tabs defaultValue="pauta" className="w-full">
                              <TabsList>
                                <TabsTrigger value="pauta">Pauta</TabsTrigger>
                                <TabsTrigger value="presentes">Presentes</TabsTrigger>
                                <TabsTrigger value="deliberacoes">Deliberações</TabsTrigger>
                                <TabsTrigger value="observacoes">Observações</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="pauta">
                                <ScrollArea className="h-[400px]">
                                  <div className="space-y-2">
                                    {(version.conteudo.pauta || []).map((item: any, index: number) => (
                                      <Card key={index}>
                                        <CardContent className="pt-4">
                                          <h4 className="font-medium">{item.titulo}</h4>
                                          <p className="text-sm text-muted-foreground mt-1">
                                            {item.descricao}
                                          </p>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </TabsContent>
                              
                              <TabsContent value="presentes">
                                <ScrollArea className="h-[400px]">
                                  <div className="space-y-2">
                                    {(version.conteudo.presentes || []).map((presente: any, index: number) => (
                                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                                        <span>{presente.nome}</span>
                                        <Badge variant="outline">{presente.cargo}</Badge>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </TabsContent>
                              
                              <TabsContent value="deliberacoes">
                                <ScrollArea className="h-[400px]">
                                  <div className="space-y-2">
                                    {(version.conteudo.deliberacoes || []).map((delib: any, index: number) => (
                                      <Card key={index}>
                                        <CardContent className="pt-4">
                                          <p className="text-sm">{delib.decisao}</p>
                                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                            <span>Favor: {delib.votos_favor}</span>
                                            <span>Contra: {delib.votos_contra}</span>
                                            <span>Abstenções: {delib.abstencoes}</span>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </TabsContent>
                              
                              <TabsContent value="observacoes">
                                <ScrollArea className="h-[400px]">
                                  <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm whitespace-pre-wrap">
                                      {version.conteudo.observacoes || 'Nenhuma observação registrada'}
                                    </p>
                                  </div>
                                </ScrollArea>
                              </TabsContent>
                            </Tabs>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {versions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <History className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">Nenhuma versão encontrada</p>
                      <p className="text-sm text-muted-foreground">
                        As versões são criadas automaticamente quando a ata é modificada
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Version Comparison */}
      {versions.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparar Versões</CardTitle>
            <CardDescription>
              Compare diferenças entre duas versões da ata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <label className="text-sm font-medium">Versão Base</label>
                <select 
                  className="w-full mt-1 p-2 border rounded"
                  value={selectedVersions?.[0] || ''}
                  onChange={(e) => setSelectedVersions([parseInt(e.target.value), selectedVersions?.[1] || 0])}
                >
                  <option value="">Selecione...</option>
                  {versions.map(v => (
                    <option key={v.versao} value={v.versao}>
                      Versão {v.versao}
                    </option>
                  ))}
                </select>
              </div>
              
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
              
              <div className="flex-1">
                <label className="text-sm font-medium">Versão Comparada</label>
                <select 
                  className="w-full mt-1 p-2 border rounded"
                  value={selectedVersions?.[1] || ''}
                  onChange={(e) => setSelectedVersions([selectedVersions?.[0] || 0, parseInt(e.target.value)])}
                >
                  <option value="">Selecione...</option>
                  {versions.map(v => (
                    <option key={v.versao} value={v.versao}>
                      Versão {v.versao}
                    </option>
                  ))}
                </select>
              </div>
              
              <Button 
                disabled={!selectedVersions || selectedVersions[0] === selectedVersions[1]}
                onClick={() => {
                  if (selectedVersions) {
                    const changes = compareVersions(selectedVersions[0], selectedVersions[1]);
                    console.log('Mudanças detectadas:', changes);
                  }
                }}
              >
                Comparar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}