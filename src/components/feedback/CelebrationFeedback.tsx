import * as React from "react";
import { 
  CheckCircle, 
  Star, 
  Trophy, 
  Zap, 
  Target,
  Award,
  PartyPopper,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface CelebrationProps {
  type: 'success' | 'milestone' | 'achievement' | 'completion';
  title: string;
  message: string;
  points?: number;
  badge?: string;
  nextAction?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  onComplete?: () => void;
  showConfetti?: boolean;
}

const celebrationIcons = {
  success: CheckCircle,
  milestone: Trophy,
  achievement: Award,
  completion: Target
};

const celebrationColors = {
  success: 'text-green-600 bg-green-100',
  milestone: 'text-yellow-600 bg-yellow-100',
  achievement: 'text-purple-600 bg-purple-100',
  completion: 'text-blue-600 bg-blue-100'
};

export function CelebrationModal({
  type,
  title,
  message,
  points,
  badge,
  nextAction,
  duration = 5000,
  onComplete,
  showConfetti = true
}: CelebrationProps) {
  const [isVisible, setIsVisible] = React.useState(true);
  const [confettiPieces, setConfettiPieces] = React.useState<Array<{ id: number; delay: number; color: string }>>([]);
  
  const IconComponent = celebrationIcons[type];

  React.useEffect(() => {
    if (showConfetti) {
      // Generate confetti pieces
      const pieces = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        delay: Math.random() * 1000,
        color: ['#16a34a', '#facc15', '#a855f7', '#3b82f6', '#f97316'][Math.floor(Math.random() * 5)]
      }));
      setConfettiPieces(pieces);
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete, showConfetti]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="absolute w-2 h-2 rounded-full animate-[celebration-confetti_2s_ease-out_forwards]"
              style={{
                backgroundColor: piece.color,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${piece.delay}ms`
              }}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <div className="bg-card rounded-lg shadow-xl p-8 max-w-md w-full mx-4 animate-scale-in">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mx-auto animate-[celebration-bounce_1s_ease-in-out]",
            celebrationColors[type]
          )}>
            <IconComponent className="w-8 h-8" />
          </div>

          {/* Title and Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            <p className="text-muted-foreground">{message}</p>
          </div>

          {/* Points and Badge */}
          {(points || badge) && (
            <div className="flex items-center justify-center gap-4">
              {points && (
                <Badge variant="secondary" className="text-sm">
                  <Star className="w-3 h-3 mr-1" />
                  +{points} pontos
                </Badge>
              )}
              {badge && (
                <Badge variant="outline" className="text-sm">
                  <Award className="w-3 h-3 mr-1" />
                  {badge}
                </Badge>
              )}
            </div>
          )}

          {/* Action Button */}
          {nextAction && (
            <Button 
              onClick={nextAction.onClick}
              className="w-full"
            >
              {nextAction.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Toast-style celebration for smaller wins
export function CelebrationToast({
  type,
  title,
  message,
  duration = 3000,
  onComplete
}: Omit<CelebrationProps, 'nextAction' | 'points' | 'badge' | 'showConfetti'>) {
  const [isVisible, setIsVisible] = React.useState(true);
  const IconComponent = celebrationIcons[type];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={cn(
        "bg-card border rounded-lg shadow-lg p-4 max-w-sm",
        "transform transition-all duration-300 hover:scale-105"
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
            celebrationColors[type]
          )}>
            <IconComponent className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline celebration for form completions
export function InlineCelebration({
  type,
  title,
  message,
  className
}: Omit<CelebrationProps, 'duration' | 'onComplete' | 'nextAction' | 'points' | 'badge' | 'showConfetti'> & {
  className?: string;
}) {
  const IconComponent = celebrationIcons[type];

  return (
    <div className={cn(
      "flex items-center gap-3 p-4 rounded-lg border",
      celebrationColors[type].replace('text-', 'border-').split(' ')[0],
      "animate-fade-in",
      className
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center",
        celebrationColors[type]
      )}>
        <IconComponent className="w-4 h-4" />
      </div>
      <div>
        <h4 className="font-medium text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// Progress celebration for multi-step processes
export function ProgressCelebration({
  currentStep,
  totalSteps,
  stepTitle,
  message,
  type = 'success'
}: {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  message: string;
  type?: CelebrationProps['type'];
}) {
  const progress = (currentStep / totalSteps) * 100;
  const IconComponent = celebrationIcons[type];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Info */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          celebrationColors[type]
        )}>
          <IconComponent className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-medium text-foreground">
            {stepTitle} ({currentStep}/{totalSteps})
          </h4>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Hook for managing celebrations
export function useCelebration() {
  const [celebration, setCelebration] = React.useState<CelebrationProps | null>(null);

  const celebrate = React.useCallback((props: CelebrationProps) => {
    setCelebration(props);
  }, []);

  const dismiss = React.useCallback(() => {
    setCelebration(null);
  }, []);

  return {
    celebration,
    celebrate,
    dismiss,
    CelebrationComponent: celebration ? (
      <CelebrationModal 
        {...celebration} 
        onComplete={() => {
          celebration.onComplete?.();
          dismiss();
        }}
      />
    ) : null
  };
}