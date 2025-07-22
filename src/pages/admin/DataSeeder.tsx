import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SampleDataSeeder } from "@/utils/data";
import { TestAccountManager } from "@/utils/generators";
import { LoadingSpinner } from "@/components/ui/loading";
import { useDemoMode } from "@/components/demo/DemoModeProvider";
import { 
  Database, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle,
  AlertTriangle,
  Info,
  Users,
  Key,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";

export default function DataSeeder() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isCreatingAccounts, setIsCreatingAccounts] = useState(false);
  const { toast } = useToast();
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await SampleDataSeeder.seedAllData();
      toast({
        title: "Dados Populados com Sucesso!",
        description: "O sistema agora contém dados de exemplo para teste.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erro ao Popular Dados",
        description: "Ocorreu um erro ao inserir os dados de exemplo.",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await SampleDataSeeder.clearAllData();
      toast({
        title: "Dados Removidos",
        description: "Todos os dados de exemplo foram removidos do sistema.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erro ao Limpar Dados",
        description: "Ocorreu um erro ao remover os dados de exemplo.",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleCreateTestAccounts = async () => {
    setIsCreatingAccounts(true);
    try {
      await TestAccountManager.createTestAccounts();
      toast({
        title: "Contas de Teste Criadas!",
        description: "Contas de teste para diferentes roles foram criadas com sucesso.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erro ao Criar Contas",
        description: "Ocorreu um erro ao criar as contas de teste.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingAccounts(false);
    }
  };

  const testAccounts = TestAccountManager.getTestAccountsInfo();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Informação copiada para a área de transferência.",
      variant: "default"
    });
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Gerenciamento de Dados de Exemplo
        </h1>
        <p className="text-muted-foreground">
          Popule o sistema com dados de teste para demonstração e desenvolvimento
        </p>
      </div>

      <div className="grid gap-6">
        {/* Warning Card */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Atenção
            </CardTitle>
            <CardDescription className="text-orange-700">
              Esta funcionalidade é destinada apenas para desenvolvimento e testes. 
              Não use em ambiente de produção.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Data Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Dados que Serão Criados
            </CardTitle>
            <CardDescription>
              Visão geral dos dados de exemplo que serão inseridos no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Relatórios</h3>
                  <Badge variant="outline">8 itens</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Relatórios de cidadãos com diferentes status e prioridades
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Reuniões</h3>
                  <Badge variant="outline">3 itens</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reuniões ordinárias e extraordinárias do CODEMA
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Atas</h3>
                  <Badge variant="outline">1 item</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Atas de reuniões em diferentes estágios
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Resoluções</h3>
                  <Badge variant="outline">2 itens</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Resoluções em votação e aprovadas
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Conselheiros</h3>
                  <Badge variant="outline">5 itens</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Membros do conselho de diferentes segmentos
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Categorias</h3>
                  <Badge variant="outline">7 itens</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Categorias de serviços municipais
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contas de Teste
            </CardTitle>
            <CardDescription>
              Contas de teste para diferentes roles do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Button 
                onClick={handleCreateTestAccounts}
                disabled={isCreatingAccounts}
                className="flex items-center gap-2"
                size="lg"
              >
                {isCreatingAccounts ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                {isCreatingAccounts ? 'Criando...' : 'Criar Contas de Teste'}
              </Button>
            </div>

            <div className="grid gap-4">
              {testAccounts.map((account, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{account.email}</span>
                      <Badge variant="outline" className="capitalize">
                        {account.role.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`${account.email}:${account.password}`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {account.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      <strong>Senha:</strong> {account.password}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Ações Disponíveis
            </CardTitle>
            <CardDescription>
              Gerencie os dados de exemplo do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleSeedData}
                disabled={isSeeding || isClearing}
                className="flex items-center gap-2"
                size="lg"
              >
                {isSeeding ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {isSeeding ? 'Populando...' : 'Popular Dados de Exemplo'}
              </Button>

              <Button 
                onClick={handleClearData}
                disabled={isSeeding || isClearing}
                variant="destructive"
                className="flex items-center gap-2"
                size="lg"
              >
                {isClearing ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {isClearing ? 'Removendo...' : 'Remover Dados de Exemplo'}
              </Button>

              <Button 
                onClick={toggleDemoMode}
                variant={isDemoMode ? "default" : "outline"}
                className="flex items-center gap-2"
                size="lg"
              >
                {isDemoMode ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                {isDemoMode ? 'Desativar Demo' : 'Ativar Modo Demo'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Info className="h-5 w-5" />
              Informações Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                Os dados serão associados ao usuário logado (cristiano@aredes.me)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                Após popular os dados, o dashboard mostrará métricas reais
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                Todos os módulos CODEMA terão dados para teste
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                É seguro executar múltiplas vezes (duplicatas serão evitadas)
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}