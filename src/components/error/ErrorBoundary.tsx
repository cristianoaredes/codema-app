import * as React from "react";
import { AlertTriangle, RefreshCw, Home, Bug, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ErrorInfo {
  type: 'network' | 'validation' | 'permission' | 'server' | 'client' | 'offline';
  title: string;
  message: string;
  action?: string;
  retry?: () => void;
  fallback?: React.ReactNode;
  details?: string;
  statusCode?: number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

const errorTypeColors = {
  network: 'border-orange-200 bg-orange-50 text-orange-800',
  validation: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  permission: 'border-red-200 bg-red-50 text-red-800',
  server: 'border-red-200 bg-red-50 text-red-800',
  client: 'border-blue-200 bg-blue-50 text-blue-800',
  offline: 'border-gray-200 bg-gray-50 text-gray-800'
};

const errorTypeIcons = {
  network: Wifi,
  validation: AlertTriangle,
  permission: AlertTriangle,
  server: Bug,
  client: AlertTriangle,
  offline: WifiOff
};

// Error Boundary Class Component
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    this.props.onError?.(error, errorInfo);

    // Log to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          retryCount={this.state.retryCount}
          maxRetries={this.maxRetries}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

// Default Error Fallback Component
interface ErrorFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo | null;
  onRetry: () => void;
  retryCount: number;
  maxRetries: number;
  showDetails?: boolean;
}

function ErrorFallback({
  error,
  errorInfo,
  onRetry,
  retryCount,
  maxRetries,
  showDetails = false
}: ErrorFallbackProps) {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  const errorType = React.useMemo(() => {
    if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
      return 'network';
    }
    if (error.message.includes('Permission') || error.message.includes('403')) {
      return 'permission';
    }
    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      return 'server';
    }
    return 'client';
  }, [error]);

  const canRetry = retryCount < maxRetries && errorType !== 'permission';

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-lg">Ops! Algo deu errado</CardTitle>
          <CardDescription>
            Encontramos um problema inesperado. Nossa equipe foi notificada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error.message || 'Erro desconhecido'}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-2">
            {canRetry && (
              <Button 
                onClick={onRetry} 
                className="w-full hover-lift"
                disabled={retryCount >= maxRetries}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar novamente ({maxRetries - retryCount} tentativa(s) restante(s))
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="w-full hover-lift"
            >
              <Home className="mr-2 h-4 w-4" />
              Voltar ao início
            </Button>
          </div>

          {showDetails && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                className="w-full text-xs"
              >
                {isDetailsOpen ? 'Ocultar' : 'Mostrar'} detalhes técnicos
              </Button>
              
              {isDetailsOpen && (
                <div className="text-xs bg-muted p-3 rounded-md font-mono">
                  <div><strong>Erro:</strong> {error.name}</div>
                  <div><strong>Mensagem:</strong> {error.message}</div>
                  {error.stack && (
                    <div><strong>Stack:</strong> <pre className="mt-1 text-xs overflow-auto">{error.stack}</pre></div>
                  )}
                  {errorInfo?.componentStack && (
                    <div><strong>Component Stack:</strong> <pre className="mt-1 text-xs overflow-auto">{errorInfo.componentStack}</pre></div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground">
            ID do Erro: {Date.now().toString(36)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// User-Friendly Error Display Component
export function UserError({ errorInfo, className }: { errorInfo: ErrorInfo; className?: string }) {
  const IconComponent = errorTypeIcons[errorInfo.type];
  
  return (
    <Alert className={cn(errorTypeColors[errorInfo.type], className)}>
      <IconComponent className="h-4 w-4" />
      <div className="space-y-2">
        <div className="font-semibold">{errorInfo.title}</div>
        <div className="text-sm">{errorInfo.message}</div>
        
        {errorInfo.statusCode && (
          <Badge variant="outline" className="text-xs">
            Código: {errorInfo.statusCode}
          </Badge>
        )}
        
        {errorInfo.retry && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={errorInfo.retry}
            className="mt-2 hover-lift"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            {errorInfo.action || 'Tentar novamente'}
          </Button>
        )}
      </div>
    </Alert>
  );
}

// Inline Error Display for Forms
export function InlineError({ 
  message, 
  retry, 
  className 
}: { 
  message: string; 
  retry?: () => void; 
  className?: string;
}) {
  return (
    <div className={cn(
      "flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2 error-shake",
      className
    )}>
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="flex-1">{message}</span>
      {retry && (
        <Button size="sm" variant="ghost" onClick={retry} className="h-6 p-1 hover-lift">
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// Network Error Specific Component
export function NetworkError({ 
  onRetry, 
  className 
}: { 
  onRetry?: () => void; 
  className?: string;
}) {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  React.useEffect(() => {
    if (isOnline && onRetry) {
      // Auto-retry when connection is restored
      onRetry();
    }
  }, [isOnline, onRetry]);

  return (
    <Alert className={cn("border-orange-200 bg-orange-50", className)}>
      {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
      <div className="space-y-2">
        <div className="font-semibold">
          {isOnline ? 'Problema de Conexão' : 'Sem Conexão com a Internet'}
        </div>
        <div className="text-sm">
          {isOnline 
            ? 'Não foi possível conectar com o servidor. Verifique sua conexão.'
            : 'Você está offline. Verifique sua conexão com a internet.'
          }
        </div>
        {onRetry && isOnline && (
          <Button size="sm" variant="outline" onClick={onRetry} className="hover-lift">
            <RefreshCw className="mr-2 h-3 w-3" />
            Tentar novamente
          </Button>
        )}
      </div>
    </Alert>
  );
}

// Hook for Error Handling
export function useErrorHandler() {
  const [error, setError] = React.useState<ErrorInfo | null>(null);

  const handleError = React.useCallback((errorInfo: ErrorInfo) => {
    setError(errorInfo);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const retry = React.useCallback(() => {
    if (error?.retry) {
      error.retry();
      clearError();
    }
  }, [error, clearError]);

  return {
    error,
    handleError,
    clearError,
    retry,
    ErrorComponent: error ? (
      <UserError errorInfo={error} />
    ) : null
  };
}