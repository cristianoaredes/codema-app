import { Progress } from "@/components/ui/progress";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MandateTimelineProps {
  mandatoInicio: string;
  mandatoFim: string;
}

export function MandateTimeline({ mandatoInicio, mandatoFim }: MandateTimelineProps) {
  const today = new Date();
  const startDate = new Date(mandatoInicio);
  const endDate = new Date(mandatoFim);
  
  const totalDays = differenceInDays(endDate, startDate);
  const elapsedDays = differenceInDays(today, startDate);
  const remainingDays = differenceInDays(endDate, today);
  
  const progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  const isExpiring = remainingDays <= 30 && remainingDays > 0;
  const isExpired = remainingDays < 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {format(startDate, "dd/MM/yyyy", { locale: ptBR })}
        </span>
        <span className="font-medium">
          {format(endDate, "dd/MM/yyyy", { locale: ptBR })}
        </span>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="text-sm text-muted-foreground">
        {isExpired ? (
          <span className="text-red-600 font-medium">Mandato expirado</span>
        ) : (
          <span>{remainingDays} dias restantes</span>
        )}
      </div>
      
      {isExpiring && !isExpired && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Mandato expira em {remainingDays} dias. Providencie a renovação ou substituição.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}