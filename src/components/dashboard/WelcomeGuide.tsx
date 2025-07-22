import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GuidedTour, useGuidedTour, TourStep } from "@/components/ui/guided-tour";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  Play, 
  Plus, 
  MessageSquare, 
  BarChart3,
  Search,
  X,
  Lightbulb,
  MapPin,
  Users,
  Calendar
} from "lucide-react";

interface WelcomeGuideProps {
  onDismiss: () => void;
}

export function WelcomeGuide({ onDismiss }: WelcomeGuideProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isCitizen = profile?.role === 'citizen';

  const citizenTourSteps: TourStep[] = [
    {
      id: "welcome",
      title: "Bem-vindo ao Portal CODEMA!",
      description: "Vamos te mostrar como usar o sistema para participar ativamente das questões ambientais de Itanhomi.",
      position: "bottom"
    },
    {
      id: "dashboard-cards",
      title: "Suas Métricas",
      description: "Aqui você vê o resumo dos seus relatórios e das atividades da comunidade.",
      target: "[data-tour='dashboard-cards']",
      position: "bottom"
    },
    {
      id: "new-report",
      title: "Criar Relatório",
      description: "Use este botão para reportar problemas ambientais ou sugerir melhorias para sua cidade.",
      target: "[data-tour='new-report-btn']",
      position: "left",
      action: {
        label: "Criar Meu Primeiro Relatório",
        onClick: () => navigate('/criar-relatorio')
      }
    },
    {
      id: "quick-actions",
      title: "Ações Rápidas",
      description: "Acesse rapidamente as funcionalidades mais utilizadas do sistema.",
      target: "[data-tour='quick-actions']",
      position: "top"
    },
    {
      id: "ombudsman",
      title: "Ouvidoria",
      description: "Para denúncias e reclamações mais sérias, use a ouvidoria municipal.",
      target: "[data-tour='ombudsman']",
      position: "top"
    },
    {
      id: "command-palette",
      title: "Comando Rápido",
      description: "Pressione Ctrl+K (ou Cmd+K no Mac) a qualquer momento para acessar o menu de comandos rápidos.",
      position: "bottom"
    },
    {
      id: "sidebar",
      title: "Menu de Navegação",
      description: "Use o menu lateral para navegar entre as diferentes seções do sistema.",
      target: "[data-tour='sidebar']",
      position: "right"
    },
    {
      id: "profile",
      title: "Seu Perfil",
      description: "Acesse suas informações pessoais e configurações através do menu de perfil.",
      target: "[data-tour='profile']",
      position: "left"
    }
  ];

  const codemaTourSteps: TourStep[] = [
    {
      id: "welcome",
      title: "Bem-vindo ao Dashboard CODEMA!",
      description: "Como membro do conselho, você tem acesso a funcionalidades avançadas para gestão ambiental.",
      position: "bottom"
    },
    {
      id: "dashboard-metrics",
      title: "Métricas do Conselho",
      description: "Acompanhe reuniões, atas pendentes, resoluções e outras atividades do CODEMA.",
      target: "[data-tour='dashboard-cards']",
      position: "bottom"
    },
    {
      id: "meetings",
      title: "Reuniões",
      description: "Gerencie reuniões do conselho, agende novas sessões e acompanhe a agenda.",
      target: "[data-tour='meetings-btn']",
      position: "left"
    },
    {
      id: "minutes",
      title: "Atas",
      description: "Acesse e gerencie as atas das reuniões do CODEMA.",
      target: "[data-tour='minutes-btn']",
      position: "left"
    },
    {
      id: "resolutions",
      title: "Resoluções",
      description: "Crie, vote e gerencie resoluções do conselho municipal.",
      target: "[data-tour='resolutions']",
      position: "top"
    },
    {
      id: "fma",
      title: "Fundo Municipal do Meio Ambiente",
      description: "Acompanhe o saldo e movimentações do FMA.",
      target: "[data-tour='fma']",
      position: "top"
    }
  ];

  const tourSteps = isCitizen ? citizenTourSteps : codemaTourSteps;
  const tour = useGuidedTour(tourSteps);

  const handleStartTour = () => {
    tour.startTour();
    onDismiss();
  };

  const tips = isCitizen ? [
    {
      icon: <Plus className="h-5 w-5" />,
      title: "Reporte Problemas",
      description: "Viu algo que precisa ser resolvido? Crie um relatório com fotos e localização."
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Seja Específico",
      description: "Quanto mais detalhes você fornecer, mais fácil será resolver o problema."
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Acompanhe o Progresso",
      description: "Veja o status dos seus relatórios e das atividades da comunidade."
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "Use a Ouvidoria",
      description: "Para questões mais sérias, use o canal oficial da ouvidoria."
    }
  ] : [
    {
      icon: <Calendar className="h-5 w-5" />,
      title: "Gerencie Reuniões",
      description: "Agende reuniões, convoque membros e gerencie a agenda do conselho."
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Colabore com o Conselho",
      description: "Trabalhe junto com outros conselheiros nas decisões ambientais."
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Monitore Métricas",
      description: "Acompanhe indicadores ambientais e o desempenho das ações."
    },
    {
      icon: <Search className="h-5 w-5" />,
      title: "Acesse Rapidamente",
      description: "Use Ctrl+K para acessar qualquer funcionalidade rapidamente."
    }
  ];

  return (
    <>
      <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {isCitizen ? "Primeiro acesso?" : "Bem-vindo ao CODEMA!"}
                </CardTitle>
                <CardDescription>
                  {isCitizen 
                    ? "Descubra como participar ativamente das questões ambientais de Itanhomi"
                    : "Explore as funcionalidades do sistema de gestão ambiental"
                  }
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Quick Tips */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Badge variant="outline">Dicas Rápidas</Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border">
                    <div className="p-1 bg-primary/10 rounded">
                      {tip.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{tip.title}</h4>
                      <p className="text-xs text-muted-foreground">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleStartTour}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Iniciar Tour Guiado
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/criar-relatorio')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {isCitizen ? "Criar Primeiro Relatório" : "Novo Relatório"}
              </Button>

              {!isCitizen && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/reunioes')}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Ver Reuniões
                </Button>
              )}
            </div>

            {/* Additional info for citizens */}
            {isCitizen && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">💡 Você sabia?</h4>
                <p className="text-sm text-blue-800">
                  O CODEMA (Conselho Municipal de Defesa do Meio Ambiente) é um órgão consultivo 
                  que trabalha para proteger o meio ambiente de Itanhomi. Seus relatórios ajudam 
                  o conselho a tomar decisões importantes para nossa cidade!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Guided Tour */}
      <GuidedTour
        steps={tourSteps}
        isOpen={tour.isOpen}
        onClose={tour.closeTour}
        onComplete={tour.completeTour}
        currentStep={tour.currentStep}
        onStepChange={tour.setCurrentStep}
      />
    </>
  );
}

// Hook to manage welcome guide state
export function useWelcomeGuide() {
  const [isVisible, setIsVisible] = React.useState(false);
  const { profile } = useAuth();

  React.useEffect(() => {
    if (profile) {
      // Check if user has seen the welcome guide
      const hasSeenGuide = localStorage.getItem(`welcome-guide-${profile.role}`);
      if (!hasSeenGuide) {
        setIsVisible(true);
      }
    }
  }, [profile]);

  const dismiss = () => {
    setIsVisible(false);
    if (profile) {
      localStorage.setItem(`welcome-guide-${profile.role}`, 'true');
    }
  };

  const show = () => {
    setIsVisible(true);
  };

  return {
    isVisible,
    dismiss,
    show
  };
}