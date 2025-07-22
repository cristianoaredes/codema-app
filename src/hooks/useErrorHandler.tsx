import * as React from "react";
import { ErrorInfo, UserError } from "@/components/error/ErrorBoundary";

/**
 * Hook customizado para gerenciamento de erros
 * Fornece funcionalidades para capturar, exibir e limpar erros de forma reativa
 */
export function useErrorHandler(): {
  error: ErrorInfo | null;
  handleError: (errorInfo: ErrorInfo) => void;
  clearError: () => void;
  retry: () => void;
  ErrorComponent: JSX.Element | null;
} {
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
