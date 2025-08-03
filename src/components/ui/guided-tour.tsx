import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface GuidedTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  currentStep: number;
  onStepChange: (step: number) => void;
}

export function GuidedTour({
  steps,
  isOpen,
  onClose,
  onComplete,
  currentStep,
  onStepChange
}: GuidedTourProps) {
  const [targetRect, setTargetRect] = React.useState<DOMRect | null>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  React.useEffect(() => {
    if (!isOpen || !currentStepData?.target) return;

    const updateTargetRect = () => {
      const element = document.querySelector(currentStepData.target!);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      }
    };

    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);

    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [isOpen, currentStepData?.target, currentStep]);

  const getTooltipPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const position = currentStepData.position || 'bottom';
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const spacing = 20;

    switch (position) {
      case 'top':
        return {
          top: `${targetRect.top - tooltipHeight - spacing}px`,
          left: `${targetRect.left + targetRect.width / 2 - tooltipWidth / 2}px`,
        };
      case 'bottom':
        return {
          top: `${targetRect.bottom + spacing}px`,
          left: `${targetRect.left + targetRect.width / 2 - tooltipWidth / 2}px`,
        };
      case 'left':
        return {
          top: `${targetRect.top + targetRect.height / 2 - tooltipHeight / 2}px`,
          left: `${targetRect.left - tooltipWidth - spacing}px`,
        };
      case 'right':
        return {
          top: `${targetRect.top + targetRect.height / 2 - tooltipHeight / 2}px`,
          left: `${targetRect.right + spacing}px`,
        };
      default:
        return {
          top: `${targetRect.bottom + spacing}px`,
          left: `${targetRect.left + targetRect.width / 2 - tooltipWidth / 2}px`,
        };
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      onStepChange(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    onStepChange(stepIndex);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Highlight */}
      {targetRect && (
        <div
          className="absolute border-2 border-primary rounded-md shadow-lg pointer-events-none animate-pulse"
          style={{
            top: `${targetRect.top - 4}px`,
            left: `${targetRect.left - 4}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
          }}
        />
      )}

      {/* Tooltip */}
      <Card 
        className="absolute w-80 shadow-xl border-2 border-primary/20 animate-fade-in"
        style={getTooltipPosition()}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {currentStep + 1} de {steps.length}
              </Badge>
              <CardTitle className="text-base">{currentStepData.title}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-sm mb-4">
            {currentStepData.description}
          </CardDescription>

          {/* Action button if provided */}
          {currentStepData.action && (
            <div className="mb-4">
              <Button
                size="sm"
                variant="outline"
                onClick={currentStepData.action.onClick}
                className="w-full"
              >
                {currentStepData.action.label}
              </Button>
            </div>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-4">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => handleStepClick(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentStep
                    ? "bg-primary scale-125"
                    : index < currentStep
                    ? "bg-primary/60"
                    : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-3 w-3" />
              Anterior
            </Button>

            <Button
              size="sm"
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {isLastStep ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Concluir
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="h-3 w-3" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for managing guided tour state
export function useGuidedTour(_steps: TourStep[]) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);

  const startTour = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  const closeTour = () => {
    setIsOpen(false);
  };

  const completeTour = () => {
    setIsOpen(false);
    // Mark tour as completed in localStorage
    localStorage.setItem('tour-completed', 'true');
  };

  const resetTour = () => {
    localStorage.removeItem('tour-completed');
    startTour();
  };

  const isTourCompleted = () => {
    return localStorage.getItem('tour-completed') === 'true';
  };

  return {
    isOpen,
    currentStep,
    startTour,
    closeTour,
    completeTour,
    resetTour,
    isTourCompleted,
    setCurrentStep
  };
}