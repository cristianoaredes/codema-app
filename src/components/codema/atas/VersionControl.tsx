import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Eye, History, GitBranch, ArrowRight, User } from 'lucide-react';

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

interface RawAtaVersion {
  id: string;
  versao: number;
  conteudo: Record<string, unknown>;
  modificacoes: string;
  created_at: string;
  created_by: string;
}

interface RawProfile {
  id: string;
  full_name: string;
  role: string;
}

// Define the items within the content structure
interface PautaItem {
  titulo: string;
  descricao: string;
}

interface DeliberacaoItem {
  status: string;
  numero: string;
  titulo: string;
  descricao: string;
}

interface _AnexoItem {
  nome: string;
  url?: string;
}

// Type for Supabase response to avoid 'any' usage
type SupabaseResponse<T> = {
  data: T | null;
  error: Error | null;
};

// Resulting enhanced version type - matches how it's used in the code
interface AtaVersion {
  id: string;
  versao: number;
  conteudo: Record<string, unknown>;
  modificacoes: string;
  created_at: string;
  created_by: string;
  profiles: RawProfile | null;
}

export function VersionControl({ ataId, currentVersion }: VersionControlProps) {
  const [selectedVersions, setSelectedVersions] = useState<[number, number] | null>(null);
  const [_showVersionDialog, _setShowVersionDialog] = useState(false);
  const [_selectedVersion, setSelectedVersion] = useState<AtaVersion | null>(null);

  // Buscar versões da ata
  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['ata-versions', ataId],
    queryFn: async (): Promise<AtaVersion[]> => {
      try {
        // Step 1: Get versions data with proper typing
        const versionsResponse = await (supabase as unknown as {
          from: (table: string) => {
            select: (columns: string) => {
              eq: (column: string, value: string) => {
                order: (column: string, options: { ascending: boolean }) => Promise<SupabaseResponse<RawAtaVersion[]>>;
              };
            };
          };
        })
          .from('atas_versoes')
          .select('id, versao, conteudo, modificacoes, created_at, created_by')
          .eq('ata_id', ataId)
          .order('versao', { ascending: false });

        if (versionsResponse.error) throw versionsResponse.error;
        
        const versionsData = versionsResponse.data;
        
        if (!versionsData || versionsData.length === 0) {
          return [];
        }

        // Step 2: Get profiles data separately
        const userIds = versionsData.map((v: RawAtaVersion) => v.created_by).filter(Boolean);
        
        if (userIds.length === 0) {
          return versionsData.map((version: RawAtaVersion) => ({
            id: version.id,
            versao: version.versao,
            conteudo: version.conteudo || {},
            modificacoes: version.modificacoes || '',
            created_at: version.created_at,
            created_by: version.created_by,
            profiles: null
          })) as AtaVersion[];
        }

        const profilesResponse = await (supabase as unknown as {
          from: (table: string) => {
            select: (columns: string) => {
              in: (column: string, values: string[]) => Promise<SupabaseResponse<RawProfile[]>>;
            };
          };
        })
          .from('profiles')
          .select('id, full_name, role')
          .in('id', userIds);

        if (profilesResponse.error) throw profilesResponse.error;
        
        const profilesData = profilesResponse.data;

        // Step 3: Combine data manually with explicit typing
        const result: AtaVersion[] = versionsData.map((version: RawAtaVersion) => ({
          id: version.id,
          versao: version.versao,
          conteudo: version.conteudo || {},
          modificacoes: version.modificacoes || '',
          created_at: version.created_at,
          created_by: version.created_by,
          profiles: profilesData?.find((p: RawProfile) => p.id === version.created_by) || null
        }));

        return result;
      } catch (error) {
        console.error('Error fetching ata versions:', error);
        return [];
      }
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

  // Helper function to safely convert unknown to array
  const ensureArray = (value: unknown): unknown[] => {
    if (Array.isArray(value)) {
      return value;
    }
    return [];
  };

  // Helper function to ensure unknown values are safely rendered as strings
  const ensureString = (value: unknown): string => {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  };

  const compareVersions = (v1: number, v2: number) => {
    const version1 = versions.find(v => v.versao === v1);
    const version2 = versions.find(v => v.versao === v2);
    
    if (!version1 || !version2) return null;

    const changes = {
      pauta: compareArrays(
        ensureArray(version1.conteudo.pauta), 
        ensureArray(version2.conteudo.pauta)
      ),
      presentes: compareArrays(
        ensureArray(version1.conteudo.presentes), 
        ensureArray(version2.conteudo.presentes)
      ),
      deliberacoes: compareArrays(
        ensureArray(version1.conteudo.deliberacoes), 
        ensureArray(version2.conteudo.deliberacoes)
      ),
      observacoes: version1.conteudo.observacoes !== version2.conteudo.observacoes,
    };

    return changes;
  };

  const compareArrays = (arr1: unknown[], arr2: unknown[]) => {
    if (arr1.length !== arr2.length) return true;
    return JSON.stringify(arr1) !== JSON.stringify(arr2);
  };

  const _formatJsonContent = (content: any): string => {
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
                                    {ensureArray(version.conteudo.pauta).map((item: PautaItem, index: number) => (
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
                                    {ensureArray(version.conteudo.presentes).map((presente: { nome: string; cargo: string }, index: number) => (
                                      <div key={index} className="flex justify-between items-center py-2 border-b">
                                        <div>
                                          <h4 className="font-medium">{presente.nome}</h4>
                                          <p className="text-sm text-muted-foreground">{presente.cargo}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </TabsContent>
                              
                              <TabsContent value="deliberacoes">
                                <ScrollArea className="h-[400px]">
                                  <div className="space-y-2">
                                    {ensureArray(version.conteudo.deliberacoes).map((deliberacao: DeliberacaoItem, index: number) => (
                                      <Card key={index}>
                                        <CardContent className="pt-4">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Badge variant={deliberacao.status === 'aprovado' ? 'default' : (deliberacao.status === 'reprovado' ? 'destructive' : 'secondary')}>
                                              {deliberacao.status}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                              {deliberacao.numero}
                                            </span>
                                          </div>
                                          <h4 className="font-medium">{deliberacao.titulo}</h4>
                                          <p className="text-sm text-muted-foreground mt-1">
                                            {deliberacao.descricao}
                                          </p>
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
                                      {ensureString(version.conteudo.observacoes) || 'Nenhuma observação registrada'}
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