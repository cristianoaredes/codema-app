import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Book, 
  Users, 
  Shield, 
  User, 
  Crown, 
  UserCheck, 
  Calendar,
  FileText,
  Gavel,
  DollarSign,
  BarChart3,
  MessageSquare,
  Plus,
  Eye,
  Settings,
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";

export default function Documentation() {
  const rolePermissions = [
    {
      role: "citizen",
      label: "Cidadão",
      icon: User,
      color: "bg-blue-100 text-blue-800",
      description: "Usuário comum com acesso básico ao sistema",
      permissions: [
        { feature: "Visualizar relatórios públicos", allowed: true },
        { feature: "Criar relatórios", allowed: true },
        { feature: "Acessar ouvidoria", allowed: true },
        { feature: "Ver próprios relatórios", allowed: true },
        { feature: "Participar de reuniões", allowed: false },
        { feature: "Votar em resoluções", allowed: false },
        { feature: "Gerenciar usuários", allowed: false },
        { feature: "Administrar sistema", allowed: false }
      ]
    },
    {
      role: "conselheiro_titular",
      label: "Conselheiro Titular",
      icon: UserCheck,
      color: "bg-green-100 text-green-800",
      description: "Membro ativo do CODEMA com direito a voto",
      permissions: [
        { feature: "Visualizar relatórios públicos", allowed: true },
        { feature: "Criar relatórios", allowed: true },
        { feature: "Acessar ouvidoria", allowed: true },
        { feature: "Ver próprios relatórios", allowed: true },
        { feature: "Participar de reuniões", allowed: true },
        { feature: "Votar em resoluções", allowed: true },
        { feature: "Criar resoluções", allowed: true },
        { feature: "Visualizar atas", allowed: true },
        { feature: "Gerenciar usuários", allowed: false },
        { feature: "Administrar sistema", allowed: false }
      ]
    },
    {
      role: "conselheiro_suplente",
      label: "Conselheiro Suplente",
      icon: Users,
      color: "bg-yellow-100 text-yellow-800",
      description: "Membro suplente do CODEMA",
      permissions: [
        { feature: "Visualizar relatórios públicos", allowed: true },
        { feature: "Criar relatórios", allowed: true },
        { feature: "Acessar ouvidoria", allowed: true },
        { feature: "Ver próprios relatórios", allowed: true },
        { feature: "Participar de reuniões", allowed: true },
        { feature: "Votar em resoluções", allowed: true },
        { feature: "Criar resoluções", allowed: true },
        { feature: "Visualizar atas", allowed: true },
        { feature: "Gerenciar usuários", allowed: false },
        { feature: "Administrar sistema", allowed: false }
      ]
    },
    {
      role: "secretario",
      label: "Secretário Executivo",
      icon: FileText,
      color: "bg-purple-100 text-purple-800",
      description: "Secretário executivo do CODEMA",
      permissions: [
        { feature: "Visualizar relatórios públicos", allowed: true },
        { feature: "Criar relatórios", allowed: true },
        { feature: "Acessar ouvidoria", allowed: true },
        { feature: "Ver próprios relatórios", allowed: true },
        { feature: "Participar de reuniões", allowed: true },
        { feature: "Votar em resoluções", allowed: true },
        { feature: "Criar resoluções", allowed: true },
        { feature: "Visualizar atas", allowed: true },
        { feature: "Agendar reuniões", allowed: true },
        { feature: "Criar atas", allowed: true },
        { feature: "Gerenciar conselheiros", allowed: true },
        { feature: "Gerenciar usuários", allowed: false },
        { feature: "Administrar sistema", allowed: false }
      ]
    },
    {
      role: "presidente",
      label: "Presidente",
      icon: Crown,
      color: "bg-indigo-100 text-indigo-800",
      description: "Presidente do CODEMA",
      permissions: [
        { feature: "Visualizar relatórios públicos", allowed: true },
        { feature: "Criar relatórios", allowed: true },
        { feature: "Acessar ouvidoria", allowed: true },
        { feature: "Ver próprios relatórios", allowed: true },
        { feature: "Participar de reuniões", allowed: true },
        { feature: "Votar em resoluções", allowed: true },
        { feature: "Criar resoluções", allowed: true },
        { feature: "Visualizar atas", allowed: true },
        { feature: "Agendar reuniões", allowed: true },
        { feature: "Gerenciar conselheiros", allowed: true },
        { feature: "Gerenciar FMA", allowed: true },
        { feature: "Gerenciar usuários", allowed: false },
        { feature: "Administrar sistema", allowed: false }
      ]
    },
    {
      role: "admin",
      label: "Administrador",
      icon: Shield,
      color: "bg-red-100 text-red-800",
      description: "Administrador do sistema com acesso completo",
      permissions: [
        { feature: "Visualizar relatórios públicos", allowed: true },
        { feature: "Criar relatórios", allowed: true },
        { feature: "Acessar ouvidoria", allowed: true },
        { feature: "Ver próprios relatórios", allowed: true },
        { feature: "Participar de reuniões", allowed: true },
        { feature: "Votar em resoluções", allowed: true },
        { feature: "Criar resoluções", allowed: true },
        { feature: "Visualizar atas", allowed: true },
        { feature: "Agendar reuniões", allowed: true },
        { feature: "Criar atas", allowed: true },
        { feature: "Gerenciar conselheiros", allowed: true },
        { feature: "Gerenciar FMA", allowed: true },
        { feature: "Gerenciar usuários", allowed: true },
        { feature: "Administrar sistema", allowed: true },
        { feature: "Auditoria", allowed: true },
        { feature: "Configurações", allowed: true }
      ]
    }
  ];

  const systemFeatures = [
    {
      category: "Relatórios",
      icon: FileText,
      features: [
        { name: "Criar relatórios", description: "Reportar problemas ambientais" },
        { name: "Visualizar relatórios", description: "Acompanhar status e resoluções" },
        { name: "Categorizar por tipo", description: "Organizar por tipo de problema" },
        { name: "Geolocalização", description: "Marcar localização no mapa" }
      ]
    },
    {
      category: "CODEMA",
      icon: Calendar,
      features: [
        { name: "Reuniões", description: "Agendar e gerenciar reuniões" },
        { name: "Atas", description: "Criar e aprovar atas" },
        { name: "Resoluções", description: "Criar e votar resoluções" },
        { name: "Conselheiros", description: "Gerenciar membros do conselho" }
      ]
    },
    {
      category: "FMA",
      icon: DollarSign,
      features: [
        { name: "Saldo", description: "Acompanhar saldo do fundo" },
        { name: "Movimentações", description: "Registrar entradas e saídas" },
        { name: "Relatórios", description: "Gerar relatórios financeiros" },
        { name: "Projetos", description: "Vincular gastos a projetos" }
      ]
    },
    {
      category: "Administração",
      icon: Settings,
      features: [
        { name: "Usuários", description: "Gerenciar usuários do sistema" },
        { name: "Auditoria", description: "Logs de atividades" },
        { name: "Configurações", description: "Configurar sistema" },
        { name: "Backup", description: "Backup e restauração" }
      ]
    }
  ];

  const quickStart = [
    {
      role: "citizen",
      steps: [
        "Faça login ou registre-se no sistema",
        "Clique em 'Novo Relatório' no dashboard",
        "Preencha os detalhes do problema",
        "Adicione fotos e localização",
        "Envie o relatório e acompanhe o status"
      ]
    },
    {
      role: "conselheiro_titular",
      steps: [
        "Acesse o dashboard do CODEMA",
        "Visualize reuniões agendadas",
        "Participe de votações de resoluções",
        "Acompanhe atas pendentes",
        "Crie novas resoluções quando necessário"
      ]
    },
    {
      role: "admin",
      steps: [
        "Acesse o painel administrativo",
        "Gerencie usuários e permissões",
        "Configure categorias de serviços",
        "Monitore logs de auditoria",
        "Faça backup regular dos dados"
      ]
    }
  ];

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Documentação do Sistema CODEMA
        </h1>
        <p className="text-muted-foreground">
          Guia completo de funcionalidades, permissões e instruções de uso
        </p>
      </div>

      <div className="grid gap-6">
        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Visão Geral do Sistema
            </CardTitle>
            <CardDescription>
              O Sistema CODEMA é uma plataforma web para gestão ambiental municipal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {systemFeatures.map((category, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <category.icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{category.category}</h3>
                  </div>
                  <ul className="space-y-2">
                    {category.features.map((feature, idx) => (
                      <li key={idx} className="text-sm">
                        <span className="font-medium">{feature.name}:</span>
                        <span className="text-muted-foreground ml-1">{feature.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Role Permissions Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Matriz de Permissões
            </CardTitle>
            <CardDescription>
              Funcionalidades disponíveis para cada tipo de usuário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {rolePermissions.map((roleData, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <roleData.icon className="h-6 w-6" />
                    <div>
                      <h3 className="font-semibold">{roleData.label}</h3>
                      <p className="text-sm text-muted-foreground">{roleData.description}</p>
                    </div>
                    <Badge className={roleData.color}>
                      {roleData.role}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {roleData.permissions.map((permission, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        {permission.allowed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className={permission.allowed ? "" : "text-muted-foreground"}>
                          {permission.feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Start Guides */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Guias de Início Rápido
            </CardTitle>
            <CardDescription>
              Primeiros passos para cada tipo de usuário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickStart.map((guide, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">
                      {rolePermissions.find(r => r.role === guide.role)?.label}
                    </Badge>
                  </div>
                  <ol className="space-y-2">
                    {guide.steps.map((step, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Support Information */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <MessageSquare className="h-5 w-5" />
              Suporte e Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Suporte Técnico</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Através da plataforma, na seção "Suporte".</li>
                    <li>
                      Email:{" "}
                      <a
                        href="mailto:suporte@municonnect.com.br"
                        className="text-blue-600 hover:underline"
                      >
                        suporte@municonnect.com.br
                      </a>
                    </li>
                    <li>Telefone: (31) 99999-9999 (fictício)</li>
                  </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Ouvidoria</h4>
                <ul className="space-y-1 text-sm">
                  <li>Email: ouvidoria@itanhomi.sp.gov.br</li>
                  <li>Telefone: (11) 9876-5432</li>
                  <li>Presencial: Prefeitura Municipal</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}