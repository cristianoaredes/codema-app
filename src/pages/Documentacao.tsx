import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  FileText, 
  Code, 
  Database, 
  Shield, 
  Settings, 
  Search,
  Download,
  ExternalLink,
  Users,
  Calendar,
  Gavel
} from "lucide-react";

export default function Documentacao() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Documentação</h1>
          <p className="text-muted-foreground">
            Documentação técnica e guias do sistema CODEMA
          </p>
        </div>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar na documentação..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar de Navegação */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Navegação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-primary">Primeiros Passos</h4>
              <ul className="ml-4 space-y-1 text-sm">
                <li><a href="#intro" className="text-muted-foreground hover:text-foreground">Introdução</a></li>
                <li><a href="#setup" className="text-muted-foreground hover:text-foreground">Configuração Inicial</a></li>
                <li><a href="#login" className="text-muted-foreground hover:text-foreground">Primeiro Acesso</a></li>
              </ul>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-primary">Módulos</h4>
              <ul className="ml-4 space-y-1 text-sm">
                <li><a href="#conselheiros" className="text-muted-foreground hover:text-foreground">Conselheiros</a></li>
                <li><a href="#reunioes" className="text-muted-foreground hover:text-foreground">Reuniões</a></li>
                <li><a href="#atas" className="text-muted-foreground hover:text-foreground">Atas</a></li>
                <li><a href="#protocolos" className="text-muted-foreground hover:text-foreground">Protocolos</a></li>
              </ul>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-primary">Técnico</h4>
              <ul className="ml-4 space-y-1 text-sm">
                <li><a href="#api" className="text-muted-foreground hover:text-foreground">API</a></li>
                <li><a href="#database" className="text-muted-foreground hover:text-foreground">Banco de Dados</a></li>
                <li><a href="#security" className="text-muted-foreground hover:text-foreground">Segurança</a></li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo Principal */}
        <div className="lg:col-span-3 space-y-6">
          {/* Seções de Documentação */}
          <Card id="intro">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Introdução ao Sistema CODEMA
              </CardTitle>
              <CardDescription>
                Visão geral do sistema de gestão municipal de meio ambiente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                O CODEMA é um sistema completo para digitalização e gestão das atividades do 
                Conselho Municipal de Defesa do Meio Ambiente de Itanhomi-MG.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-accent rounded-lg">
                  <h4 className="font-medium mb-2">Principais Funcionalidades</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Gestão de conselheiros e mandatos</li>
                    <li>• Agendamento automático de reuniões</li>
                    <li>• Geração digital de atas</li>
                    <li>• Controle de protocolos</li>
                  </ul>
                </div>
                <div className="p-4 bg-accent rounded-lg">
                  <h4 className="font-medium mb-2">Tecnologias</h4>
                  <ul className="text-sm space-y-1">
                    <li>• React 18 + TypeScript</li>
                    <li>• Supabase (Backend)</li>
                    <li>• Tailwind CSS + shadcn/ui</li>
                    <li>• React Query</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentação dos Módulos */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card id="conselheiros">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Módulo Conselheiros
                </CardTitle>
                <CardDescription>
                  Gestão completa dos membros do conselho
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cadastro de Conselheiros</span>
                    <Badge variant="secondary">CRUD</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Controle de Mandatos</span>
                    <Badge variant="secondary">Automático</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Alertas de Ausências</span>
                    <Badge variant="secondary">Notificações</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Ver Documentação Completa
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card id="reunioes">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Módulo Reuniões
                </CardTitle>
                <CardDescription>
                  Agendamento e controle de reuniões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Agendamento Inteligente</span>
                    <Badge variant="secondary">Automático</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Controle de Presença</span>
                    <Badge variant="secondary">Digital</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Convocações por Email</span>
                    <Badge variant="secondary">Automático</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Ver Documentação Completa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documentação Técnica */}
          <Card id="api">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Documentação Técnica
              </CardTitle>
              <CardDescription>
                Informações para desenvolvedores e administradores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <Database className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-medium mb-2">Schema do Banco</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Estrutura das tabelas e relacionamentos
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Code className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-medium mb-2">API Reference</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Endpoints e exemplos de uso
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Ver Online
                  </Button>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-medium mb-2">Segurança</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    RLS policies e autenticação
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    <FileText className="h-3 w-3 mr-1" />
                    Guia
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Downloads e Recursos */}
          <Card>
            <CardHeader>
              <CardTitle>Recursos e Downloads</CardTitle>
              <CardDescription>
                Materiais complementares e ferramentas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded hover:bg-accent">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Manual do Usuário (PDF)</p>
                      <p className="text-xs text-muted-foreground">Guia completo para usuários finais</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">Em Breve</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded hover:bg-accent">
                  <div className="flex items-center gap-3">
                    <Code className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Guia de Desenvolvimento</p>
                      <p className="text-xs text-muted-foreground">Para desenvolvedores e contribuidores</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">Em Breve</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded hover:bg-accent">
                  <div className="flex items-center gap-3">
                    <Settings className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Manual de Instalação</p>
                      <p className="text-xs text-muted-foreground">Configuração e deploy do sistema</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">Em Breve</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}