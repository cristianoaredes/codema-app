import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

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
            Portal Municipal - Itanhomi
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-medium text-foreground">
              {profile?.full_name || user.email}
            </span>
            <span className="text-xs text-muted-foreground">
              {(() => {
                if (profile?.role === 'admin') return 'Administrador';
                if (profile?.role === 'secretario') return 'Secretário';
                if (profile?.role === 'presidente') return 'Presidente';
                if (profile?.role === 'conselheiro_titular') return 'Conselheiro Titular';
                if (profile?.role === 'conselheiro_suplente') return 'Conselheiro Suplente';
                if (profile?.role === 'moderator') return 'Moderador';
                return 'Cidadão';
              })()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Public header - simplified for landing page
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
              <img src={logo} alt="CODEMA Logo" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">CODEMA</h1>
              <p className="text-xs text-muted-foreground">Itanhomi - MG</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button asChild>
              <Link to="/auth">Acessar Sistema</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;