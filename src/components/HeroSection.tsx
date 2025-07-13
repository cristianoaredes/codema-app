import { Button } from "@/components/ui/button";
import { FileText, Star, AlertTriangle, ArrowDown } from "lucide-react";
import heroImage from "@/assets/municipal-hero.jpg";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { useScreenReaderSupport } from "@/components/accessibility/AccessibilityProvider";

const HeroSection = () => {
  const { user } = useAuth();
  const { announceNavigation } = useScreenReaderSupport();
  
  const scrollToReportForm = () => {
    const reportForm = document.getElementById('report-form');
    if (reportForm) {
      announceNavigation('formulário de relatório');
      reportForm.scrollIntoView({ behavior: 'smooth' });
      // Focus on the first field after scroll
      setTimeout(() => {
        const firstField = reportForm.querySelector('button, input, select, textarea') as HTMLElement;
        firstField?.focus();
      }, 500);
    }
  };

  return (
    <section
      className="relative bg-gradient-to-br from-background to-muted py-20"
      aria-labelledby="hero-title"
      role="banner"
    >
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <img
          src={heroImage}
          alt=""
          className="w-full h-full object-cover"
          role="presentation"
        />
      </div>
      
      <div className="relative container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            id="hero-title"
            className="text-5xl font-bold text-foreground mb-6"
          >
            Construindo uma
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Itanhomi Melhor</span>
          </h1>
          
          <p
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            role="doc-subtitle"
          >
            Relate problemas nos serviços municipais e avalie a qualidade dos serviços públicos em Itanhomi-MG.
            Sua participação é fundamental para construir uma cidade melhor.
          </p>
          
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            role="group"
            aria-label="Ações principais do sistema"
          >
            {user ? (
              <Button
                variant="hero"
                size="lg"
                className="text-lg px-8 py-4"
                onClick={scrollToReportForm}
                aria-describedby="report-button-description"
              >
                <FileText className="w-5 h-5 mr-2" aria-hidden="true" />
                Fazer um Relatório
              </Button>
            ) : (
              <Button
                variant="hero"
                size="lg"
                className="text-lg px-8 py-4"
                asChild
              >
                <Link
                  to="/auth"
                  aria-describedby="auth-button-description"
                >
                  <FileText className="w-5 h-5 mr-2" aria-hidden="true" />
                  Começar Agora
                </Link>
              </Button>
            )}
            
            <Button
              variant="municipal"
              size="lg"
              className="text-lg px-8 py-4"
              aria-describedby="rating-button-description"
              disabled
              aria-label="Avaliar Serviços (em breve)"
            >
              <Star className="w-5 h-5 mr-2" aria-hidden="true" />
              Avaliar Serviços
            </Button>
          </div>
          
          {/* Screen reader descriptions for buttons */}
          <div className="sr-only">
            <div id="report-button-description">
              Ir para o formulário de relatório de problemas municipais
            </div>
            <div id="auth-button-description">
              Ir para a página de login ou cadastro
            </div>
            <div id="rating-button-description">
              Funcionalidade de avaliação de serviços (disponível em breve)
            </div>
          </div>
          
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
            role="region"
            aria-labelledby="features-heading"
          >
            <h2 id="features-heading" className="sr-only">Recursos do Sistema</h2>
            
            <article className="text-center">
              <div
                className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
                role="img"
                aria-label="Ícone de relatório rápido"
              >
                <AlertTriangle className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Relatório Rápido</h3>
              <p className="text-muted-foreground">Reporte problemas com fotos e detalhes de localização em segundos</p>
            </article>
            
            <article className="text-center">
              <div
                className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4"
                role="img"
                aria-label="Ícone de avaliação de serviços"
              >
                <Star className="w-6 h-6 text-secondary" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Avaliação de Serviços</h3>
              <p className="text-muted-foreground">Avalie os serviços municipais para ajudar a melhorar a qualidade</p>
            </article>
            
            <article className="text-center">
              <div
                className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4"
                role="img"
                aria-label="Ícone de acompanhamento de progresso"
              >
                <FileText className="w-6 h-6 text-accent" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Acompanhar Progresso</h3>
              <p className="text-muted-foreground">Acompanhe seus relatórios e veja o status de resolução</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;