import { useParams, useNavigate } from "react-router-dom";
import { useCouncillor } from "@/hooks/codema/useCouncillors";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CouncillorStatusBadge } from "@/components/codema/councillors/CouncillorStatusBadge";
import { MandateTimeline } from "@/components/codema/councillors/MandateTimeline";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  Edit,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const SEGMENT_LABELS = {
  poder_publico: 'Poder Público',
  sociedade_civil: 'Sociedade Civil',
  setor_produtivo: 'Setor Produtivo',
  instituicao_ensino: 'Instituição de Ensino'
};

export default function ViewCouncillorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: councillor, isLoading } = useCouncillor(id!);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="h-10 w-32 mb-6" />
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!councillor) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Conselheiro não encontrado</p>
          <Button
            variant="link"
            onClick={() => navigate('/codema/conselheiros')}
            className="mt-4"
          >
            Voltar para lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/codema/conselheiros')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button
          onClick={() => navigate(`/codema/conselheiros/${id}/edit`)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="space-y-2">
            <CardTitle className="text-2xl">{councillor.nome}</CardTitle>
            <div className="flex items-center gap-2">
              <CouncillorStatusBadge tipo={councillor.tipo} ativo={councillor.ativo} />
              {councillor.faltas_consecutivas >= 3 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {councillor.faltas_consecutivas} faltas consecutivas
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações de Representação */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Representação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Entidade</p>
                  <p className="font-medium">{councillor.entidade_representada}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Segmento</p>
                <Badge variant="outline">{SEGMENT_LABELS[councillor.segmento]}</Badge>
              </div>
              {councillor.especializacao && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Especialização</p>
                  <p className="font-medium">{councillor.especializacao}</p>
                </div>
              )}
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contato</h3>
            <div className="space-y-3">
              <a 
                href={`mailto:${councillor.email}`}
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span>{councillor.email}</span>
              </a>
              <a 
                href={`tel:${councillor.telefone}`}
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="h-5 w-5" />
                <span>{councillor.telefone}</span>
              </a>
            </div>
          </div>

          {/* Informações do Mandato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Mandato</h3>
            <MandateTimeline 
              mandatoInicio={councillor.mandato_inicio} 
              mandatoFim={councillor.mandato_fim} 
            />
          </div>

          {/* Impedimentos */}
          {councillor.impedimentos && councillor.impedimentos.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Impedimentos</h3>
              <div className="space-y-2">
                {councillor.impedimentos.map((impedimento, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-sm">{impedimento}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observações */}
          {councillor.observacoes && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Observações</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {councillor.observacoes}
              </p>
            </div>
          )}

          {/* Metadados */}
          <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
            <p>
              Cadastrado em: {format(new Date(councillor.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
            <p>
              Última atualização: {format(new Date(councillor.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}