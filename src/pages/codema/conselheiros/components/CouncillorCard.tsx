import { Councillor } from "@/types/codema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CouncillorStatusBadge } from "@/components/codema/councillors/CouncillorStatusBadge";
import { MandateTimeline } from "@/components/codema/councillors/MandateTimeline";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Building2, 
  Mail, 
  Phone, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CouncillorCardProps {
  councillor: Councillor;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

const SEGMENT_LABELS = {
  poder_publico: 'Poder Público',
  sociedade_civil: 'Sociedade Civil',
  setor_produtivo: 'Setor Produtivo',
  instituicao_ensino: 'Instituição de Ensino'
};

export function CouncillorCard({ councillor, onEdit, onDelete, onView }: CouncillorCardProps) {
  const hasExcessiveAbsences = councillor.faltas_consecutivas >= 3;

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{councillor.nome}</CardTitle>
            <div className="flex items-center gap-2">
              <CouncillorStatusBadge tipo={councillor.tipo} ativo={councillor.ativo} />
              {hasExcessiveAbsences && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {councillor.faltas_consecutivas} faltas
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>{councillor.entidade_representada}</span>
          </div>
          <Badge variant="outline">{SEGMENT_LABELS[councillor.segmento]}</Badge>
          {councillor.especializacao && (
            <p className="text-xs text-muted-foreground">{councillor.especializacao}</p>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <a 
            href={`mailto:${councillor.email}`} 
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Mail className="h-4 w-4" />
            <span className="truncate">{councillor.email}</span>
          </a>
          <a 
            href={`tel:${councillor.telefone}`} 
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span>{councillor.telefone}</span>
          </a>
        </div>

        <MandateTimeline 
          mandatoInicio={councillor.mandato_inicio} 
          mandatoFim={councillor.mandato_fim} 
        />
      </CardContent>
    </Card>
  );
}