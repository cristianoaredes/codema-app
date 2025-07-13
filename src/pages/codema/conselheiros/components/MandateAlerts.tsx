import { useExpiringMandates } from "@/hooks/codema/useCouncillors";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Calendar } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export function MandateAlerts() {
  const { data: expiringMandates, isLoading } = useExpiringMandates(30);

  if (isLoading) {
    return <Skeleton className="h-20 w-full" />;
  }

  if (!expiringMandates || expiringMandates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {expiringMandates.map((councillor) => {
        const daysRemaining = differenceInDays(new Date(councillor.mandato_fim), new Date());
        const urgency = daysRemaining <= 7 ? 'destructive' : 'default';
        
        return (
          <Alert key={councillor.id} variant={urgency}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Mandato expirando</AlertTitle>
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>
                  <strong>{councillor.nome}</strong> ({councillor.tipo})
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <Calendar className="h-3 w-3" />
                  {daysRemaining} dias restantes
                </span>
              </div>
              <div className="text-sm mt-1">
                Mandato expira em {format(new Date(councillor.mandato_fim), "dd/MM/yyyy", { locale: ptBR })}
              </div>
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}