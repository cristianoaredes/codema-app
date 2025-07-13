import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CouncillorStatusBadgeProps {
  tipo: 'titular' | 'suplente';
  ativo: boolean;
  className?: string;
}

export function CouncillorStatusBadge({ tipo, ativo, className }: CouncillorStatusBadgeProps) {
  const variant = ativo ? 'default' : 'secondary';
  const text = tipo === 'titular' ? 'Titular' : 'Suplente';
  
  return (
    <Badge 
      variant={variant}
      className={cn(
        tipo === 'titular' && ativo && 'bg-green-600 hover:bg-green-700',
        tipo === 'suplente' && ativo && 'bg-blue-600 hover:bg-blue-700',
        !ativo && 'bg-gray-400',
        className
      )}
    >
      {text} {!ativo && '(Inativo)'}
    </Badge>
  );
}