import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Calendar, 
  FileText, 
  User,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ImpedimentoConselheiro } from '@/types/conselheiro';

interface ImpedimentosListProps {
  conselheiroId: string;
  impedimentos: ImpedimentoConselheiro[];
  onEdit?: (impedimento: ImpedimentoConselheiro) => void;
  onDelete?: (id: string) => void;
  onToggleStatus?: (id: string, ativo: boolean) => void;
  canEdit?: boolean;
}

const ImpedimentosList: React.FC<ImpedimentosListProps> = ({
  conselheiroId,
  impedimentos,
  onEdit,
  onDelete,
  onToggleStatus,
  canEdit = false
}) => {
  const impedimentosAtivos = impedimentos.filter(i => i.ativo);
  const impedimentosInativos = impedimentos.filter(i => !i.ativo);

  const getTipoLabel = (tipo: string): string => {
    const tipoMap: Record<string, string> = {
      'interesse_pessoal': 'Interesse Pessoal',
      'parentesco': 'Parentesco',
      'interesse_profissional': 'Interesse Profissional',
      'outros': 'Outros'
    };
    return tipoMap[tipo] || tipo;
  };

  const getTipoIcon = (tipo: string): string => {
    const iconMap: Record<string, string> = {
      'interesse_pessoal': '👤',
      'parentesco': '👨‍👩‍👧‍👦',
      'interesse_profissional': '💼',
      'outros': '📋'
    };
    return iconMap[tipo] || '📋';
  };

  const getTipoColor = (tipo: string): string => {
    const colorMap: Record<string, string> = {
      'interesse_pessoal': 'bg-blue-100 text-blue-800',
      'parentesco': 'bg-purple-100 text-purple-800',
      'interesse_profissional': 'bg-orange-100 text-orange-800',
      'outros': 'bg-gray-100 text-gray-800'
    };
    return colorMap[tipo] || 'bg-gray-100 text-gray-800';
  };

  const renderImpedimento = (impedimento: ImpedimentoConselheiro) => (
    <Card key={impedimento.id} className={`${!impedimento.ativo ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getTipoIcon(impedimento.tipo_impedimento)}</span>
            <div>
              <CardTitle className="text-base">
                {getTipoLabel(impedimento.tipo_impedimento)}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getTipoColor(impedimento.tipo_impedimento)}>
                  {impedimento.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
                {impedimento.reuniao_id && (
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    Reunião
                  </Badge>
                )}
                {impedimento.processo_id && (
                  <Badge variant="outline" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    Processo
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {canEdit && (
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => onToggleStatus?.(impedimento.id, !impedimento.ativo)}
                title={impedimento.ativo ? 'Desativar' : 'Ativar'}
              >
                {impedimento.ativo ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => onEdit?.(impedimento)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-red-600"
                onClick={() => onDelete?.(impedimento.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          {impedimento.motivo}
        </p>
        
        <div className="text-xs text-muted-foreground">
          Declarado em: {format(new Date(impedimento.declarado_em), 'dd/MM/yyyy', { locale: ptBR })}
        </div>
      </CardContent>
    </Card>
  );

  if (!impedimentos || impedimentos.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Nenhum impedimento declarado para este conselheiro.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {impedimentosAtivos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-red-500">●</span>
            Impedimentos Ativos ({impedimentosAtivos.length})
          </h3>
          <div className="grid gap-3">
            {impedimentosAtivos.map(renderImpedimento)}
          </div>
        </div>
      )}
      
      {impedimentosInativos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
            <span className="text-gray-400">●</span>
            Impedimentos Inativos ({impedimentosInativos.length})
          </h3>
          <div className="grid gap-3">
            {impedimentosInativos.map(renderImpedimento)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpedimentosList;