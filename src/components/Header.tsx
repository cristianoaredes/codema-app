import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Header = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Desconectado com sucesso",
        description: "Você foi desconectado da sua conta.",
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro",
        description: "Não foi possível desconectar. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Only show header content when sidebar is not present (public pages)
  if (user) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="font-bold text-xl text-foreground">
            Portal Municipal - Itanhemi
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-medium text-foreground">
              {profile?.full_name || user.email}
            </span>
            <span className="text-xs text-muted-foreground">
              {profile?.role === 'admin' ? 'Administrador' : 
               profile?.role === 'moderator' ? 'Moderador' : 'Cidadão'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="font-bold text-xl text-foreground">
              Portal Municipal - Itanhemi
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="text-foreground hover:text-primary transition-colors">
                Início
              </Link>
              <Link to="/relatorios" className="text-foreground hover:text-primary transition-colors">
                Relatórios
              </Link>
            </nav>
            
            <div className="flex items-center space-x-2">
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm">
                  Cadastrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;