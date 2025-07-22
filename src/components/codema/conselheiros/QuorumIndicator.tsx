import { Badge } from '@/components/ui';
import { Users, Check, X } from 'lucide-react';

interface QuorumIndicatorProps {
  totalConselheiros: number;
  presentes: number;
}

export function QuorumIndicator({ totalConselheiros, presentes }: QuorumIndicatorProps) {
  const quorumNecessario = Math.floor(totalConselheiros / 2) + 1;
  const quorumAtingido = presentes >= quorumNecessario;
  
  return (
    <div className="flex items-center gap-2">
      <Users className="h-4 w-4" />
      <span className="text-sm">
        {presentes}/{totalConselheiros} presentes
      </span>
      <Badge variant={quorumAtingido ? 'default' : 'destructive'}>
        {quorumAtingido ? (
          <>
            <Check className="h-3 w-3 mr-1" />
            Quórum atingido
          </>
        ) : (
          <>
            <X className="h-3 w-3 mr-1" />
            Quórum não atingido
          </>
        )}
      </Badge>
    </div>
  );
}