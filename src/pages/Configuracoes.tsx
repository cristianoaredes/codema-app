import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, User, Bell, Shield, Database, Palette } from "lucide-react";
import { ProfileEditDialog } from "@/components/configuracoes/ProfileEditDialog";
import { NotificationSettings } from "@/components/configuracoes/NotificationSettings";
import { PasswordChangeDialog } from "@/components/configuracoes/PasswordChangeDialog";
import { ThemeToggle } from "@/components/configuracoes/ThemeToggle";
import { SystemDataManager } from "@/components/configuracoes/SystemDataManager";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";

export default function Configuracoes() {
  const { user, profile, hasAdminAccess } = useAuth();
  const { effectiveTheme } = useTheme();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e configurações do sistema
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Perfil do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil do Usuário
            </CardTitle>
            <CardDescription>
              Gerencie suas informações pessoais e dados de contato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                <p><strong>Nome:</strong> {profile?.full_name || user?.user_metadata?.full_name || 'Não informado'}</p>
                <p><strong>Email:</strong> {user?.email || 'Não informado'}</p>
                <p><strong>Telefone:</strong> {profile?.phone || 'Não informado'}</p>
              </div>
              <ProfileEditDialog>
                <Button variant="outline" className="w-full">
                  Editar Perfil
                </Button>
              </ProfileEditDialog>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure como deseja receber notificações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationSettings>
              <Button variant="outline" className="w-full">
                Configurar Alertas
              </Button>
            </NotificationSettings>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>
              Altere sua senha e gerencie configurações de segurança
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordChangeDialog>
              <Button variant="outline" className="w-full">
                Alterar Senha
              </Button>
            </PasswordChangeDialog>
          </CardContent>
        </Card>

        {/* Preferências do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Aparência
            </CardTitle>
            <CardDescription>
              Customize a aparência da interface do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ThemeToggle variant="inline" />
            </div>
          </CardContent>
        </Card>

        {/* Dados do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Dados do Sistema
            </CardTitle>
            <CardDescription>
              Informações sobre armazenamento e backup de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge variant="default" className="bg-green-600">Sincronizado</Badge>
              </div>
              <SystemDataManager>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  disabled={!hasAdminAccess}
                >
                  {hasAdminAccess ? 'Gerenciar Dados' : 'Acesso Restrito'}
                </Button>
              </SystemDataManager>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sobre o Sistema</CardTitle>
          <CardDescription>
            Informações técnicas do CODEMA - Sistema de Gestão Municipal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Versão</p>
              <p className="font-medium">1.0.0</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ambiente</p>
              <p className="font-medium">Desenvolvimento</p>
            </div>
            <div>
              <p className="text-muted-foreground">Município</p>
              <p className="font-medium">Itanhomi-MG</p>
            </div>
            <div>
              <p className="text-muted-foreground">Última Atualização</p>
              <p className="font-medium">Janeiro 2025</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}