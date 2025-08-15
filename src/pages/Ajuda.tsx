import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  HelpCircle, 
  Book, 
  MessageSquare, 
  Mail, 
  Phone, 
  FileText, 
  Users, 
  Calendar, 
  Search,
  ExternalLink
} from "lucide-react";

export default function Ajuda() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <HelpCircle className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Central de Ajuda</h1>
          <p className="text-muted-foreground">
            Encontre respostas para suas dúvidas sobre o sistema CODEMA
          </p>
        </div>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Busque por tutoriais, dúvidas frequentes..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dúvidas Frequentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Dúvidas Frequentes
          </CardTitle>
          <CardDescription>
            Respostas para as perguntas mais comuns dos usuários
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer">
              <h4 className="font-medium mb-2">Como cadastrar um novo conselheiro?</h4>
              <p className="text-sm text-muted-foreground">
                Acesse Administração {'>'} Conselheiros e clique em "Novo Conselheiro"
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer">
              <h4 className="font-medium mb-2">Como agendar uma reunião?</h4>
              <p className="text-sm text-muted-foreground">
                No menu CODEMA {'>'} Reuniões, clique em "Nova Reunião"
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer">
              <h4 className="font-medium mb-2">Como gerar uma ata de reunião?</h4>
              <p className="text-sm text-muted-foreground">
                Após a reunião, acesse CODEMA {'>'} Atas para gerar automaticamente
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer">
              <h4 className="font-medium mb-2">Como alterar minha senha?</h4>
              <p className="text-sm text-muted-foreground">
                Vá em Configurações {'>'} Segurança {'>'} Alterar Senha
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tutoriais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Tutoriais
            </CardTitle>
            <CardDescription>
              Guias passo a passo para usar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded hover:bg-accent">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm">Gerenciamento de Conselheiros</span>
              </div>
              <Badge variant="secondary">5 min</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded hover:bg-accent">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm">Agendamento de Reuniões</span>
              </div>
              <Badge variant="secondary">3 min</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded hover:bg-accent">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm">Geração de Documentos</span>
              </div>
              <Badge variant="secondary">4 min</Badge>
            </div>
            <Button variant="outline" className="w-full">
              Ver Todos os Tutoriais
            </Button>
          </CardContent>
        </Card>

        {/* Contato e Suporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Contato e Suporte
            </CardTitle>
            <CardDescription>
              Entre em contato para suporte técnico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded">
                <Mail className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-muted-foreground">suporte@codema-itanhomi.mg.gov.br</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded">
                <Phone className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Telefone</p>
                  <p className="text-xs text-muted-foreground">(33) 3333-3333</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Button className="w-full">
                Abrir Chamado de Suporte
              </Button>
              <Button variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Portal da Prefeitura
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recursos Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos Adicionais</CardTitle>
          <CardDescription>
            Links úteis e informações complementares
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <Book className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-medium mb-1">Manual do Usuário</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Documentação completa do sistema
              </p>
              <Button variant="outline" size="sm" disabled>
                Em Breve
              </Button>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-medium mb-1">Fórum da Comunidade</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Discussões com outros usuários
              </p>
              <Button variant="outline" size="sm" disabled>
                Em Breve
              </Button>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-medium mb-1">Base de Conhecimento</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Artigos técnicos e dicas
              </p>
              <Button variant="outline" size="sm" disabled>
                Em Breve
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}