import { Button } from "@/components/ui/button";
import { FileText, Star, AlertTriangle, ArrowDown } from "lucide-react";
import heroImage from "@/assets/municipal-hero.jpg";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const { user } = useAuth();
  
  const scrollToReportForm = () => {
    const reportForm = document.getElementById('report-form');
    if (reportForm) {
      reportForm.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-background to-muted py-20">
      <div className="absolute inset-0 opacity-10">
        <img 
          src={heroImage} 
          alt="Serviços municipais de Itanhemi" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Construindo uma
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Itanhemi Melhor</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Relate problemas nos serviços municipais e avalie a qualidade dos serviços públicos em Itanhemi-MG. 
            Sua participação é fundamental para construir uma cidade melhor.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {user ? (
              <Button variant="hero" size="lg" className="text-lg px-8 py-4" onClick={scrollToReportForm}>
                <FileText className="w-5 h-5 mr-2" />
                Fazer um Relatório
              </Button>
            ) : (
              <Button variant="hero" size="lg" className="text-lg px-8 py-4" asChild>
                <Link to="/auth">
                  <FileText className="w-5 h-5 mr-2" />
                  Começar Agora
                </Link>
              </Button>
            )}
            
            <Button variant="municipal" size="lg" className="text-lg px-8 py-4">
              <Star className="w-5 h-5 mr-2" />
              Avaliar Serviços
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Relatório Rápido</h3>
              <p className="text-muted-foreground">Reporte problemas com fotos e detalhes de localização em segundos</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Avaliação de Serviços</h3>
              <p className="text-muted-foreground">Avalie os serviços municipais para ajudar a melhorar a qualidade</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Acompanhar Progresso</h3>
              <p className="text-muted-foreground">Acompanhe seus relatórios e veja o status de resolução</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;