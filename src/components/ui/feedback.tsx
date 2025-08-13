import { AlertCircle, Info, RefreshCw } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export function ErrorState({
  title = "Ocorreu um erro",
  description = "Tente novamente em instantes.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-6 gap-3", className)}>
      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
        <AlertCircle className="h-5 w-5 text-red-600" />
      </div>
      <h3 className="font-semibold text-red-700">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" /> Tentar novamente
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title = "Nenhum registro",
  description = "Sem dados para exibir.",
  className,
  action,
}: {
  title?: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-6 gap-3", className)}>
      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
        <Info className="h-5 w-5 text-blue-600" />
      </div>
      <h3 className="font-semibold text-blue-700">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
      {action}
    </div>
  );
}


