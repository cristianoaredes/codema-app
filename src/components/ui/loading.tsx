import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Progress } from "./progress";

interface LoadingProps {
  className?: string;
  message?: string;
  progress?: number;
  type?: 'spinner' | 'progress' | 'dots';
  size?: 'sm' | 'md' | 'lg';
}

// Spinner com mensagem opcional
export function LoadingSpinner({ 
  className, 
  message, 
  size = 'md' 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  );
}

// Progress bar com porcentagem
export function LoadingProgress({ 
  progress = 0, 
  message, 
  className 
}: LoadingProps) {
  return (
    <div className={cn("w-full space-y-2", className)}>
      {message && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{message}</span>
          <span className="text-primary font-medium">{progress}%</span>
        </div>
      )}
      <Progress value={progress} className="h-2" />
    </div>
  );
}

// Dots loader animado
export function LoadingDots({ className, size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full bg-primary animate-pulse",
            sizeClasses[size]
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  );
}

// Componente de loading unificado
export function Loading({ 
  type = 'spinner', 
  ...props 
}: LoadingProps) {
  switch (type) {
    case 'progress':
      return <LoadingProgress {...props} />;
    case 'dots':
      return <LoadingDots {...props} />;
    default:
      return <LoadingSpinner {...props} />;
  }
}

// Full page loading
export function FullPageLoading({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="rounded-lg bg-card p-6 shadow-lg">
        <Loading type="spinner" size="lg" message={message} />
      </div>
    </div>
  );
}

// Inline loading para botões
export function ButtonLoading({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
}