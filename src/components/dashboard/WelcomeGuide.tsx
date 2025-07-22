import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

export const useWelcomeGuide = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('welcomeGuideSeen');
    if (!hasSeenGuide) {
      setIsVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem('welcomeGuideSeen', 'true');
    setIsVisible(false);
  };

  return { isVisible, dismiss };
};

interface WelcomeGuideProps {
  onDismiss: () => void;
}

export const WelcomeGuide: React.FC<WelcomeGuideProps> = ({ onDismiss }) => {
  const [step, setStep] = useState(0);
  const { profile } = useAuth();

  const getStepsForRole = () => {
    const steps = [];
    if (profile?.role === 'citizen') {
      steps.push(
        <div key="intro" className="space-y-2">
          <h4 className="font-semibold">Bem-vindo, Cidadão!</h4>
          <p className="text-sm text-muted-foreground">
            Vamos te mostrar como usar o sistema para participar ativamente das questões públicas do seu município.
          </p>
        </div>
      );
      steps.push(
        <div key="reports" className="space-y-2">
          <h4 className="font-semibold">Crie e Acompanhe Relatórios</h4>
          <p className="text-sm text-muted-foreground">
            Como cidadão, você pode reportar problemas e acompanhar o andamento. 
            A gestão municipal recebe, analisa e atua sobre cada relatório.
          </p>
        </div>
      );
    } else {
      steps.push(
        <div key="conselheiros" className="space-y-2">
          <h4 className="font-semibold">Gerencie os Conselheiros</h4>
          <p className="text-sm text-muted-foreground">
            Cadastre membros, controle mandatos e mantenha todas as informações organizadas em um só lugar.
          </p>
        </div>
      );
      steps.push(
        <div key="reunioes" className="space-y-2">
          <h4 className="font-semibold">Agende e Documente Reuniões</h4>
          <p className="text-sm text-muted-foreground">
            Crie pautas, convoque reuniões, registre a presença e gere atas de forma automática e transparente.
          </p>
        </div>
      );
      steps.push(
        <div key="resolucoes" className="space-y-2">
          <h4 className="font-semibold">Publique Resoluções</h4>
          <p className="text-sm text-muted-foreground">
            Elabore, aprove e publique as resoluções do conselho diretamente no portal da transparência.
          </p>
        </div>
      );
    }
    return steps;
  };

  const steps = getStepsForRole();
  const totalSteps = steps.length;

  return (
    <Dialog open={true} onOpenChange={onDismiss}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Bem-vindo ao MuniConnect!</DialogTitle>
          <DialogDescription>
            {profile?.role === 'citizen'
              ? "Descubra como participar ativamente das questões públicas do seu município."
              : "Este guia rápido mostrará como gerenciar seu conselho de forma eficiente."}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <Progress value={(step + 1) / totalSteps * 100} className="w-full" />
          <div className="p-4 bg-muted/50 rounded-lg min-h-[100px] flex items-center">
            {steps[step]}
          </div>
        </div>
        <DialogFooter className="flex justify-between w-full">
          <Button 
            variant="outline" 
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          {step < totalSteps - 1 ? (
            <Button onClick={() => setStep(s => Math.min(totalSteps - 1, s + 1))}>
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={onDismiss}>
              Concluir
              <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};